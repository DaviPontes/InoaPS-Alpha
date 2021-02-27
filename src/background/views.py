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
            print(qt)
            response.append({
                'symbol': qt['symbol'],
                'shortname': qt['shortname'] if 'shortname' in qt else None,
                'longname': qt['longname'] if 'longname' in qt else None
            })
    return response

def get_stock_log(symbol):
    """
    Get stock values from stock symbol.
    Return dict (timestamp, high, low)
    """
    response = {}
    tk = yq.Ticker(symbol)
    df = tk.history(period='1d', interval='1m').tail(5)
    df.index = (df.index.get_level_values('date') - (pd.Timestamp("1969-12-31 21:00:00"))) // pd.Timedelta("1ms")
    for idx in reversed(df.index):
        if df.high[idx] > 0 and df.low[idx] > 0:
            response['timestamp'] = idx
            response['high'] = df.high[idx]
            response['low'] = df.low[idx]
            break
    return response

    