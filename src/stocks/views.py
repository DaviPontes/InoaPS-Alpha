from django.shortcuts import render
from django.http import JsonResponse

from .models import Stock, Watch, Log

from background.views import search_stock

# Create your views here.

def get_watched_stocks():
    return Watch.objects.values_list('stock', flat=True).distinct()

def get_last_stock_log(stock_symbol):
    return Log.objects.order_by('timestamp').filter(stock=stock_symbol).last()

def add_stock_log(stock_symbol, log):
    last_log = get_last_stock_log(stock_symbol)
    if log.timestamp > last_log.timestamp:
        new_log = Log(
            stock=stock_symbol, 
            timestamp=log.timestamp,
            high=log.high,
            low=log.low,
        )
        new_log.save()

        stock = Stock.objects.get(symbol=stock_symbol)
        stock.low = log.low
        stock.high = log.high
        stock.save()

def check_watcher(watcher):
    w_user = watcher.user
    w_stock = watcher.stock
    if w_stock.high > watcher.price_sell:
        print("Sell")
    elif w_stock.low < watcher.price_buy:
        print("Buy")

def search_view(request, *args, **kwargs):
    print(request.POST['input'])
    src = search_stock(request.POST['input'])
    print(src)
    #return context
    return JsonResponse({'res': src})