from django.db import models

# Create your models here.


class List(models.Model):
	name = models.CharField(max_length=100)
	position = models.IntegerField(default=1)
	
	def __unicode__(self):
		return self.name

class Card(models.Model):
	list_name = models.ForeignKey(List)
	title = models.CharField(max_length=100)
	description = models.TextField(blank=True,null=True,max_length=200)
	due_date = models.DateTimeField(null=True, blank=True)
	position = models.IntegerField(default=1)
	
	def __unicode__(self):
		return self.list_name.name

