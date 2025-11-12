# backend/questions/serializers.py
from rest_framework import serializers
from .models import Question, Category

class CategorySerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(read_only=True)
    total_points = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'question_count', 'total_points']


class QuestionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'category', 'category_name', 'question', 'answer', 'points']
        extra_kwargs = {
            'category': {'write_only': True},  # POST-д category string ирнэ
        }