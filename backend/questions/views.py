from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import serializers

from .models import Question, Grade, Subject, Result
from .serializers import QuestionSerializer, GradeSerializer, SubjectSerializer, ResultSerializer
from quiz_project.utils.auth import CsrfExemptSessionAuthentication
from rest_framework.permissions import AllowAny
from .models import Result
from django.db.models import Sum  # ← Sum-ийн импорт
from rest_framework.decorators import api_view, permission_classes  # ← api_view, permission_classes
from rest_framework.permissions import IsAuthenticated  # ← IsAuthenticated
from rest_framework.response import Response  # ← Response
from rest_framework import status
from django.db.models import Sum, Count, Q, F


# ===================== GRADE =====================
class GradeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    1–12 анги, дотор нь subjects-ийг read-only үзүүлнэ
    Public: Нэвтрэх шаардлагагүй
    """
    queryset = Grade.objects.prefetch_related('subjects')
    serializer_class = GradeSerializer
    permission_classes = [AllowAny]  # 🔥 ЭНД НЭМЭХ – Бүртгэлийн хуудас дээр ачаалахад зөвшөөрнө


# ===================== SUBJECT =====================
class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Бүх subjects, question count-ийг read-only үзүүлнэ
    Public: Нэвтрэх шаардлагагүй
    """
    queryset = Subject.objects.prefetch_related('questions')
    serializer_class = SubjectSerializer
    permission_classes = [AllowAny]


# ===================== QUESTION =====================
@method_decorator(csrf_exempt, name='dispatch')
class QuestionViewSet(viewsets.ModelViewSet):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        grade = self.request.query_params.get('grade')
        subject = self.request.query_params.get('subject')
        if grade:
            qs = qs.filter(subject__grade__number=grade)
        if subject:
            qs = qs.filter(subject__name__icontains=subject)
        return qs

    def perform_create(self, serializer):
        if getattr(self.request.user, 'user_type', None) != 'teacher':
            raise PermissionDenied("Зөвхөн багш асуулт нэмэх боломжтой")

        grade_number = self.request.data.get('grade')
        if not grade_number:
            raise serializers.ValidationError({"detail": "Grade заавал оруулна уу"})

        grade, _ = Grade.objects.get_or_create(number=int(grade_number))

        # Subject-instance аль хэдийнээ validated_data дотор байна
        subject = serializer.validated_data['subject']

        if subject.grade != grade:
            subject.grade = grade
            subject.save()

        serializer.save()


    def perform_update(self, serializer):
        if getattr(self.request.user, 'user_type', None) != 'teacher':
            raise PermissionDenied("Зөвхөн багш засварлах боломжтой")

        grade_number = self.request.data.get('grade')

        if grade_number:
            grade, _ = Grade.objects.get_or_create(number=int(grade_number))
            subject = serializer.validated_data.get('subject')
            if subject and subject.grade != grade:
                subject.grade = grade
                subject.save()

        serializer.save()


    def perform_destroy(self, instance):
        if getattr(self.request.user, 'user_type', None) != 'teacher':
            raise PermissionDenied("Зөвхөн багш устгах боломжтой")
        instance.delete()


# ===================== RESULT =====================
@method_decorator(csrf_exempt, name='dispatch')
class ResultViewSet(viewsets.ModelViewSet):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Result.objects.all()
    serializer_class = ResultSerializer

    def get_queryset(self):
        # Зөвхөн өөрийнхөө хариултыг харна
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        question_id = serializer.validated_data['question'].id
        selected_answer = serializer.validated_data['selected_answer'].strip()

        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            raise serializers.ValidationError({"question": "Асуулт олдсонгүй"})

        is_correct = selected_answer.lower() == question.answer.strip().lower()
        points_earned = question.points if is_correct else 0

        serializer.save(
            user=user,
            is_correct=is_correct,
            points_earned=points_earned
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_total_points(request):
    if request.user.user_type != 'student':
        return Response(
            {'error': 'Зөвхөн сурагч нар хандах боломжтой'},
            status=status.HTTP_403_FORBIDDEN
        )

    total_points = Result.objects.filter(
        user=request.user,
        is_correct=True
    ).aggregate(total=Sum('points_earned'))['total'] or 0

    return Response({'total_points': total_points})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_weak_questions(request):
    """
    Нэвтэрсэн сурагчийн хамгийн их буруу хариулсан асуултуудыг буцаана
    "Миний сул тал" хэсэгт ашиглана
    """
    # user_type шалгалт - таны custom user модель дээр байгаа гэж үзье
    if getattr(request.user, 'user_type', None) != 'student':
        return Response(
            {"detail": "Зөвхөн сурагч хандах боломжтой"},
            status=status.HTTP_403_FORBIDDEN
        )

    stats = Result.objects.filter(user=request.user) \
        .values('question_id') \
        .annotate(
            question_text=F('question__question'),
            subject_name=F('question__subject__name'),
            grade_number=F('question__subject__grade__number'),  # ← Яг энэ зам!
            total_attempts=Count('id'),
            correct_count=Count('id', filter=Q(is_correct=True)),
            wrong_count=Count('id', filter=Q(is_correct=False)),
        ) \
        .filter(wrong_count__gt=0) \
        .order_by('-wrong_count')

    return Response(list(stats))