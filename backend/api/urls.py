# API URL Configuration
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'tasks', views.TaskViewSet, basename='task')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'activities', views.ActivityViewSet, basename='activity')
router.register(r'statistics', views.StatisticsViewSet, basename='statistics')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/me/', views.CurrentUserView.as_view(), name='current-user'),
    
    # Router URLs
    path('', include(router.urls)),
]
