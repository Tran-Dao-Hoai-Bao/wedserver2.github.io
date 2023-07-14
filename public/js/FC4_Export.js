// Chương trình con đọc dữ liệu SQL
function fn_Table01_SQL_Show(){
    socket.emit("msg_SQL_Show", "true");
    socket.on('SQL_Show',function(data){
        fn_table_01(data);
    });
}

// Chương trình con hiển thị SQL ra bảng
function fn_table_01(data){
    if(data){
        $("#table_01 tbody").empty();
        var len = data.length;
        var txt = "<tbody>";
        if(len > 0){
            for(var i=0;i<len;i++){
                    txt += "<tr><td>"+data[i].date_time
                        +"</td><td>"+data[i].So_lon
                        +"</td><td>"+data[i].Ti_le_red
                        +"</td><td>"+data[i].Ti_le_yellow
                        +"</td><td>"+data[i].Ti_le_blule
                        +"</td><td>"+data[i].Ti_le_white
                        +"</td></tr>";
                    }
            if(txt != ""){
            txt +="</tbody>";
            $("#table_01").append(txt);
            }
        }
    }
}