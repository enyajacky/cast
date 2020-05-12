var VERSION = "1.1.1";
var isLaunching = false;
var launchingString = new Array();
var analyticsState = '';
var analyticsdid;
//var analyticsURL = "http://220.228.38.27:18080/postEvent";
var analyticsURL = "https://ana.video.friday.tw/postEvent";

var sendInterval = 30000;
var analyticsData = new Array();
var analyticsSend = new Array();
var dataLock = false;
var sendLock = false;
var analyticsTimer;
var analyticsInfo1;
var analyticsInfo2;
var cuid = "Chromecast";


function analyticsInit() {
	createInfo('4f84f3af-ff1c-43db-ba7e-f700ed2b78da');
	analyticsTimer = window.setInterval(processAnalytics, sendInterval);
}

function createInfo(deviceid) {
	var sid = new Date().getTime();
	var info = '"did":"';
	info += deviceid;
	info += '","sid":"';
	info += sid;
	info += '"';
	analyticsdid = info;
	analyticsInfo1 = '{' + info + ',"t":"info","ts":';
	analyticsInfo2 = ',"cuid":"'+cuid+'","model":"Chromecast","os":"Linux","ver":"'+VERSION+'"}';
}

function test() {
	dataLock = false;
	setTimeout(function() {
		console.log(analyticsData[0] + ' ' + analyticsData[1]);
	}, 4);
}

function addAnalyticsData(data) {
	if (dataLock) {
		// console.log('1\n');
		setTimeout(addAnalyticsData, 100, data);
	} else {
		// console.log('3\n');
		analyticsData.push(data);
	}
}

function addAnaylticsSend(data) {
	if (sendLock) {
		setTimeout(addAnaylticsSend, 100, data);
	} else {
		sendLock = true;
		if (data) {
			if (analyticsSend.length > 10) {
				analyticsSend.splice(0, analyticsSend.length - 10);
			}
			analyticsSend.push(data);
		}
		if (analyticsSend.length > 0) {
			for (i = 0; i < analyticsSend.length; i++) {
				sendAnalytics(analyticsSend[i]);
			}
		}
		sendLock = false;
	}
}

function delAnaylticsSend(data) {
	if (sendLock) {
		setTimeout(delAnaylticsSend, 100, data);
	} else {
		sendLock = true;
		for (i = 0; i < analyticsSend.length; i++) {
			if (analyticsSend[i] == data) {
				analyticsSend.splice(i, 1);
				// alert(analyticsSend.length);
				break;
			}
		}
		sendLock = false;
	}
}

window.onbeforeunload = function(event) {
	clearInterval(analyticsTimer);
	var currentTime = 0.0;
	if (this.mediaElement_) {
		currentTime = this.mediaElement_.currentTime;
	}

	if (isLaunching) {
		isLaunching = false;
		var i = 0;
		for (i = 0; i < launchingString.length; i++) {
			addAnalyticsData(launchingString[i]);
		}
	}
	addAnalyticsData('"t":"stop","ts":' + new Date().getTime() + ',"ps":"'
			+ (currentTime * 1000));

	var message;
	if (analyticsData.length > 0) {
		message = '[';
		if (analyticsInfo1) {
			message = message + analyticsInfo1 + new Date().getTime()
					+ analyticsInfo2;
		}
		for (i = 0; i < analyticsData.length; i++) {
			message += '{';
			if (analyticsdid) {
				message = message + analyticsdid + ',';
			}
			message += analyticsData[i];
			message += '},';
		}
		message += ']';
		analyticsData.length = 0;
	}
	analyticsSend.push(message);
	if (analyticsSend.length > 0) {
		for (i = 0; i < analyticsSend.length; i++) {
			var xmlhttp;
			if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome,
										// Opera, Safari
				xmlhttp = new XMLHttpRequest();
			} else {// code for IE6, IE5
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			}
			xmlhttp.open("POST", analyticsURL, false);
			xmlhttp.send(analyticsSend[i]);
		}
	}

};

function processAnalytics() {
	var message;
	dataLock = true;
	if (analyticsData.length > 0) {
		message = '[';
		if (analyticsInfo1) {
			message = message + analyticsInfo1 + new Date().getTime()
					+ analyticsInfo2;
		}
		for (i = 0; i < analyticsData.length; i++) {
			message += '{';
			if (analyticsdid) {
				message = message + analyticsdid + ',';
			}
			message += analyticsData[i];
			message += '},';
		}
		message += ']';
		analyticsData.length = 0;
	}
	dataLock = false;
	addAnaylticsSend(message);
}


var AsyncResponseValue="";  // 非同步化請求回傳值
var tempMessage;            // 紀錄非同步化傳送資料.
function sendAnalytics(message) 
{
    tempMessage = message
    AsyncResponseValue = "";
    
    console.log("分析伺服器analyticsURL:"+analyticsURL);
    console.log("分析資料內容message:"+message);
    
    
    $.ajax({
        url: analyticsURL,  // 前往呼叫的網域名稱
        data: tempMessage,   // URL 後面的參數    $('#sentToBack').serialize(),
        type:"POST",        // 傳遞資料方式 GET/POST ,預設為 GET
        dataType:"text",    // 傳送時必須為 "text"
        crossDomain: true,  // 跨網域存取
        async:true,         // 非同步化要求.若為 false 時(鎖定強制執行).則會導致網頁鎖定.直到 AJAX 結束後才恢復正常
        //cache:false,      // 預設為 true,1.2版加入的新功能，設定成flase就不會從瀏覽器中抓cache住的舊資料。
        //useDefaultXhrHeader: false,
        success: function(data, status, xhr)  // 當取回資料正確執行後,觸發本事件 msg=從server回傳資料
        {
            //debug_dlm_output("data:" + data); // server 端回傳資料
            //debug_dlm_output("status:" + status);   // 若為成功時傳回 "success"
            //debug_dlm_output("xhr.status:" + (xhr.status));   // 若為成功時傳回 200
            if (xhr.status==200)
                AsyncResponseValue = "success";
            else
                AsyncResponseValue = "error";
        },
        error: function(xhr, ajaxOptions, thrownError)  // 當取回資料發生錯誤後,觸發本事件
        {
            AsyncResponseValue = "error";
            //alert("error no:" + xhr.status);  // 錯誤編號:200 成功.404 沒有頁面
            //alert("error:" + thrownError);    // 錯誤文字描述
        }
    });


    // 事後檢查傳送資訊是否正確
    TimeObjectSyncCheck = setTimeout("AnalyticsSynchronizationCheck()", 1000);
    return ;



//    原 jacky 設計同步化執行方式
//	var xmlhttp;
//	if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
//		xmlhttp = new XMLHttpRequest();
//	} else {// code for IE6, IE5
//		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
//	}
//	xmlhttp.timeout = 5000;
//	xmlhttp.open("POST", analyticsURL, true);
//	xmlhttp.onreadystatechange = function() {// Call a function when the
//												// state changes.
//		if (xmlhttp.readyState == 4) {
//			if (xmlhttp.status == 200) {
//				delAnaylticsSend(message);
//			} else {
//
//			}
//		}
//	}
//	xmlhttp.send(message);
}

var TimeObjectSyncCheck;    // 非同步化接受器物件名稱
function AnalyticsSynchronizationCheck()
{
    clearTimeout(TimeObjectSyncCheck);
    
    if(AsyncResponseValue.length<2)
    {
        TimeObjectSyncCheck = setTimeout("AnalyticsSynchronizationCheck()", 1000);
        return;
    }


    if (AsyncResponseValue.indexOf("success")!=-1)
    {
        // 資料傳遞成功.將資料移除
        delAnaylticsSend(tempMessage);
        tempMessage = "";
    }
    else
    {
        // 資料傳遞失敗
    }
    
}


function setFridayId(fridayId) {
	cuid = fridayId;
	analyticsInfo2 = ',"cuid":"'+cuid+'","model":"Chromecast","os":"Linux","ver":"'+VERSION+'"}';
}


