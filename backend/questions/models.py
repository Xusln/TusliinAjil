# backend/questions/models.py
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name

class Question(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='questions'   # ← ЭНД НЭМЭХ!
    )
    question = models.TextField()
    answer = models.TextField()
    points = models.PositiveIntegerField(default=10)

    def __str__(self):
        return self.question[:50]
    
class Result(models.Model):
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.TextField()  # Сурагчийн бичсэн хариулт
    is_correct = models.BooleanField(default=False)
    points_earned = models.PositiveIntegerField(default=0)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'question')  # Нэг асуултанд нэг удаа хариулна
        ordering = ['-answered_at']

    def __str__(self):
        return f"{self.user.username} → {self.question.question[:30]}"