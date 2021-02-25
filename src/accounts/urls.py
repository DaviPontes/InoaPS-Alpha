from django.urls import path

from .views import signUp_view

urlpatterns = [
    path('signup/', signUp_view, name='signup'),
]