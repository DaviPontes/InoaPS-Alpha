from django.contrib import admin

from .models import Stock, Log, Watch

@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ("id", "timestamp", "stock", "high", "low")

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ("symbol", "name", "high", "low")

@admin.register(Watch)
class WatchAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "stock", "price_buy", "price_sell")