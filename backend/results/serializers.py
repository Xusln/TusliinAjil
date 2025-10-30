# backend/results/serializers.py
from rest_framework import serializers
from .models import QuizResult

class QuizResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizResult
        fields = ['id', 'question', 'user_answer', 'is_correct', 'earned_points', 'answered_at']
        read_only_fields = ['user', 'is_correct', 'earned_points']