from rest_framework import serializers
from .models import Question, Grade, Subject, Result

class SubjectSerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(source='questions.count', read_only=True)
    total_points = serializers.IntegerField(read_only=True)  # source-ийг устгав

    class Meta:
        model = Subject
        fields = ['id', 'name', 'grade', 'question_count', 'total_points']


class GradeSerializer(serializers.ModelSerializer):
    subjects = SubjectSerializer(many=True, read_only=True)

    class Meta:
        model = Grade
        fields = ['id', 'number', 'subjects']

class QuestionSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    grade_number = serializers.IntegerField(source='subject.grade.number', read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'subject', 'subject_name', 'grade_number', 'question', 'answer', 'points']




class ResultSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question', read_only=True)
    correct_answer = serializers.CharField(source='question.answer', read_only=True)
    subject_name = serializers.CharField(source='question.subject.name', read_only=True)
    grade_number = serializers.IntegerField(source='question.subject.grade.number', read_only=True)

    class Meta:
        model = Result
        fields = ['id', 'question', 'question_text', 'subject_name', 'grade_number',
                  'selected_answer', 'is_correct', 'points_earned', 'correct_answer', 'answered_at']
        read_only_fields = ['is_correct', 'points_earned', 'correct_answer']
