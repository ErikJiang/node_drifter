/**
 * Created by jiangink on 16/1/7.
 */


//提示信息模态框
function promptModalHandle(flag, message) {
    var promptModal = $('#promptModal');
    promptModal.on('show.bs.modal', function () {
        $(this).find('.modal-title').html('提示信息：');

        var content = '<div class=\"text-center\">' +
            '<h3><i class=\"fa ' +
            (flag ? 'fa-smile-o' : 'fa-frown-o') +
            '\"></i>&nbsp;' + message +'</h3></div>';

        $(this).find('.modal-body').html(content);
    });
    promptModal.modal('show');
}

// dialogModel 对话列表项 DOM 文本
function dialogListItem(name, date, content) {
    var curUser = $("#curUser").text();
    return '<a class=\"list-group-item ' +
        (curUser==name ? 'list-group-item-success text-left' : 'list-group-item-info text-right') +
        '\">' +
        '<h5 class=\"list-group-item-heading\">' +
        name +
        '&nbsp;&nbsp;<small>' +
        date +
        '</small></h5>' +
        '<p class=\"list-group-item-text\">' +
        content +
        '</p></a>';
}

//删除该漂流瓶
function deleteBottle(obj) {
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
            if (!data.code) {
                promptModalHandle(false, data.msg);
            }
            else {
                promptModalHandle(true, data.msg);
            }

        },
        error: function () {
            promptModalHandle(false, "删除瓶子失败!");
        }
    });
}



// 显示漂流瓶聊天对话框
function showDialogBox(obj) {
    var id = $(obj).attr("name");
    $.ajax({
        type: "get",
        url: "/bottleInfo.do",
        data: {
            id: id
        },
        cache: false,
        dataType: "json",
        success: function (data) {
            $('#dialogModel').on('show.bs.modal', function () {
                var modal = $(this);
                var content = '',
                    footer = '';
                modal.find('.modal-title').html('<i class="fa fa-users"></i>&nbsp;&nbsp;漂流瓶对话');

                content = dialogListItem(data.msg.message[0][0], data.msg.message[0][4], data.msg.message[0][3]);
                for(var i=1; i<data.msg.message.length; i++) {
                    content += dialogListItem(data.msg.message[i][0], data.msg.message[i][3], data.msg.message[i][2]);
                }
                modal.find('.list-group').html(content);

                footer = '<button type=\"button\" class=\"btn btn-primary\" ' +
                'id=\"replyBtn\" data-dismiss=\"modal\" name=\"'+ data.msg._id +'\" ' +
                'onclick=\"replyBottle(this)\">发送</button>';
                modal.find('.modal-footer').html(footer);
            });
            $('#dialogModel').modal('show');
        },
        error: function () {
            promptModalHandle(false, "显示漂流瓶对话框异常！");
        }
    });

}

//回复一个漂流瓶
function replyBottle(obj) {
    var id = $(obj).attr("name"),
        name = $("#curUser").text(),
        replyMsg = $("#replyMsg").val(),
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
    $.ajax({
        type: "post",
        url: "/reply.do",
        data: {
            id: id,
            user: name,
            showDate: time.minute,
            content: replyMsg
        },
        cache: false,
        dataType: "json",
        success: function(data) {
            console.log("reply data >>: ",data);
            promptModalHandle(true, "回复瓶子失败!");
        },
        error: function () {
            promptModalHandle(false, "回复瓶子失败!");
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

                footer = '<button type=\"button\" class=\"btn btn-primary\" ' +
                'id=\"replyBtn\" data-dismiss=\"modal\" name=\"'+ data.msg._id +'\" ' +
                'onclick=\"showDialogBox(this)\">回复</button>' +
                '<button type=\"button\" class=\"btn btn-primary\" ' +
                'id=\"deleteBtn\" data-dismiss=\"modal\" name=\"'+ data.msg._id +'\" ' +
                'onclick=\"deleteBottle(this)\">删除</button>';
                modal.find('.modal-footer').html(footer);
            });
            $('#resultModal').modal('show');
        },
        error: function () {
            promptModalHandle(false, "打捞瓶子异常！");
        }
    });
}

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
                if(!data.code){
                    promptModalHandle(false, data.msg);
                }
                else{
                    $('#resultModal').on('show.bs.modal', function () {
                        var modal = $(this);
                        var content = '',
                            footer = '';
                        modal.find('.modal-title').html('打捞结果：');
                        if (1 != data.code) {
                            content = '<div class=\"text-center\">' +
                            '<img class=\"start-img\" src="/images/starfish.jpg" />' +
                            '<h4>' +data.msg +'</h4></div>';
                            modal.find('.modal-footer').html("<button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\">关闭</button>");
                        }
                        else {
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

                            footer = '<button type=\"button\" class=\"btn btn-primary\" ' +
                            'id=\"replyBtn\" data-dismiss=\"modal\" name=\"'+ data.msg._id +'\" ' +
                            'onclick=\"showDialogBox(this)\">回复</button>' +
                            '<button type=\"button\" class=\"btn btn-primary\" ' +
                            'id=\"deleteBtn\" data-dismiss=\"modal\" name=\"'+ data.msg._id +'\" ' +
                            'onclick=\"deleteBottle(this)\">删除</button>';
                            modal.find('.modal-footer').html(footer);
                        }
                        modal.find('.modal-body').html(content);
                    });
                    $('#resultModal').modal('show');
                }
            },
            error: function() {
                promptModalHandle(false, "打捞瓶子异常！");
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
                if (!data.code) {
                    promptModalHandle(false, data.msg);
                }
                else {
                    promptModalHandle(true, data.msg);
                }
            },
            error: function() {
                promptModalHandle(false, "投扔瓶子异常!");
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
                promptModalHandle(false, "获取瓶子列表错误!");
            }
        });
    });

});
