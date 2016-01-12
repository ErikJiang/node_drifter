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
                            modal.find('.modal-footer').html("<button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\">关闭</button>");
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

    //我的瓶子
    $("#listInfoBtn").click(function () {
        $.ajax({
            type: "get",
            url: "/listInfo.do",
            data: {},
            cache: false,
            dataType: "json",
            success: function(data) {
                console.log('data===>>:', data);
                var listArr = data.msg;
                $('#listModel').on('show.bs.modal', function () {
                    var content = '';
                    $(this).find('.modal-header').html("漂流瓶列表：");
                    if (!data.code) {
                        content = '<div class=\"text-center\">' +
                        '<h3><i class=\"fa fa-frown-o\"></i>&nbsp;' + data.msg +'</h3></div>';
                        $(this).find('.modal-body').html(content);
                    }
                    else {
                        if(listArr.length) {
                            for(var i=0; i<listArr.length; i++) {
                                content += '<li class=\"list-group-item\">' +
                                '<h3>' +
                                (listArr[i].message[0][2]==1 ? '<i class=\"fa fa-male\"></i>':'<i class=\"fa fa-female\"></i>') +
                                '&nbsp;&nbsp;'+ listArr[i].message[0][0] +
                                '&nbsp;&nbsp;<small>' +
                                listArr[i].message[0][4] +
                                '</small>' +
                                '</h3>' +
                                '<p>' +
                                listArr[i].message[0][3] +
                                '</p>' +
                                '<a class=\"label label-info\" onclick=\'bottleInfo(this)\' data-dismiss=\"modal\" rel=\"'+ listArr[i]._id +'\">详情</a>' +
                                '</li>';
                            }
                        }
                        else {
                            content = '<li class=\"list-group-item\"><h3>暂无数据呈现……</h3></li>';
                        }
                        $(this).find('.list-group').html(content);
                    }
                });
                $('#listModel').modal('show');
            },
            error: function() {
                $('#promptModal').on('show.bs.modal', function () {
                    $(this).find('.modal-title').html('提示信息：');
                    var content = '<div class=\"text-center\">' +
                        '<h3><i class=\"fa fa-frown-o\"></i>&nbsp;获取瓶子列表错误!</h3></div>';
                    $(this).find('.modal-body').html(content);
                });
                $('#promptModal').modal('show');
            }
        });
    });

});

//删除该漂流瓶
function deleteBottle(obj) {
    console.log("deleteBtn---------");
    var id = $(obj).attr("name");
    $.ajax({
        type: "get",
        url: "/delete.do",
        data: {
            id: id
        },
        cache: false,
        dataType: "json",
        success: function(data) {
            console.log("delete return:>>", data);
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
        error: function () {
            $('#promptModal').on('show.bs.modal', function () {
                $(this).find('.modal-title').html('提示信息：');
                var content = '<div class=\"text-center\">' +
                    '<h3><i class=\"fa fa-frown-o\"></i>&nbsp;删除瓶子失败!</h3></div>';
                $(this).find('.modal-body').html(content);
            });
            $('#promptModal').modal('show');
        }
    });
}

//单一瓶子详细信息
function bottleInfo(obj) {
    var id = $(obj).attr("rel");
    $.ajax({
        type: "get",
        url: "/bottleInfo.do",
        data: {
            id: id
        },
        cache: false,
        dataType: "json",
        success: function (data) {
            console.log("data:>>", data);
            $('#resultModal').on('show.bs.modal', function () {
                var modal = $(this);
                var content = '',
                    footer = '';
                modal.find('.modal-title').html('漂流瓶内容：');

                content = '<div class=\"col-sm-12\">' +
                '<div class=\"col-sm-4 text-right\">' +
                '<img class=\"bottle-img\" src=\"/images/bottle.jpg\" />' +
                '</div>' +
                '<h3 class=\"col-sm-8\">' +
                (data.msg.message[0][2]==1 ? '<i class=\"fa fa-male\"></i>':'<i class=\"fa fa-female\"></i>') +
                '&nbsp;'+ data.msg.message[0][0] +'&nbsp;&nbsp;'+
                '<small>' +
                data.msg.message[0][4] +
                '</small>' +
                '</h3>' +
                '<p>'+ data.msg.message[0][3] +'</p></div>';

                modal.find('.modal-body').html(content);
                footer = '<button type=\"button\" class=\"btn btn-primary\" id=\"replyBtn\" data-dismiss=\"modal\">回复</button>' +
                '<button type=\"button\" class=\"btn btn-primary\" id=\"deleteBtn\" data-dismiss=\"modal\" name=\"'+ data.msg._id +'\" onclick=\"deleteBottle(this)\">删除</button>';
                modal.find('.modal-footer').html(footer);
            });
            $('#resultModal').modal('show');
        },
        error: function () {
            $('#promptModal').on('show.bs.modal', function () {
                $(this).find('.modal-title').html('提示信息：');
                var content = '<div class=\"text-center\">' +
                    '<h3<i class=\"fa fa-frown-o\"></i>&nbsp;打捞瓶子异常！</h3></div>';
                $(this).find('.modal-body').html(content);
            });
            $('#promptModal').modal('show');
        }
    });
}

