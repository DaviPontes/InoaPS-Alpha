from django.shortcuts import render, redirect

from stocks.views import search_view

# Create your views here.

def home_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('accounts/login', {})

    return render(request, 'home.html', {})