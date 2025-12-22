import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from users.models import CustomUser
from questions.models import Result
from django.db.models import Sum  # ← Sum-ийн импорт
from rest_framework.decorators import api_view, permission_classes  # ← api_view, permission_classes
from rest_framework.permissions import IsAuthenticated  # ← IsAuthenticated
from rest_framework.response import Response  # ← Response
from rest_framework import status
from questions.models import Grade, Subject
# CSRF token өгөх
@ensure_csrf_cookie
def csrf_view(request):
    return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE', '')})

# users/views.py-д нэмэх
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import UserProfileSerializer  # Доор үүсгэнэ

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if request.user.user_type != 'teacher':
            return Response({'error': 'Зөвхөн багш өөрийн профайлаа засварлана'}, status=403)
        
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Профайл шинэчлэгдлээ'})
        return Response(serializer.errors, status=400)
# Нэвтрэх
@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'POST метод шаардлагатай'}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return JsonResponse({'success': False, 'error': 'Нэр болон нууц үг шаардлагатай'}, status=400)

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'user_type': user.user_type  # CustomUser тул шууд авна
                }
            })

        return JsonResponse({'success': False, 'error': 'Буруу нэр эсвэл нууц үг'}, status=400)

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'JSON алдаатай'}, status=400)


# Гарах
@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'success': True, 'message': 'Амжилттай гарлаа'})
    return JsonResponse({'detail': 'POST шаардлагатай'}, status=405)


# БҮРТГЭХ — ТӨГС ХУВЬЛБАР
@csrf_exempt
def register_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST метод шаардлагатай'}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        user_type = data.get('user_type', 'student')

        # Шалгалт
        if not username or not password:
            return JsonResponse({'success': False, 'error': 'Нэр болон нууц үг шаардлагатай'}, status=400)

        if user_type not in ['student', 'teacher']:
            return JsonResponse({'success': False, 'error': "user_type буруу"}, status=400)

        if len(password) < 6:
            return JsonResponse({'success': False, 'error': 'Нууц үг 6+ тэмдэгт'}, status=400)

        # Хэрэглэгч үүсгэх
        user = CustomUser.objects.create_user(
            username=username,
            password=password,
            user_type=user_type
        )

        # 🔥 Багш бол хариуцлагатай анги, хичээл оноох
        if user_type == 'teacher':
            grades_ids = data.get('taught_grades_ids', [])
            subjects_ids = data.get('taught_subjects_ids', [])

            if not grades_ids or not subjects_ids:
                # Rollback: хэрэглэгчийг устга (transaction ашиглах нь илүү)
                user.delete()
                return JsonResponse({'success': False, 'error': 'Багш бол анги, хичээл заавал сонгоно'}, status=400)

            try:
                grades = Grade.objects.filter(id__in=grades_ids)
                subjects = Subject.objects.filter(id__in=subjects_ids)

                user.taught_grades.set(grades)
                user.taught_subjects.set(subjects)
            except Exception as e:
                user.delete()
                return JsonResponse({'success': False, 'error': 'Анги эсвэл хичээл олдсонгүй'}, status=400)

        # Автоматаар нэвтрэх
        login(request, user)

        return JsonResponse({
            'success': True,
            'message': 'Амжилттай бүртгэгдлээ!',
            'user': {
                'id': user.id,
                'username': user.username,
                'user_type': user.user_type,
                'taught_grades': list(user.taught_grades.values('id', 'number')),
                'taught_subjects': list(user.taught_subjects.values('id', 'name'))
            }
        }, status=201)

    except Exception as e:
        if 'UNIQUE' in str(e):
            return JsonResponse({'success': False, 'error': 'Энэ нэр аль хэдийн бүртгэгдсэн'}, status=400)
        return JsonResponse({'success': False, 'error': 'Серверт алдаа гарлаа'}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leaderboard_view(request):
    # Top 10 сурагч
    leaderboard = (
        Result.objects
        .filter(user__user_type='student', is_correct=True)
        .values('user__id', 'user__username')  # ← энд сурагчийн ID болон username
        .annotate(total_points=Sum('points_earned'))  # Нийт оноо
        .order_by('-total_points')[:10]  # Дээд 10
    )

    # JSON response-д илүү ойлгомжтой болгож өөрчилж болно
    data = [
        {
            'student_id': item['user__id'],
            'student_name': item['user__username'],
            'total_points': item['total_points']
        } 
        for item in leaderboard
    ]

    return Response(data)