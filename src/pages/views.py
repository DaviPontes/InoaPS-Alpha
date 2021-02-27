from django.shortcuts import render, redirect

from stocks.views import search_view

# Create your views here.

def home_view(request, *args, **kwargs):
    context={'title': 'hihihi'}

    if(request.POST.get('stocks/search')):
        print("This is not that cool... :(", request.GET)
        context = search_view(request)
        #return render(request, 'stocks/search.html', {})

    if not request.user.is_authenticated:
        return redirect('accounts/login', {})

    return render(request, 'home.html', context)