from django.http import HttpResponse, HttpResponseRedirect
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

def userForm(request):
    v3=0
    data={}
    try:
        v1 = int(request.POST.get('v1'))
        v2 = int(request.POST.get('v2'))
        v3 = v1 + v2
        data={
            'v1': v1,
            'v2': v2,
            'output': v3
        }
        url= "/error/?output={}".format(v3)
        return HttpResponseRedirect(url)
    except:
        pass
        
    return render(request, 'userForm.html',data)

def error(request):
    if request.method=="GET":
        output = request.GET.get('output')
    return render(request, 'error.html',{'output':output})
