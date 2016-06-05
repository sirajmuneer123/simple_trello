$(document).ready(function () {
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
                row += '<li data-card_id="' + pdata.id + '" class="list-group-item card">' + pdata.name + '</li>';
                element.parent().find('ul').append(row);
                element.parent().find('.new_card,.save_card,.hide_all').hide();
                element.parent().find('.add_card').show();
                order_card();
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
        console.log(order_array);
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
                    console.log('uhfhudsh',$(ele).data('card_id'))
                }
            })
            order_array_dict.id = $(this).data('list_id');
            order_array_dict.order = order;
            order_array.push(order_array_dict);
            console.log(order_array)
        });
        console.log(order_array);
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
        revert: true
    });
    $(".card").draggable({
        connectToSortable: ".card_box",
//      helper: "clone",
        revert: "invalid",
        stop: function () {
            console.log($(this).data('card_id'), $(this).parent().parent().data('list_id'));
            var list_id = $(this).parent().parent().data('list_id');
            var card_id = $(this).data('card_id');
            $.ajax({
                type: "POST",
                url: "/drag_card/",
                data: {
                    'list_id': list_id,
                    'card_id': card_id,
                    'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
                },
                success: function (data) {
                    setTimeout(order_card(list_id),2000);
                    //order_card(list_id);
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
    });
    $(".list").draggable({
        connectToSortable: ".lists",
        revert: "invalid",
        stop: function () {
            setTimeout(order_list(),2000);
        }
    });
    $("div").disableSelection();
});