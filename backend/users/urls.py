# backend/users/urls.py  (эсвэл auth/urls.py-д нэмнэ үү)
from django.urls import path
from . import views

urlpatterns = [
    # Auth views (хэрэв auth app-д байгаа бол)
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/csrf/', views.csrf_view, name='csrf'),  # ← ЗӨВ: name='csrf'

    # Profile view - users app-д байгаа бол
    path('profile/', views.profile_view, name='user-profile'),
    path('leaderboard/', views.leaderboard_view, name='leaderboard')
]