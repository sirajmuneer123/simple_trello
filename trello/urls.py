from django.conf.urls import url

urlpatterns = [
    url(r'^$', 'trello.views.home', name='home'),
    url(r'^add_list/$', 'trello.views.add_list', name='add_list'),
    url(r'^add_card/$', 'trello.views.add_card', name='add_card'),
    url(r'^order_list/$', 'trello.views.update_list_positions', name='update_list_positions'),
    url(r'^order_card/$', 'trello.views.update_card_positions', name='update_card_positions'),
    url(r'^update_card/$', 'trello.views.update_card', name='update_card'),
    url(r'^drag_card/$', 'trello.views.drag_card', name='drag_card'),
    
]