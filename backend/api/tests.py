from io import StringIO

from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Task, User


class AuthSecurityTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='alice', email='alice@example.com', password='Correct-Horse-42'
        )

    def test_login_errors_do_not_reveal_whether_email_exists(self):
        unknown = self.client.post(
            '/api/auth/login/', {'email': 'nobody@example.com', 'password': 'x'}, format='json'
        )
        wrong_password = self.client.post(
            '/api/auth/login/', {'email': 'alice@example.com', 'password': 'x'}, format='json'
        )
        self.assertEqual(unknown.status_code, 400)
        self.assertEqual(unknown.json(), wrong_password.json())

    def test_login_succeeds_with_valid_credentials(self):
        response = self.client.post(
            '/api/auth/login/',
            {'email': 'ALICE@example.com', 'password': 'Correct-Horse-42'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.json()['tokens'])

    def test_register_rejects_weak_password(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'bob', 'email': 'bob@example.com',
            'password': '123456', 'password_confirm': '123456',
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.json())

    def test_register_rejects_duplicate_email(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'alice2', 'email': 'Alice@example.com',
            'password': 'Another-Strong-99', 'password_confirm': 'Another-Strong-99',
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.json())

    def test_login_is_rate_limited(self):
        statuses = [
            self.client.post(
                '/api/auth/login/', {'email': 'alice@example.com', 'password': 'x'}, format='json'
            ).status_code
            for _ in range(15)
        ]
        self.assertIn(429, statuses)


class AccessControlTests(TestCase):
    def test_seed_endpoint_is_not_public(self):
        response = APIClient().post('/api/seed/')
        self.assertEqual(response.status_code, 404)
        self.assertFalse(User.objects.filter(username='admin').exists())

    def test_tasks_require_authentication(self):
        self.assertEqual(APIClient().get('/api/tasks/').status_code, 401)

    def test_users_only_see_their_own_tasks(self):
        owner = User.objects.create_user(username='o', email='o@example.com', password='Pw-long-enough-1')
        other = User.objects.create_user(username='p', email='p@example.com', password='Pw-long-enough-2')
        task = Task.objects.create(user=owner, title='private')
        client = APIClient()
        client.force_authenticate(other)
        self.assertEqual(client.get(f'/api/tasks/{task.id}/').status_code, 404)


class SeedDemoCommandTests(TestCase):
    def test_generates_random_password_when_not_configured(self):
        out = StringIO()
        call_command('seed_demo', stdout=out)
        admin = User.objects.get(username='admin')
        self.assertFalse(admin.check_password('admin123'))
        self.assertIn('Generated password', out.getvalue())
        self.assertEqual(admin.tasks.count(), 4)
