# Serializers for API
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, Task, Notification, Activity, Statistics


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'role']
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate_email(self, value):
        # Login is by email, so it must identify exactly one account
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('هذا البريد الإلكتروني مستخدم بالفعل')
        return value
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'كلمات المرور غير متطابقة'})
        candidate = User(
            username=data.get('username'),
            email=data.get('email'),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
        )
        try:
            validate_password(data['password'], user=candidate)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        # Same error for unknown email and wrong password to avoid account enumeration
        invalid = serializers.ValidationError(
            {'non_field_errors': ['البريد الإلكتروني أو كلمة المرور غير صحيحة']}
        )
        
        user = User.objects.filter(email__iexact=email).order_by('id').first()
        if user is None:
            # Run the hasher anyway so response time does not reveal whether the email exists
            User().set_password(password)
            raise invalid
        
        if not user.check_password(password) or not user.is_active:
            raise invalid
        
        data['user'] = user
        return data


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""
    formatted_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'priority', 'due_date', 'completed', 'created_at', 'updated_at', 'formatted_date']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_formatted_date(self, obj):
        if obj.due_date:
            months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                     'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
            return f'{obj.due_date.day} {months[obj.due_date.month - 1]}'
        return None


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'title', 'description', 'type', 'is_read', 'created_at', 'time_ago']
        read_only_fields = ['id', 'created_at']
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f'منذ {diff.days} يوم'
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f'منذ {hours} ساعة'
        elif diff.seconds >= 60:
            minutes = diff.seconds // 60
            return f'منذ {minutes} دقيقة'
        else:
            return 'منذ لحظات'


class ActivitySerializer(serializers.ModelSerializer):
    """Serializer for Activity model"""
    time_ago = serializers.CharField(read_only=True)
    
    class Meta:
        model = Activity
        fields = ['id', 'type', 'icon', 'title', 'created_at', 'time_ago']
        read_only_fields = ['id', 'created_at']


class StatisticsSerializer(serializers.ModelSerializer):
    """Serializer for Statistics model"""
    class Meta:
        model = Statistics
        fields = '__all__'


class ChartDataSerializer(serializers.Serializer):
    """Serializer for chart data"""
    labels = serializers.ListField(child=serializers.CharField())
    revenue = serializers.ListField(child=serializers.DecimalField(max_digits=12, decimal_places=2))
    expenses = serializers.ListField(child=serializers.DecimalField(max_digits=12, decimal_places=2))


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    active_users = serializers.IntegerField()
    completed_projects = serializers.IntegerField()
    conversion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    sales_distribution = serializers.DictField()
