from django.db import models
from django.contrib.auth.models import User

dp = 5
md = 10

class Stock(models.Model):
    symbol  = models.CharField(max_length=10, primary_key=True)
    name    = models.CharField(max_length=50)
    high    = models.DecimalField(decimal_places=dp, max_digits=md)
    low     = models.DecimalField(decimal_places=dp, max_digits=md)

    def __str__(self):
        return self.symbol

class Log(models.Model):
    stock       = models.ForeignKey(Stock, on_delete=models.CASCADE)
    timestamp   = models.IntegerField()
    high        = models.DecimalField(decimal_places=dp, max_digits=md)
    low         = models.DecimalField(decimal_places=dp, max_digits=md)

class Watch(models.Model):
    user        = models.ForeignKey(User, on_delete=models.CASCADE)
    stock       = models.ForeignKey(Stock, on_delete=models.CASCADE)
    price_buy   = models.DecimalField(decimal_places=dp, max_digits=md)
    price_sell  = models.DecimalField(decimal_places=dp, max_digits=md)