"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path
from backend import views

urlpatterns = [
    path('', lambda request: redirect('home/'), name='index'),
    path('home/', views.homePage, name='index'),
    path('admin/', admin.site.urls),
    path('auth/', views.auth, name='auth'),
    path('course-management/', views.courseManagement, name='courseManagement'),
    path('learning/', views.learning, name='learning'),
    path('opportunities/', views.opportunities, name='opportunities'),
    path('profile/', views.profile, name='profile'),
    path('research/', views.research, name='research'),
    path('user-Form/', views.userForm, name='userForm'),
    path('error/', views.error, name='error'),
    
]
