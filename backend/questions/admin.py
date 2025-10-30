# backend/questions/admin.py
from django.contrib import admin
from .models import Question, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'question_count')
    search_fields = ('name',)

    def question_count(self, obj):
        return obj.question_set.count()
    question_count.short_description = 'Асуултын тоо'

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'answer', 'points', 'total_score')
    list_filter = ('category', 'points')
    search_fields = ('question', 'answer', 'category__name')
    list_editable = ('points',)  # Оноо засах боломжтой

    def total_score(self, obj):
        return f"{obj.points} оноо"
    total_score.short_description = 'Оноо'

    fieldsets = (
        ('Ангилал', {
            'fields': ('category',)
        }),
        ('Асуулт', {
            'fields': ('question', 'answer')
        }),
        ('Оноо', {
            'fields': ('points',),
            'description': 'Асуултын оноо (1-100)'
        }),
    )