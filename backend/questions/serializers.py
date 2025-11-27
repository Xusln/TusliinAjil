# backend/questions/serializers.py
from rest_framework import serializers
from .models import Question, Category, Result


# 1. АНГИЛАЛ СЕРИАЛИЗЕР — ЗӨВХӨН Category model-д зориулагдана!
class CategorySerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(read_only=True)
    total_points = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category                    # ЗӨВ MODEL
        fields = ['id', 'name', 'question_count', 'total_points']


# 2. АСУУЛТЫН СЕРИАЛИЗЕР — ЗӨВХӨН Question model-д зориулагдана!
class QuestionSerializer(serializers.ModelSerializer):
    # POST-д category string-ээр ирнэ (жишээ: "Түүх")
    category = serializers.CharField(write_only=True)
    
    # GET-д category-ийн нэрийг харуулна
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Question                     # ЗӨВ MODEL
        fields = ['id', 'category', 'category_name', 'question', 'answer', 'points']

class ResultSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question', read_only=True)
    correct_answer = serializers.CharField(source='question.answer', read_only=True)
    category_name = serializers.CharField(source='question.category.name', read_only=True)

    class Meta:
        model = Result
        fields = ['id', 'question', 'question_text', 'category_name', 'selected_answer',
                  'is_correct', 'points_earned', 'correct_answer', 'answered_at']
        read_only_fields = ['is_correct', 'points_earned', 'correct_answer']