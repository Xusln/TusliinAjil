from django.db import models

class Grade(models.Model):
    number = models.PositiveSmallIntegerField(unique=True)  # 1–12

    def __str__(self):
        return f"{self.number}-р анги"


class Subject(models.Model):
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('grade', 'name')

    def __str__(self):
        return f"{self.grade.number}-р анги → {self.name}"

    @property
    def total_points(self):
        return self.questions.aggregate(models.Sum('points'))['points__sum'] or 0


# questions/models.py
class Question(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    answer = models.CharField(max_length=10)  # 'A', 'B', 'C', 'D' эсвэл бусад
    points = models.PositiveIntegerField(default=10)

    # БҮГД optional болгосон
    option_a = models.CharField(max_length=255, blank=True, null=True)
    option_b = models.CharField(max_length=255, blank=True, null=True)
    option_c = models.CharField(max_length=255, blank=True, null=True)
    option_d = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.question[:50]


class Result(models.Model):
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.TextField()
    is_correct = models.BooleanField(default=False)
    points_earned = models.PositiveIntegerField(default=0)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-answered_at']

    def __str__(self):
        return f"{self.user.username} → {self.question.question[:30]}"
