from django.shortcuts import render
from django.db.models import Prefetch
from django.db import transaction
from django.http import HttpResponse
from trello.models import List
from trello.models import Card
import json


def home(request):
	'''
        Home page view
	'''

	list_obj = List.objects.filter().prefetch_related(
        Prefetch('card_set', queryset=Card.objects.filter().order_by(
            '-position'))).order_by('position')
	return render(request, 'trello/home.html', {'list':list_obj})


def add_list(request):
    try:
	list_name = request.POST['list_name']
	list_ins = List()
	list_ins.name = list_name
	list_ins.save()
    except Exception, e:
	print '..........', str(e)
    return HttpResponse(json.dumps({'name':list_name,'id':list_ins.id}))


def add_card(request):
    card_name = request.POST['card_name']
    list_id = request.POST['list_id']
    try:
        list_obj = List.objects.get(id =list_id)
        card_ins = Card()
        card_ins.list_name = list_obj 
        card_ins.title = card_name
        card_ins.save()
    except Exception, e:
        print '.........', str(e)
    return HttpResponse(json.dumps({'name':card_name,'id':card_ins.id}))


def update_card(request):
    card_name = request.POST['card_name']
    card_id = request.POST['card_id']
    try:
        Card.objects.filter(id=card_id).update(title= card_name)
    except Exception,e:
        print str(e)
    return HttpResponse('success')


def update_list_positions(request):
    print 'order'
    array = request.POST.getlist ('order_array[]')
    #array.reverse()
    print 'aaaaaaara',array
    with transaction.atomic():
        for i,list_id in enumerate(array):
            try:
               list_obj = List.objects.get(pk=list_id)
               list_obj.position=i+1
               list_obj.save()
            except:
                pass

    return HttpResponse('success')


def update_card_positions(request):
    print 'order'
    array = json.loads(request.POST['order_array'])
#    array.reverse()
    print 'aaaaaaara', array
    with transaction.atomic():
        for list_id in array:
            print '11'
            if list_id['order']:
                order_array = list_id['order']
                order_array.reverse()
                for i, card_id in enumerate(order_array):
                    print '22'
                    try:
			card_obj=Card.objects.get(pk=card_id)
			card_obj.position=i+1
                        card_obj.save()
			print card_obj.title, card_obj.position
                    except Exception, e:
                        print e

    return HttpResponse('success')


def drag_card(request):
    list_id = request.POST['list_id']
    card_id = request.POST['card_id']
    print list_id, card_id
    try:
        list_obj = List.objects.get(id=list_id)
        Card.objects.filter(id=card_id).update(list_name=list_obj)
    except Exception, e:
        print '........', str(e)
    return HttpResponse('success')
