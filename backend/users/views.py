# backend/users/views.py
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import json

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return Response({'error': 'Нэр болон нууц үг шаардлагатай'}, status=400)

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return Response({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'user_type': getattr(user, 'user_type', 'student')
                }
            })
        else:
            return Response({'error': 'Буруу нэр эсвэл нууц үг'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'success': True})