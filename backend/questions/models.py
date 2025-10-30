# backend/questions/models.py
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name

class Question(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    question = models.TextField()
    answer = models.CharField(max_length=255)
    points = models.PositiveIntegerField(default=5)
    def __str__(self): return self.question[:50]