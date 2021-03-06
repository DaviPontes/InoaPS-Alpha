from django.core.management.base import BaseCommand, CommandError
from alphaPS.settings import SCRIPT_TIMEOUT

from stocks.views import get_watched_stocks, get_stock, add_stock_log, check_watcher
from background.views import get_stock_log
from stocks.models import Watch

import kronos
from datetime import datetime
from time import sleep

@kronos.register(SCRIPT_TIMEOUT)
class Command(BaseCommand):
    help = "B3 crawler"
    watch_log = {}

    def add_arguments(self, parser):
        parser.add_argument(
            '--loop',
            type=int,
            help='Execute b3 script continuously. Need 1 argument: loop time in minutes.',
        )

    def handle(self, *args, **options):
        print("B3!")

        if options['loop']:
            while(True):
                self.update_db()
                print('Waiting...')
                sleep(options['loop']*60)
        else:
            self.update_db()
    
    def update_db(self):
        print(datetime.now())
        stocks = get_watched_stocks()
        for stock in stocks:
            log = get_stock_log(stock['symbol'])
            add_stock_log(get_stock(stock['symbol']), log[0])
        self.checker()
    
    def checker(self):
        watchers = Watch.objects.all()
        for watcher in watchers:
            status = self.watch_log[watcher.id] if watcher.id in self.watch_log else None
            self.watch_log[watcher.id] = check_watcher(watcher, status)