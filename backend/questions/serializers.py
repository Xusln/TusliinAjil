from rest_framework import serializers
from .models import Question, Category

# Ангиллын serializer
class CategorySerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(read_only=True)  # annotate-аар ирэх
    total_points = serializers.IntegerField(read_only=True)    # annotate-аар ирэх

    class Meta:
        model = Category
        fields = ['id', 'name', 'question_count', 'total_points']


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
