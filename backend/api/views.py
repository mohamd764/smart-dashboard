# API Views for Smart Dashboard
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
import random

from .models import Task, Notification, Activity, Statistics
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    TaskSerializer, NotificationSerializer, ActivitySerializer,
    StatisticsSerializer, DashboardStatsSerializer
)


# ===========================
# Authentication Views
# ===========================

class RegisterView(APIView):
    """User registration endpoint"""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            # Create welcome notification
            Notification.objects.create(
                user=user,
                title='مرحباً بك!',
                description='تم إنشاء حسابك بنجاح. استمتع باستخدام لوحة التحكم.',
                type='success'
            )
            
            # Log activity
            Activity.objects.create(
                user=user,
                type='success',
                icon='user',
                title='تم إنشاء حساب جديد'
            )
            
            return Response({
                'message': 'تم التسجيل بنجاح',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            # Log activity
            Activity.objects.create(
                user=user,
                type='info',
                icon='user',
                title='تسجيل دخول ناجح'
            )
            
            return Response({
                'message': 'تم تسجيل الدخول بنجاح',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """User logout endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'تم تسجيل الخروج بنجاح'})
        except Exception:
            return Response({'message': 'تم تسجيل الخروج'})


class CurrentUserView(APIView):
    """Get current authenticated user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ===========================
# Task Views
# ===========================

class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet for Task CRUD operations"""
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        task = serializer.save(user=self.request.user)
        
        # Log activity
        Activity.objects.create(
            user=self.request.user,
            type='info',
            icon='check',
            title=f'تم إنشاء مهمة: {task.title}'
        )
    
    def perform_update(self, serializer):
        task = serializer.save()
        
        # Log activity
        Activity.objects.create(
            user=self.request.user,
            type='success',
            icon='check',
            title=f'تم تحديث مهمة: {task.title}'
        )
    
    def perform_destroy(self, instance):
        title = instance.title
        instance.delete()
        
        # Log activity
        Activity.objects.create(
            user=self.request.user,
            type='warning',
            icon='x',
            title=f'تم حذف مهمة: {title}'
        )
    
    @action(detail=True, methods=['patch'])
    def toggle(self, request, pk=None):
        """Toggle task completion status"""
        task = self.get_object()
        task.completed = not task.completed
        task.save()
        
        # Log activity
        status_text = 'إكمال' if task.completed else 'إلغاء إكمال'
        Activity.objects.create(
            user=request.user,
            type='success' if task.completed else 'info',
            icon='check',
            title=f'تم {status_text} مهمة: {task.title}'
        )
        
        return Response(TaskSerializer(task).data)
    
    @action(detail=False, methods=['get'])
    def progress(self, request):
        """Get task completion progress"""
        queryset = self.get_queryset()
        total = queryset.count()
        completed = queryset.filter(completed=True).count()
        percentage = round((completed / total) * 100) if total > 0 else 0
        
        return Response({
            'total': total,
            'completed': completed,
            'percentage': percentage
        })


# ===========================
# Notification Views
# ===========================

class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for Notification operations"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)
    
    @action(detail=False, methods=['patch'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().update(is_read=True)
        return Response({'message': 'تم تحديث جميع الإشعارات'})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})


# ===========================
# Activity Views
# ===========================

class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Activity (read-only)"""
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user)[:10]


# ===========================
# Statistics Views
# ===========================

class StatisticsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Statistics"""
    serializer_class = StatisticsSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Statistics.objects.all()
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get dashboard statistics"""
        # Get latest statistics or create sample data
        latest = Statistics.objects.first()
        
        if not latest:
            # Create sample data if none exists
            latest = Statistics.objects.create(
                record_date=timezone.now().date(),
                revenue=156420,
                active_users=12847,
                completed_projects=342,
                conversion_rate=24.8,
                products_sales=35,
                services_sales=25,
                subscriptions_sales=25,
                consulting_sales=15
            )
        
        total_sales = (latest.products_sales + latest.services_sales + 
                      latest.subscriptions_sales + latest.consulting_sales)
        
        return Response({
            'total_revenue': latest.revenue,
            'active_users': latest.active_users,
            'completed_projects': latest.completed_projects,
            'conversion_rate': latest.conversion_rate,
            'total_sales': 85420,
            'sales_distribution': {
                'products': float(latest.products_sales),
                'services': float(latest.services_sales),
                'subscriptions': float(latest.subscriptions_sales),
                'consulting': float(latest.consulting_sales)
            }
        })
    
    @action(detail=False, methods=['get'])
    def chart(self, request):
        """Get chart data for performance overview"""
        period = request.query_params.get('period', 'week')
        
        # Generate sample data based on period
        if period == 'week':
            labels = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
            revenue = [12000, 19000, 15000, 22000, 18000, 25000, 28000]
            expenses = [8000, 11000, 9000, 14000, 12000, 16000, 15000]
        elif period == 'month':
            labels = [f'الأسبوع {i+1}' for i in range(4)]
            revenue = [85000, 92000, 78000, 105000]
            expenses = [55000, 62000, 48000, 70000]
        else:  # year
            labels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                     'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
            revenue = [random.randint(80000, 150000) for _ in range(12)]
            expenses = [int(r * 0.6) for r in revenue]
        
        return Response({
            'labels': labels,
            'datasets': [
                {
                    'label': 'الإيرادات',
                    'data': revenue,
                    'color': '#00d9ff'
                },
                {
                    'label': 'المصروفات',
                    'data': expenses,
                    'color': '#8b5cf6'
                }
            ]
        })
