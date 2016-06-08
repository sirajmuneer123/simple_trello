$(document).ready(function () {
    var list_new_id;
    $(document).on('click', '.add_card', function () {
        $(this).parent().find('.new_card').val('');
        $(this).parent().find('.new_card,.save_card,.hide_all').show();
        $(this).hide();
    });
    $(document).on('click', '.hide_all', function () {
        $(this).parent().find('.new_card,.save_card,.hide_all').hide();
        $(this).parent().find('.add_card').show();
    });
    $(document).on('click', '.add_list', function () {
        $(this).parent().find('.new_list_name').val('');
        $(this).parent().find('.new_list,.save_list,.hide_all_list').show();
        $(this).hide();
    });
    $(document).on('click', '.hide_all_list', function () {
        $(this).parent().find('.new_list,.save_list,.hide_all_list').hide();
        $(this).parent().find('.add_list').show();
    });
    $(document).on('click', '.save_list', function () {
        var list_name = $(this).parent().find('.new_list_name').val();

        var element = $(this);
        $.ajax({
            type: "POST",
            url: "/add_list/",
            data: {
                'list_name': list_name,
                'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
            },
            success: function (data) {
                var pdata = JSON.parse(data);
                var row = '';
                row = '<div class="col-sm-12 col-md-3 col-lg-3 list" data-list_id="' + pdata.id + '">';
                row += '<div class="panel panel-default">';
                row += '<div class="panel-heading">' + pdata.name + '</div>';
                row += '<div class="panel-body" data-list_id="' + pdata.id + '">';
                row += '<ul class="list-group"></ul>';
                row += '<textarea class="new_card" hidden style="min-width: 100%"></textarea>';
                row += '<button  class="btn btn-info save_card" style="display:none">Add</button>';
                row += '<span class="fa fa-times hide_all" style="display:none"></span>';
                row += '<a href="#" class="add_card">Add a card...</a>';
                row += '</div></div></div>'
                $(row).insertBefore('.list_add')
                element.parent().find('.new_list,.save_list,.hide_all_list').hide();
                element.parent().find('.add_list').show();
                order_list();
            }
        });

    });
    $(document).on('click', '.save_card', function () {
        var card_name = $(this).parent().find('.new_card').val();
        var id = $(this).parent().data('list_id');
        var element = $(this);
        $.ajax({
            type: "POST",
            url: "/add_card/",
            data: {
                'card_name': card_name,
                'list_id': id,
                'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
            },
            success: function (data) {
                var pdata = JSON.parse(data);
                var row = '';
                row += '<li data-card_id="' + pdata.id + '" class="list-group-item card">' + pdata.name + '';
                row +='<i class="fa fa-pencil card_edit" aria-hidden="true" style="float:right;cursor: pointer"></i></li>';
                element.parent().find('ul').append(row);
                element.parent().find('.new_card,.save_card,.hide_all').hide();
                element.parent().find('.add_card').show();
                order_card();
                $(".card").draggable({
                    connectToSortable: ".card_box",
                    revert: "invalid",
                    stop: function () {
                        var list_id = $(this).parent().parent().data('list_id');
                        var card_id = $(this).data('card_id');
                        list_new_id = list_id
                        $.ajax({
                            type: "POST",
                            url: "/drag_card/",
                            data: {
                                'list_id': list_id,
                                'card_id': card_id,
                                'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
                            },
                            success: function (data) {
                                if (data != 'success') {
                                    alert('failed')
                                }

                            }
                        });
                    }
                });
            }
        });
    });
    function order_list() {
        var order_array = []
        $.each($('.list'), function (i, ele) {
            if ($(ele).data('list_id') !== undefined) {
                order_array.push($(ele).data('list_id'));
            }
        });
        $.ajax({
            type: "POST",
            url: "/order_list/",
            data: {
                'order_array': order_array,
                'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
            },
            success: function (data) {

            }
        });
    }
    function order_card(id) {
        var order_array_dict ;
        var order_array = [];
        var elements;
        if (id) {
            elements = $('.list').filter(function () {
                return $(this).data('list_id') === id
            });
        } else {
            elements = $('.list')
        }
        $.each(elements, function (i, ele) {
            var order = []
            order_array_dict = {};
            $.each($(ele).find('.card'), function (i, ele) {
                if($(ele).data('card_id')!== null && $(ele).data('card_id')!== undefined){
                    order.push($(ele).data('card_id'));
                }
            })
            order_array_dict.id = $(this).data('list_id');
            order_array_dict.order = order;
            order_array.push(order_array_dict);
        });
        $.ajax({
            type: "POST",
            url: "/order_card/",
            data: {
                'order_array': JSON.stringify(order_array),
                'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
            },
            success: function (data) {

            }
        });
    }
    $(document).on('click', '.card_edit', function (e) {
        e.stopPropagation();
        $(this).parent().attr('contenteditable', true).trigger('focus');
        $(this).hide();
    });
    $(document).on('focusout', '.card', function (e) {
        e.stopPropagation();
        $(this).attr('contenteditable', false);
        $('.card_edit').show();
        card_id = $(this).data('card_id');
        card_name = $(this).text();
        $.ajax({
            type: "POST",
            url: "/update_card/",
            data: {
                'card_name': card_name,
                'card_id': card_id,
                'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
            },
            success: function (data) {
                if (data != 'success') {
                    alert('failed')
                }

            }
        });
    });
    $(".card_box").sortable({
        revert: true,
        update:function(){
          order_card(list_new_id)
        }
    });
    $(".card").draggable({
        connectToSortable: ".card_box",
        revert: "invalid",
        stop: function () {
            var list_id = $(this).parent().parent().data('list_id');
            var card_id = $(this).data('card_id');
            list_new_id = list_id
            $.ajax({
                type: "POST",
                url: "/drag_card/",
                data: {
                    'list_id': list_id,
                    'card_id': card_id,
                    'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
                },
                success: function (data) {
                    if (data != 'success') {
                        alert('failed')
                    }

                }
            });
        }
    });
    $("ul, li").disableSelection();
    $(".lists").sortable({
        revert: true,
        update:function(){
            order_list()
        }
    });
    $(".list").draggable({
        connectToSortable: ".lists",
        revert: "invalid",
        
    });
    $("div").disableSelection();
    $('#search_list_name').keyup(function () {
        $.ajax({
           type:'POST',
           url:'/search_list/',
           data:{
               'value':$(this).val(),
               'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
           },
           success:function(data){
               var pdata = $.parseJSON(data);
               var row ='';
               
               if(pdata){
                   $('.lists div').remove();
      
               $.each(pdata.master_list, function (i, ele) {
               
               row +='<div class="col-sm-12 col-md-3 col-lg-3 list" data-list_id="'+ele.id+'">';
               row += '<div class="panel panel-default">';
               row += '<div class="panel-heading">'+ele.name+'</div>';
               row += '<div class="panel-body" data-list_id="'+ele.id+'">';
               row += '<ul class="list-group card_show card_box" style="min-height:20px">'
               $.each(ele.cards, function (i1, ele1) {
                    row += '<li data-card_id="'+ele1.id+'" class="list-group-item card ui-widget-content">'+ele1.title+'<i class="fa fa-pencil card_edit" aria-hidden="true" style="float:right;cursor: pointer"></i></li>';
               });
               row += '</ul>'
               row += '<textarea class="new_card" hidden style="min-width: 100%"></textarea>';
               row += '<button  class="btn btn-info save_card" style="display:none">Add</button>';
               row += '<span class="fa fa-times hide_all" style="display:none"></span>';
               row += '<a href="#" class="add_card">Add a card...</a>';
               row += '</div>';
               row += '</div>';
               row += '</div>';
               });
               row += '<div class="col-sm-12 col-md-3 col-lg-3 list_add">';
               row += '<div class="form-group new_list" hidden>';
               row += '<input  type="text" class="form-control new_list_name" placeholder="Enter list name" style="min-width: 100%"/>';
               row += '</div>';
               row += '<button  class="btn btn-info save_list" style="display:none">Add</button>';
               row += '<span class="fa fa-times hide_all_list" style="display:none"></span>';
               row += '<a href="#" class="add_list">Add a list...</a>';
               row += '</div>';
               $('.lists').append(row);
               }else{
                   alert('not found');
               }
               
           }
        });
    });
});