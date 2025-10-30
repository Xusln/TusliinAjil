# backend/questions/serializers.py
from rest_framework import serializers
from .models import Question, Category

class CategorySerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'question_count']

    def get_question_count(self, obj):
        return obj.question_set.count()

class QuestionSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name')

    class Meta:
        model = Question
        fields = ['id', 'category', 'question', 'answer', 'points']

    def create(self, validated_data):
        category_name = validated_data.pop('category')['name']
        category, _ = Category.objects.get_or_create(name=category_name)
        return Question.objects.create(category=category, **validated_data)