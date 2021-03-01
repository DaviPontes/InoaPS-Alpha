from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
import json

from .models import Stock, Watch, Log

from background.views import search_stock, get_stock_log
from accounts.views import send_user_email

# Create your views here.

def get_watched_stocks():
    watch_obj = Watch.objects.values_list('stock', flat=True).distinct()
    res=[]
    for obj in watch_obj:
        obj_stock = get_stock(obj)
        obj_dict = {
            'symbol': obj_stock.symbol,
            'name': obj_stock.name,
            'high': obj_stock.high,
            'low': obj_stock.low
        }
        res.append(obj_dict)
    return res

def get_user_watched_stocks(request, *args, **kwargs):
    watch_obj = Watch.objects.filter(user=request.user).values_list('stock', flat=True).distinct()
    res=[]
    for obj in watch_obj:
        obj_stock = get_stock(obj)
        obj_dict = {
            'symbol': obj_stock.symbol,
            'name': obj_stock.name,
            'high': obj_stock.high,
            'low': obj_stock.low
        }
        res.append(obj_dict)
    return JsonResponse({'res': res})

def get_last_stock_log(stock_symbol):
    return Log.objects.order_by('timestamp').filter(stock=stock_symbol).last()

def add_stock_log(stock, log):
    last_log = get_last_stock_log(stock.symbol)

    if last_log is None:
        last_timestamp = 0
    else:
        last_timestamp = last_log.timestamp

    if log['timestamp'] > last_timestamp:
        print('Adding log')
        new_log = Log(
            stock=stock, 
            timestamp=log['timestamp'],
            high=log['high'],
            low=log['low'],
        )
        new_log.save()

        stock.low = log['low']
        stock.high = log['high']
        stock.save()

def check_watcher(watcher):
    print("Check")
    w_user = watcher.user
    w_stock = watcher.stock
    if w_stock.high > watcher.price_sell:
        print("Sell => ", w_user.email)
        send_user_email([w_user.email], "Sell Stock", f'Stock price above the goal! Sell stock "{w_stock.symbol}".')
    elif w_stock.low < watcher.price_buy:
        print("Buy => ", w_user.email)
        send_user_email([w_user.email], "Buy Stock", f'Stock price below the goal! Buy stock "{w_stock.symbol}".')

def search_view(request, *args, **kwargs):
    src = search_stock(request.POST['input'])
    return JsonResponse({'res': src})

def create_stock(symbol):
    res_info = search_stock(symbol)
    res_val = get_stock_log(symbol, 50)
    stock_obj = Stock(symbol=symbol, name=res_info[0]['longname'], high=res_val[0]['high'], low=res_val[0]['low'])
    stock_obj.save()
    for log in reversed(res_val):
        add_stock_log(stock_obj, log)
    return stock_obj

def get_stock(symbol):
    try:
        stock_obj = Stock.objects.get(symbol=symbol)
    except:
        stock_obj = create_stock(symbol)
    return stock_obj    

def update_watch_view(request, *args, **kwargs):
    form = request.POST

    stock_obj = get_stock(form['symbol'])

    watch_obj = Watch.objects.filter(user=request.user, stock=form['symbol'])
    if len(watch_obj)>0:
        watch_obj = watch_obj[0]
    else:
        watch_obj = Watch()

    if form['watch'] == 'true':
        print(form)
        watch_obj.user = request.user
        watch_obj.stock = stock_obj
        watch_obj.price_buy = form['low']
        watch_obj.price_sell = form['high']
        watch_obj.save()
    else:
        if watch_obj.id is not None:
            watch_obj.delete()
    return HttpResponse()

def get_stock_view(request, *args, **kwargs):
    symbol = request.POST['symbol']
    stock_obj = get_stock(symbol)
    logs = get_stock_log(symbol, 50)

    try:
        watch_obj = Watch.objects.get(user=request.user, stock=stock_obj)
        watch = {
            'high-goal': float(watch_obj.price_sell),
            'low-goal': float(watch_obj.price_buy)
        }
    except:
        watch = None

    return JsonResponse({'logs': logs, 'watch': watch})
