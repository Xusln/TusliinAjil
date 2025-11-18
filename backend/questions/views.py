# backend/questions/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db import models
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

# ЭНД НЭМЭХ ЭКСПОРТ!!!
from rest_framework.exceptions import ValidationError as DRFValidationError  # эсвэл:
from rest_framework import serializers  # ← ЭНД НЭМЭХ!!

from .models import Question, Category
from .serializers import QuestionSerializer, CategorySerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    # Статистик шууд queryset-д хийж болно → @action устгаж болно
    queryset = Category.objects.annotate(
        question_count=models.Count('questions'),  # related_name='questions' байвал
        total_points=models.Sum('questions__points')
    )
    serializer_class = CategorySerializer


@method_decorator(csrf_exempt, name='dispatch')
class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__name__icontains=category)
        return qs

    # ЭНД indent зөв байх ёстой!!!
    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
            raise PermissionDenied("Нэвтрэх шаардлагатай")
        if getattr(user, 'user_type', None) != 'teacher':
            raise PermissionDenied("Зөвхөн багш асуулт нэмэх боломжтой")

        category_name = serializer.validated_data.pop('category', '').strip()
        if not category_name:
            raise serializers.ValidationError({"category": "Ангилал заавал оруулна уу"})

        category, _ = Category.objects.get_or_create(
            name__iexact=category_name,
            defaults={'name': category_name.title()}
        )

        serializer.save(category=category)

    def perform_update(self, serializer):
        if getattr(self.request.user, 'user_type', None) != 'teacher':
            raise PermissionDenied("Зөвхөн багш засварлах боломжтой")

        category_name = serializer.validated_data.pop('category', None)
        if category_name:
            category_name = category_name.strip()
            if category_name:
                category, _ = Category.objects.get_or_create(
                    name__iexact=category_name,
                    defaults={'name': category_name.title()}
                )
                serializer.save(category=category)
            else:
                serializer.save()
        else:
            serializer.save()

    def perform_destroy(self, instance):
        if getattr(self.request.user, 'user_type', None) != 'teacher':
            raise PermissionDenied("Зөвхөн багш устгах боломжтой")
        instance.delete()