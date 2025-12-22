# backend/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

# questions.models.py-с импорт хийх
from questions.models import Grade, Subject  # Таны questions app-ийн замд тохируулна уу

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('student', 'student'),
        ('teacher', 'teacher'),
    )
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='student'
    )

    # 🔥 ШИНЭ: Багшийн хариуцлагатай анги, хичээлүүд
    taught_grades = models.ManyToManyField(
        Grade,
        blank=True,
        related_name='teachers',  # grade.teachers.all() гэж дуудаж болно
        verbose_name='Хариуцдаг ангиуд',
        help_text='Энэ багш хариуцдаг ангиуд'
    )
    
    taught_subjects = models.ManyToManyField(
        Subject,
        blank=True,
        related_name='teachers',  # subject.teachers.all() гэж дуудаж болно
        verbose_name='Хариуцдаг хичээлүүд',
        help_text='Энэ багш хариуцдаг хичээлүүд'
    )

    # Давхардал арилгах
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
    )

    def __str__(self):
        return self.username

    @property
    def is_teacher(self):
        """Багш мөн эсэхийг шууд шалгах"""
        return self.user_type == 'teacher'

    def get_taught_subjects_by_grade(self, grade_number):
        """Тодорхой ангийн хичээлүүдийг буцаах"""
        grade = Grade.objects.filter(number=grade_number).first()
        if not grade:
            return []
        return self.taught_subjects.filter(grade=grade)