import os
import secrets

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from api.models import Activity, Notification, Statistics, Task, User


class Command(BaseCommand):
    help = (
        'Create a demo user with sample tasks, notifications, activities and statistics. '
        'The password is taken from SEED_ADMIN_PASSWORD, or generated and printed once.'
    )

    def add_arguments(self, parser):
        parser.add_argument('--username', default='admin')
        parser.add_argument('--email', default='admin@example.com')

    @transaction.atomic
    def handle(self, *args, **options):
        username = options['username']
        email = options['email']

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"User '{username}' already exists; nothing to do."))
            return

        password = os.environ.get('SEED_ADMIN_PASSWORD')
        generated = not password
        if generated:
            password = secrets.token_urlsafe(16)

        admin = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name='أحمد',
            last_name='محمد',
            role='admin',
            avatar_url='https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        )

        tasks = [
            {'title': 'إعداد تقرير المبيعات الشهري', 'priority': 'high', 'due_date': '2026-01-14'},
            {'title': 'اجتماع مع فريق التطوير', 'priority': 'medium', 'due_date': '2026-01-13'},
            {'title': 'مراجعة عقود العملاء الجدد', 'priority': 'low', 'due_date': '2026-01-15', 'completed': True},
            {'title': 'تحديث واجهة المستخدم', 'priority': 'high', 'due_date': '2026-01-16'},
        ]
        for task_data in tasks:
            Task.objects.create(user=admin, **task_data)

        notifications = [
            {'title': 'طلب جديد', 'description': 'تم استلام طلب شراء جديد من أحمد علي', 'type': 'info'},
            {'title': 'تحديث النظام', 'description': 'تم تحديث النظام بنجاح إلى الإصدار 2.5', 'type': 'success'},
            {'title': 'تنبيه أمني', 'description': 'تم تسجيل دخول من جهاز جديد', 'type': 'warning'},
            {'title': 'دفعة مالية', 'description': 'تم استلام دفعة بقيمة $5,000', 'type': 'success', 'is_read': True},
        ]
        for notif_data in notifications:
            Notification.objects.create(user=admin, **notif_data)

        activities = [
            {'type': 'success', 'icon': 'check', 'title': 'تم إكمال المشروع بنجاح'},
            {'type': 'info', 'icon': 'user', 'title': 'انضمام عضو جديد للفريق'},
            {'type': 'warning', 'icon': 'alert', 'title': 'تنبيه: موعد تسليم قريب'},
            {'type': 'danger', 'icon': 'x', 'title': 'فشل في معالجة الدفعة'},
        ]
        for activity_data in activities:
            Activity.objects.create(user=admin, **activity_data)

        Statistics.objects.get_or_create(
            record_date=timezone.now().date(),
            defaults={
                'revenue': 156420,
                'active_users': 12847,
                'completed_projects': 342,
                'conversion_rate': 24.8,
                'products_sales': 35,
                'services_sales': 25,
                'subscriptions_sales': 25,
                'consulting_sales': 15,
            },
        )

        self.stdout.write(self.style.SUCCESS(f"Demo data created. Login email: {email}"))
        if generated:
            self.stdout.write(f'Generated password (shown once): {password}')
