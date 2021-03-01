from django.urls import path

from .views import signUp_view, login_view

urlpatterns = [
    path('signup/', signUp_view, name='signup'),
    path('login/', login_view, name='login'),
]