# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from questions.models import Grade, Subject

class CustomUserInline(admin.StackedInline):
    model = CustomUser
    can_delete = False
    verbose_name_plural = 'Багш/Сурагч'

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'user_type', 'is_active', 'date_joined', 'get_taught_grades', 'get_taught_subjects']
    list_filter = ['user_type', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Төрөл ба эрх', {
            'fields': ('user_type', 'is_teacher',)
        }),
        ('Хариуцлагатай анги, хичээл', {
            'fields': ('taught_grades', 'taught_subjects'),
            'classes': ('collapse',)  # Админ дээр нууцалж болно
        }),
    )
    
    filter_horizontal = ('taught_grades', 'taught_subjects', 'groups', 'user_permissions')
    
    def get_taught_grades(self, obj):
        return ", ".join([str(g.number) for g in obj.taught_grades.all()])
    get_taught_grades.short_description = 'Ангиуд'
    
    def get_taught_subjects(self, obj):
        return ", ".join([s.name for s in obj.taught_subjects.all()[:3]])  # Эхний 3-г харуулна
    get_taught_subjects.short_description = 'Хичээлүүд'