from django.contrib import admin
from .models import Question, Result, Grade, Subject

# # ---------------- Category ----------------
# @admin.register(Category)
# class CategoryAdmin(admin.ModelAdmin):
#     list_display = ('name', 'question_count')
#     search_fields = ('name',)

#     def question_count(self, obj):
#         return obj.question_set.count()
#     question_count.short_description = 'Асуултын тоо'

# ---------------- Question ----------------
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question', 'subject', 'answer', 'points', 'total_score')
    list_filter = ('subject', 'points')
    search_fields = ('question', 'answer', 'subject__name')
    list_editable = ('points',)

    def total_score(self, obj):
        return f"{obj.points} оноо"
    total_score.short_description = 'Оноо'

    fieldsets = (
        ('Хичээл', {
            'fields': ('subject',)
        }),
        ('Асуулт', {
            'fields': ('question', 'answer')
        }),
        ('Оноо', {
            'fields': ('points',),
            'description': 'Асуултын оноо (1-100)'
        }),
    )
# ---------------- Grade ----------------
@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('number',)
    search_fields = ('number',)

# ---------------- Subject ----------------
@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'grade')
    list_filter = ('grade',)
    search_fields = ('name',)
