from django.urls import path

from .views import search_view

urlpatterns = [
    path('search/', search_view, name='search'),
    path('watched_stocks/', search_view, name='watched_stocks')
]