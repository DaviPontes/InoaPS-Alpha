from django.shortcuts import render
import yahooquery as yq
import pandas as pd

# Create your views here.

def search_stock(name):
    """
    Search stock by name.\n
    Return array of dict (symbol, name). 
    """
    response = []
    raw_data = yq.search(name, news_count=0)
    qts = raw_data['quotes']
    for qt in qts:
        if qt['exchange']=='SAO':
            symbol=qt['symbol']
            response.append({
                'symbol': qt['symbol'],
                'shortname': qt['shortname'] if 'shortname' in qt else None,
                'longname': qt['longname'] if 'longname' in qt else None
            })
    return response

def get_stock_log(symbol, number=1):
    """
    Get list of stock values from stock symbol.
    Return list of dict (timestamp, high, low)
    """
    response = []
    tk = yq.Ticker(symbol)
    df = tk.history(period='2d', interval='1m').tail(5 + number)
    df.index = (df.index.get_level_values('date') - (pd.Timestamp("1969-12-31 21:00:00"))) // pd.Timedelta("1ms")
    max_iter = 0
    for idx in reversed(df.index):
        if max_iter == number:
            break
        if df.high[idx] > 0 and df.low[idx] > 0:
            resp_obj = {}
            resp_obj['timestamp'] = int(idx)
            resp_obj['high'] = float(df.high[idx])
            resp_obj['low'] = float(df.low[idx])
            response.append(resp_obj)
            max_iter += 1
    return response

    