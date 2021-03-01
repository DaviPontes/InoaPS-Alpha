from django.urls import path

from .views import search_view, update_watch_view, get_user_watched_stocks, get_stock_view

urlpatterns = [
    path('search/', search_view, name='search'),
    path('watched_stocks/', get_user_watched_stocks, name='watched_stocks'),
    path('update_watch/', update_watch_view, name='update_watch'),
    path('get_stock/', get_stock_view, name='get_stock'),
]