# backend/results/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import QuizResult
from .serializers import QuizResultSerializer

class QuizResultViewSet(viewsets.ModelViewSet):
    queryset = QuizResult.objects.all()
    serializer_class = QuizResultSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)