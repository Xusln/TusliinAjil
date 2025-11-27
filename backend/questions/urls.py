# backend/questions/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'questions', views.QuestionViewSet, basename='question')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'results', views.ResultViewSet, basename='results')

urlpatterns = [
    path('', include(router.urls)),
]