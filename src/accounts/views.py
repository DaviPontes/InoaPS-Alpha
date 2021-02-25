from django.contrib.auth import login, authenticate
from django.shortcuts import render, redirect

from .forms import signUp_form

def signUp_view(request):
    if request.user.is_authenticated:
        return redirect('/', {})
        
    if request.method == 'POST':
        form = signUp_form(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('/')
    else:
        form = signUp_form()
    return render(request, 'registration/signup.html', {'form': form})