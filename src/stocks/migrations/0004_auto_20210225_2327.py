# Generated by Django 3.1.7 on 2021-02-25 23:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('stocks', '0003_auto_20210225_2324'),
    ]

    operations = [
        migrations.RenameField(
            model_name='stock',
            old_name='higher',
            new_name='high',
        ),
        migrations.RenameField(
            model_name='stock',
            old_name='lower',
            new_name='low',
        ),
    ]