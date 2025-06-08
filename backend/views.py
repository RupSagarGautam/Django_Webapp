from django.http import HttpResponse
from django.shortcuts import render

def homePage(request):
    return render(request, 'index.html')

def auth(request):
    return render(request, 'auth.html')

def courseManagement(request):
    return render(request, 'course-management.html')

def learning(request):
    return render(request, 'learning.html')

def opportunities(request):
    return render(request, 'opportunities.html')

def profile(request):
    return render(request, 'profile.html')

def research(request):
    return render(request, 'research.html')



