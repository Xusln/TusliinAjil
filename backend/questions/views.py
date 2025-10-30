# backend/questions/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models  # ЭНД НЭМЭХ ЁСТОЙ

# ЗӨВ ИМПОРТ
from .models import Question, Category
from .serializers import QuestionSerializer, CategorySerializer  # ЭНД ЗӨВ БИЧСЭН


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


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
        # ЗӨВХӨН БАГШ нэмнэ
        if not self.request.user.is_authenticated or self.request.user.user_type != 'teacher':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Зөвхөн багш нэмэх боломжтой")

        category_name = serializer.validated_data.pop('category')['name']
        category, _ = Category.objects.get_or_create(name=category_name)
        serializer.save(category=category)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Ангиллын статистик"""
        categories = Category.objects.annotate(
            question_count=models.Count('question'),
            total_points=models.Sum('question__points')
        )
        return Response(CategorySerializer(categories, many=True).data)