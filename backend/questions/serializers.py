from rest_framework import serializers
from .models import Question, Category

class CategorySerializer(serializers.ModelSerializer):
    category = serializers.CharField(write_only=True)  # ← ЭНД CharField болгоно!
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'category', 'category_name', 'question', 'answer', 'points']


# Асуултын serializer
class QuestionSerializer(serializers.ModelSerializer):
    # GET-д category-ийг string-аар харуулах
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'category', 'category_name', 'question', 'answer', 'points']
        extra_kwargs = {
            'category': {'write_only': True},  # POST/PUT-д category string-аар дамжуулна
        }
