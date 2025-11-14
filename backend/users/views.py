import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth.decorators import login_required

# CSRF cookie өгөх
@ensure_csrf_cookie
def csrf_view(request):
    return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE', '')})

# Login
@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            if not username or not password:
                return JsonResponse({'success': False, 'error': 'Нэр болон нууц үг шаардлагатай'}, status=400)
            user = authenticate(request, username=username, password=password)
            if user:
                login(request, user)  # sessionid cookie үүсгэнэ
                return JsonResponse({
                    'success': True,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'user_type': getattr(user, 'user_type', 'student')
                    }
                })
            return JsonResponse({'success': False, 'error': 'Буруу нэр эсвэл нууц үг'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'JSON формат буруу байна'}, status=400)
    return JsonResponse({'detail': 'POST method шаардлагатай'}, status=405)

# Logout
@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'success': True})
    return JsonResponse({'detail': 'POST method шаардлагатай'}, status=405)
