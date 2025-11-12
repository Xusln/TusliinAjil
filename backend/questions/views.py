# backend/questions/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db import models
from django.views.decorators.csrf import csrf_exempt  # ШИНЭЭР НЭМЭГДСЭН
from django.utils.decorators import method_decorator  # ШИНЭЭР НЭМЭГДСЭН

from .models import Question, Category
from .serializers import QuestionSerializer, CategorySerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Ангиллын статистик: асуултын тоо + нийт оноо"""
        categories = Category.objects.annotate(
            question_count=models.Count('question'),
            total_points=models.Sum('question__points')
        )
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


@method_decorator(csrf_exempt, name='dispatch')  # CSRF-ГҮЙ АЖИЛЛАХ
class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__name=category)
        return qs

    def perform_create(self, serializer):
        # ЗӨВХӨН БАГШ НЭМНЭ
        if not hasattr(self.request.user, 'user_type') or self.request.user.user_type != 'teacher':
            raise PermissionDenied("Зөвхөн багш асуулт нэмэх боломжтой")

        # category нь string (name) ирж байна
        category_name = serializer.validated_data.pop('category')
        category, _ = Category.objects.get_or_create(name=category_name)
        serializer.save(category=category)