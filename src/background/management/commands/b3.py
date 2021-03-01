from django.core.management.base import BaseCommand, CommandError
import kronos
from background.views import search_stock, get_stock_log
from stocks.models import Stock, Watch, Log
from stocks.views import get_watched_stocks, get_stock, add_stock_log, check_watcher
from datetime import datetime
from alphaPS.settings import SCRIPT_TIMEOUT


@kronos.register(SCRIPT_TIMEOUT)
class Command(BaseCommand):
    help = "B3 crawler"

    def handle(self, *args, **options):
        print("B3!")
        print(datetime.now())
        self.update_db()
        
    
    def update_db(self):
        stocks = get_watched_stocks()
        for stock in stocks:
            log = get_stock_log(stock['symbol'])
            add_stock_log(get_stock(stock['symbol']), log[0])
        self.checker()
    
    def checker(self):
        watchers = Watch.objects.all()
        for watcher in watchers:
            check_watcher(watcher)