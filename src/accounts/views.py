from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from django.shortcuts import render, redirect

from .forms import signUp_form

from django.conf import settings
from django.core.mail import send_mail

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

def send_user_email(email, subject, message):
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        email,
        fail_silently=False,
    )