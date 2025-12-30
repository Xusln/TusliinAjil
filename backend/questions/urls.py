from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'grades', views.GradeViewSet, basename='grade')
router.register(r'subjects', views.SubjectViewSet, basename='subject')
router.register(r'questions', views.QuestionViewSet, basename='question')
router.register(r'results', views.ResultViewSet, basename='results')

urlpatterns = [
    path('', include(router.urls)),

    # 🔥 Student total points (function-based view)
    path(
        'student/total-points/',
        views.student_total_points,
        name='student-total-points'
    ),
    path(
        'student/weak-questions/',
        views.student_weak_questions,
        name='student-weak-questions'
    ),
]
