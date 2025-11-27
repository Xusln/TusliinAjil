# backend/auth/views.py
import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from users.models import CustomUser


# CSRF token өгөх
@ensure_csrf_cookie
def csrf_view(request):
    return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE', '')})


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
            return JsonResponse({'success': False, 'error': 'Нэр болон нууц үг заавал оруулна уу'}, status=400)

        if user_type not in ['student', 'teacher']:
            return JsonResponse({'success': False, 'error': "user_type нь 'student' эсвэл 'teacher' байх ёстой"}, status=400)

        if len(password) < 6:
            return JsonResponse({'success': False, 'error': 'Нууц үг 6+ тэмдэгт байх ёстой'}, status=400)

        # Хэрэглэгч үүсгэх
        user = CustomUser.objects.create_user(
            username=username,
            password=password,
            user_type=user_type
        )

        # Автоматаар нэвтрэх (гоё туршлага өгнө)
        login(request, user)

        return JsonResponse({
            'success': True,
            'message': 'Амжилттай бүртгэгдлээ!',
            'user': {
                'id': user.id,
                'username': user.username,
                'user_type': user.user_type
            }
        }, status=201)

    except CustomUser.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Алдаа гарлаа'}, status=500)
    except Exception as e:
        # Нэр давхардаж байгаа эсэх
        if 'UNIQUE constraint failed' in str(e) or 'username' in str(e).lower():
            return JsonResponse({'success': False, 'error': 'Энэ нэр аль хэдийн бүртгэгдсэн байна'}, status=400)
        return JsonResponse({'success': False, 'error': 'Серверт алдаа гарлаа'}, status=500)