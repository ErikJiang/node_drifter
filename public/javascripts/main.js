/**
 * Created by jiangink on 16/1/7.
 */
$(document).ready(function () {
    //捞瓶子
    $("#pickBtn").click(function() {
        var pickName = $("#pick-name").val(),
            pickType = $("#pick-type option:selected").val();
        console.log('pickName: '+ pickName + ' pickType: '+ pickType);
        $.ajax({
            type: "get",
            url: "/pick.do",
            data: {
                user: pickName,
                type: pickType
            },
            cache: false,
            dataType: 'json',
            success: function(data) {
                console.log('data: ', data);
                if(!data.code){
                    $('#promptModal').on('show.bs.modal', function () {
                        $(this).find('.modal-title').html('提示信息：');
                        var content = '<div class=\"text-center\">' +
                        '<h3><i class=\"fa fa-frown-o\"></i>&nbsp;'+ data.msg +'</h3></div>';
                        $(this).find('.modal-body').html(content);
                    });
                    $('#promptModal').modal('show');
                }
                else{
                    $('#resultModal').on('show.bs.modal', function () {
                        var modal = $(this);
                        var content = '';
                        modal.find('.modal-title').html('打捞结果：');
                        console.log("msg.type: >>", data.msg.type);
                        if (1 == data.code) {
                            content = '<div class=\"col-sm-12\">' +
                            '<div class=\"col-sm-4 text-right\">' +
                                '<img class=\"bottle-img\" src=\"/images/bottle.jpg\" />' +
                            '</div>' +
                            '<h3 class=\"col-sm-8\">' +
                                (data.msg.type==1 ? '<i class=\"fa fa-male\"></i>':'<i class=\"fa fa-female\"></i>') +
                                '&nbsp;'+ data.msg.owner +'&nbsp;&nbsp;'+
                                '<small>' +
                                    data.msg.showDate +
                                '</small>' +
                            '</h3>' +
                            '<p>'+ data.msg.content +'</p></div>';
                        }
                        else if (2 == data.code) {
                            content = '<div class=\"text-center\">' +
                            '<img class=\"start-img\" src="/images/starfish.jpg" />' +
                            '<h4>' +data.msg +'</h4></div>';
                        }
                        modal.find('.modal-body').html(content);
                    });
                    $('#resultModal').modal('show');
                }
            },
            error: function() {
                $('#promptModal').on('show.bs.modal', function () {
                    $(this).find('.modal-title').html('提示信息：');
                    var content = '<div class=\"text-center\">' +
                    '<h3<i class=\"fa fa-frown-o\"></i>&nbsp;打捞瓶子异常！</h3></div>';
                    $(this).find('.modal-body').html(content);
                });
                $('#promptModal').modal('show');
            }
        });
    });

    //扔瓶子
    $("#throwBtn").click(function() {
        var throwName = $("#throw-name").val(),
            throwType = $("#throw-type option:selected").val(),
            throwMsg = $("#message-text").val(),
            date = new Date(),
            time = {
                date: date,
                year: date.getFullYear(),
                month: date.getFullYear()+'-'+(date.getMonth()+1),
                day: date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
                minute: date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
                +" "+date.getHours()+":"
                +(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())
            };

        console.log('throwName: '+ throwName + ' throwType: '+ throwType + ' throwMsg: '+ throwMsg);
        $.ajax({
            type: "post",
            url: "/throw.do",
            data: {
                showDate: time.minute,
                owner: throwName,
                type: throwType,
                content: throwMsg
            },
            cache: false,
            dataType: 'json',
            success: function(data) {
                console.log('data: ', data);

                $('#promptModal').on('show.bs.modal', function () {
                    var content = '';
                    $(this).find('.modal-title').html('提示信息：');
                    if (!data.code) {
                        content = '<div class=\"text-center\">' +
                        '<h3><i class=\"fa fa-frown-o\"></i>&nbsp;' + data.msg +'</h3></div>';
                        $(this).find('.modal-body').html(content);
                    }
                    else {
                        content = '<div class=\"text-center\">' +
                        '<h3><i class=\"fa fa-smile-o\"></i>&nbsp;' + data.msg +'</h3></div>';
                        $(this).find('.modal-body').html(content);

                    }
                });
                $('#promptModal').modal('show');
            },
            error: function() {
                $('#promptModal').on('show.bs.modal', function () {
                    $(this).find('.modal-title').html('提示信息：');
                    var content = '<div class=\"text-center\">' +
                    '<h3><i class=\"fa fa-frown-o\"></i>&nbsp;投扔瓶子异常!</h3></div>';
                    $(this).find('.modal-body').html(content);
                });
                $('#promptModal').modal('show');
            }
        });
    });

    //注销
    $("#signoutBtn").click(function() {
        $.ajax({
            type: "get",
            url: "/signout.do",
            data: {},
            cache: false,
            dataType: 'json',
            error: function () {
                $('#promptModal').on('show.bs.modal', function () {
                    $(this).find('.modal-title').html('提示信息：');
                    var content = '<div class=\"text-center\">' +
                        '<h3><i class=\"fa fa-frown-o\"></i>&nbsp;注销失败!</h3></div>';
                    $(this).find('.modal-body').html(content);
                });
                $('#promptModal').modal('show');
            }
        });
    });
});

