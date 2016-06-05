from django.contrib import admin
from trello.models import List
from trello.models import Card
# Register your models here.
admin.site.register(List)
admin.site.register(Card)
