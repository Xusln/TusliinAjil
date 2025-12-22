# users/serializers.py
from rest_framework import serializers
from .models import CustomUser
from questions.models import Grade, Subject
from questions.serializers import GradeSerializer, SubjectSerializer

class UserProfileSerializer(serializers.ModelSerializer):
    taught_grades = GradeSerializer(many=True, read_only=True)
    taught_subjects = SubjectSerializer(many=True, read_only=True)
    taught_grades_ids = serializers.PrimaryKeyRelatedField(
        queryset=Grade.objects.all(), 
        many=True, 
        required=False,
        source='taught_grades'
    )
    taught_subjects_ids = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), 
        many=True, 
        required=False,
        source='taught_subjects'
    )
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'user_type', 
            'taught_grades', 'taught_subjects',
            'taught_grades_ids', 'taught_subjects_ids'
        ]
        read_only_fields = ['id', 'username', 'user_type']