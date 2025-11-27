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

from .models import Question, Category, Result
from .serializers import QuestionSerializer, CategorySerializer, ResultSerializer

from quiz_project.utils.auth import CsrfExemptSessionAuthentication

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    # Статистик шууд queryset-д хийж болно → @action устгаж болно
    queryset = Category.objects.annotate(
        question_count=models.Count('questions'),  # related_name='questions' байвал
        total_points=models.Sum('questions__points')
    )
    serializer_class = CategorySerializer


@method_decorator(csrf_exempt, name='dispatch')
class QuestionViewSet(viewsets.ModelViewSet):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
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


@method_decorator(csrf_exempt, name='dispatch')
class ResultViewSet(viewsets.ModelViewSet):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Зөвхөн өөрийнхөө хариултыг харна
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        question_id = serializer.validated_data['question'].id
        selected_answer = serializer.validated_data['selected_answer'].strip()

        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            raise serializers.ValidationError({"question": "Асуулт олдсонгүй"})

        # Өмнө хариулсан эсэх
 #       if Result.objects.filter(user=user, question=question).exists():
  #          raise serializers.ValidationError({"detail": "Та энэ асуултанд аль хэдийн хариулсан байна"})

        # Зөв эсэх шалгах
        is_correct = selected_answer.lower() == question.answer.strip().lower()
        points_earned = question.points if is_correct else 0

        # Хадгалах
        serializer.save(
            user=user,
            is_correct=is_correct,
            points_earned=points_earned
        )