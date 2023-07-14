// /////////////////////////++KẾT NỐI WEBSERVER VỚI PLC++/////////////////////////
// KHỞI TẠO KẾT NỐI PLC
var nodes7 = require('nodes7');  
var conn_plc = new nodes7; //PLC1
// Tạo địa chỉ kết nối (slot = 2 nếu là 300/400, slot = 1 nếu là 1200/1500)
conn_plc.initiateConnection({port: 102, host: '192.168.10.1', rack: 0, slot: 1}, PLC_connected); 

// Bảng tag trong Visual studio code
var tags_list = { 
    btt_STart_wed: 'DB4,X0.0',          
    btt_Stop_wed: 'DB4,X0.1',          
    btt_EMO_wed: 'DB4,X0.2',      
    status_v1: 'DB4,BYTE1',    
    status_v2: 'DB4,BYTE2',    
    status_v3: 'DB4,BYTE3',    
    status_v4: 'DB4,BYTE4',    
    status_dong_co: 'DB4,BYTE5',    
    status_cam_bien: 'DB4,BYTE6',    
    ti_le_red: 'DB4,INT8',    
    ti_le_yellow: 'DB4,INT10',    
    ti_le_blule: 'DB4,INT12',    
    ti_le_white: 'DB4,INT14',    
    the_tich_son: 'DB4,REAL16', 
    so_lon: 'DB4,INT20',
    so_lan_tron: 'DB4,INT22',
    actual_volume1: 'DB4,REAL24',
    actual_volume2: 'DB4,REAL28',
    actual_volume3: 'DB4,REAL32',
    actual_volume4: 'DB4,REAL36',
    so_lon_hoan_thanh: 'DB4,INT40'
};

// GỬI DỮ LIỆu TAG CHO PLC
function PLC_connected(err) {
    if (typeof(err) !== "undefined") {
        console.log(err); // Hiển thị lỗi nếu không kết nối đƯỢc với PLC
    }
    conn_plc.setTranslationCB(function(tag) {return tags_list[tag];});  // Đưa giá trị đọc lên từ PLC và mảng
    conn_plc.addItems([
      'btt_STart_wed',       
      'btt_Stop_wed',       
      'btt_EMO_wed',    
      'status_v1',       
      'status_v2',      
      'status_v3', 
      'status_v4', 
      'status_dong_co', 
      'status_cam_bien', 
      'ti_le_red', 
      'ti_le_yellow', 
      'ti_le_blule', 
      'ti_le_white', 
      'the_tich_son', 
      'so_lon', 
      'so_lan_tron', 
      'actual_volume1', 
      'actual_volume2', 
      'actual_volume3', 
      'actual_volume4', 
      'so_lon_hoan_thanh'
     
    ]);
}
// Đọc dữ liệu từ PLC và đưa vào array tags
var arr_tag_value = []; // Tạo một mảng lưu giá trị tag đọc về
function valuesReady(anythingBad, values) {
    if (anythingBad) { console.log("Lỗi khi đọc dữ liệu tag"); } // Cảnh báo lỗi
    var lodash = require('lodash'); // Chuyển variable sang array
    arr_tag_value = lodash.map(values, (item) => item);
    console.log(values); // Hiển thị giá trị để kiểm tra
}
// Hàm chức năng scan giá trị
function fn_read_data_scan(){
    conn_plc.readAllItems(valuesReady);
}
// Time cập nhật mỗi 1s
setInterval(
    () => fn_read_data_scan(),
    1000 // 1s = 1000ms
);



// /////////////////////////++THIẾT LẬP KẾT NỐI WEB (WEB BORROW)++/////////////////////////
var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);
// Home calling
app.get("/", function(req, res){
    res.render("home")
});
//

// ///////////LẬP BẢNG TAG ĐỂ GỬI QUA CLIENT (TRÌNH DUYỆT)///////////
function fn_tag(){
    io.sockets.emit("btt_STart_wed", arr_tag_value[0]);  
    io.sockets.emit("btt_Stop_wed", arr_tag_value[1]);
    io.sockets.emit("btt_EMO_wed", arr_tag_value[2]);
    io.sockets.emit("status_v1", arr_tag_value[3]);
    io.sockets.emit("status_v2", arr_tag_value[4]);
    io.sockets.emit("status_v3", arr_tag_value[5]);
    io.sockets.emit("status_v4", arr_tag_value[6]);
    io.sockets.emit("status_dong_co", arr_tag_value[7]);
    io.sockets.emit("status_cam_bien", arr_tag_value[8]);
    io.sockets.emit("ti_le_red", arr_tag_value[9]);
    io.sockets.emit("ti_le_yellow", arr_tag_value[10]);
    io.sockets.emit("ti_le_blule", arr_tag_value[11]);
    io.sockets.emit("ti_le_white", arr_tag_value[12]);
    io.sockets.emit("the_tich_son", arr_tag_value[13]);
    io.sockets.emit("so_lon", arr_tag_value[14]);
    io.sockets.emit("so_lan_tron", arr_tag_value[15]);
    io.sockets.emit("actual_volume1", arr_tag_value[16]);
    io.sockets.emit("actual_volume2", arr_tag_value[17]);
    io.sockets.emit("actual_volume3", arr_tag_value[18]);
    io.sockets.emit("actual_volume4", arr_tag_value[19]);
    io.sockets.emit("so_lon_hoan_thanh", arr_tag_value[20]);
    
}
// /////////// GỬI DỮ LIỆU BẢNG TAG ĐẾN CLIENT (TRÌNH DUYỆT) ///////////////
io.on("connection", function(socket){
    socket.on("Client-send-data", function(data){
        fn_tag();
    });
    fn_SQLSearch(); // Hàm tìm kiếm SQL
});

// HÀM GHI DỮ LIỆU XUỐNG PLC
function valuesWritten(anythingBad) {
    if (anythingBad) { console.log("SOMETHING WENT WRONG WRITING VALUES!!!!"); }
    console.log("Done writing.");
}


// ///////////DỮ LIỆU NÚT NHẤN ĐIỀU KHIỂN ///////////
io.on("connection", function(socket){
    // ///////////MÀN CHẾ ĐỘ TỰ ĐỘNG ///////////
    // Nút nhấn chế độ tự động
    socket.on("cmd_start", function(data){conn_plc.writeItems('btt_STart_wed', data, valuesWritten);});
    // Nút nhấn chế độ bằng tay
    socket.on("cmd_stop", function(data){conn_plc.writeItems('btt_Stop_wed', data, valuesWritten);});
    // Nút nhấn confirm
    socket.on("cmd_EMo", function(data){conn_plc.writeItems('btt_EMO_wed', data, valuesWritten);});
    // Ghi dữ liệu từ IO field màn hình tự động
        socket.on("cmd_Edit_Data", function(data){
            conn_plc.writeItems([
                                'ti_le_red','ti_le_yellow','ti_le_blule','ti_le_white','so_lon','the_tich_son','so_lan_tron'],
                                [data[0],data[1],data[2],data[3],data[4],data[5],data[6]
                            ], valuesWritten);  
            });



});
// Khởi tạo SQL
var mysql = require('mysql');

var sqlcon = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "SQL_PLC",
  dateStrings:true // Hiển thị không có T và Z
});
/////////////// Hàm Ghi dữ liệu SQL///////////////
function fn_sql_insert(){
    insert_trigger = arr_tag_value[0];		// Read trigger from PLC
    var sqltable_Name = "plc_data";
    // Lấy thời gian hiện tại
	var tzoffset = (new Date()).getTimezoneOffset() * 60000; //Vùng Việt Nam (GMT7+)
	var temp_datenow = new Date();
	var timeNow = (new Date(temp_datenow - tzoffset)).toISOString().slice(0, -1).replace("T"," ");
	var timeNow_toSQL = "'" + timeNow + "',";

    // Dữ liệu đọc lên từ các tag
    var So_lon = "'" + arr_tag_value[14] + "',";
    var Ti_le_red = "'" + arr_tag_value[9] + "',";
    var Ti_le_yellow = "'" + arr_tag_value[10] + "',";
    var Ti_le_blule = "'" + arr_tag_value[11] + "',";
    var Ti_le_white = "'" + arr_tag_value[12] + "'";
    // Ghi dữ liệu vào SQL
    if (insert_trigger && !old_insert_trigger)
    {
        var sql_write_str11 = "INSERT INTO " + sqltable_Name + " (date_time, So_lon, Ti_le_red, Ti_le_yellow, Ti_le_blule, Ti_le_white) VALUES (";
        var sql_write_str12 = timeNow_toSQL
                            + So_lon
                            + Ti_le_red
                            + Ti_le_yellow
                            + Ti_le_blule
                            + Ti_le_white
                            ;
        var sql_write_str1 = sql_write_str11 + sql_write_str12 + ");";
        // Thực hiện ghi dữ liệu vào SQL
		sqlcon.query(sql_write_str1, function (err, result) {
            if (err) {
                console.log(err);
             } else {
                console.log("SQL - Ghi dữ liệu thành công");
              }
			});
    }
    old_insert_trigger = insert_trigger;
}
// Hàm chức năng scan giá trị
function fn_read_data_scan(){
    conn_plc.readAllItems(valuesReady);
    fn_sql_insert();
}
// triger ghi dữ liệu vào SQL
var insert_trigger = false;			// Trigger
var old_insert_trigger = false;		// Trigger old

// Đọc dữ liệu từ SQL
function fn_SQLSearch(){
    io.on("connection", function(socket){
        socket.on("msg_SQL_Show", function(data)
        {
            var sqltable_Name = "plc_data";
            var queryy1 = "SELECT * FROM " + sqltable_Name + ";"
            sqlcon.query(queryy1, function(err, results, fields) {
                if (err) {
                    console.log(err);
                } else {
                    const objectifyRawPacket = row => ({...row});
                    const convertedResponse = results.map(objectifyRawPacket);
                    socket.emit('SQL_Show', convertedResponse);
                    console.log(convertedResponse);
                }
            });
        });
    });
    }
    