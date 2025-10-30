# backend/questions/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router үүсгэх
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'questions', views.QuestionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]