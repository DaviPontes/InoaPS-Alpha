from django.core.management.base import BaseCommand, CommandError
import kronos
from background.views import search_stock, get_stock_log
from stocks.models import Stock, Watch, Log

@kronos.register('* * * * *')
class Command(BaseCommand):
    help = "B3 crawler"

    def add_arguments(self, parser):
        # Positional arguments
        #parser.add_argument('poll_id', nargs='+', type=int)

        # Named (optional) arguments
        parser.add_argument(
            '--setinterval',
            help='Set interval for crawler',
        )

    def handle(self, *args, **options):
        print("B3!")
        objs = Watch.objects.filter(stock='pet')
        for obj in objs:
            print(obj.user.email)
        

        if options['setinterval'] is not None:
            print(f"Interval: {options['setinterval']}s")

    
