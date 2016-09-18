
var aceditor;

var userconfig;
var userconfig_default={
	"ver":0,  // json構造体のバージョン
	"date":0,
	"counter":0,
	"last":{
		"directory":"/0",
		"data":"Hello world",
		"set":{"type":"plain"}
	},
	"children":[
		{
			"name":"hello",
			"data":"Hello world",
			"set":{"type":"plain"},
			//"id":0,
			"children":[]
			//,"directory":"/0" // FOR selected Element
		},{
			"name":"parent",
			"data":"123",
			"set":{"type":"plain"},
			"children":[]
			//	{
			//		"name":"child",
			//		"data":"456",
			//		"set":{"type":"plain"},
			//		"children":[]
			//	}
		},{
			"name":"va",
			"data":"vo?",
			"set":{"type":"plain"},
			"children":[]
		}
	]
};
userconfig = userconfig_default;

var itemlistselected = null;

$(document).ready(function(){

	initializeAce();
    initializeBorder();

	fixResize();

	//$(".draggable").draggable();

	$(window).on("unload",saveBackup);
	setInterval(function(){saveBackup();},1000*600);

	$("#button_modaljson").on("click",event_openmodaljson);
	$("#button_jsonapply").on("click",event_applymodaljson);

	$("#button_editordelete").on("click",event_itemdelete);
	$("#button_itemnew").on("click",event_itemnew);

	loadConfigFromLocal();

});


function initializeAce(){
	aceditor = ace.edit("aceditor");
	// aceditor.setTheme("ace/theme/monokai");
	// aceditor.getSession().setMode("ace/mode/ruby");
	aceditor.setOptions({
		enableBasicAutocompletion: true,
		//enableSnippets: true,
		enableLiveAutocompletion: true
	});
	aceditor.setFontSize(14);

	$( "#aceditorEdge" ).on("onresize",function(){
		aceditor.resize();
	});

	aceditor.$blockScrolling = Infinity ;
}


function initializeBorder(){
    
    var flgDrag = 0;
    $("#div_divider_space").on("mousedown",function(){ flgDrag = 1; });
    $(document).on("mouseup"  ,function(){ flgDrag = 0; });
    $(document).on("mousemove",function(e){
        if(!flgDrag){ return false; }
        var dom = $("#div_divider");
        var leftSize = (window.event || e).clientX - dom.offset().left;
        var width = dom.width();
        if(160 <= leftSize && leftSize + 160 <= width){
            $("#div_divider_left").width(leftSize);
            $("#div_divider_right").width(width - leftSize);
        }
    });
}


function checkJsonConfig(json){
	// 妥当性のチェック
	// TODO: 全部
	if (userconfig.children.length==0){return "json : Abort. no item";}
	return null;
}


function parseJson(text,dom){
	try{
		var json = JSON.parse(text);
		if (err = checkJsonConfig(json)) throw err;
		if (!dom)
			console.info("Success loading local settings");
		return json;
	}catch(e){
		if (dom)
			dom.text("!!Failed loading local settings ->"+e);
		else
			console.error("!!Failed loading local settings ->"+e);
		return null;
	}
}


function loadConfigFromLocal(){
	var json = parseJson(localStorage.myNotepad);
	if (json){
		userconfig = json;
	}else{
		userconfig = userconfig_default;
	}
	optimizeUserConfig();
	applyUserConfig();
	recoverEnvironment();
}


function saveConfigToLocal(){
	try{
		userconfig.date=(new Date()).getTime();
		localStorage.myNotepad = JSON.stringify(userconfig);
		console.info("Success storing local settings");
	}catch(e){
		console.error("!!Failed storing local settings ->"+e);
	}
}


function saveBackup(){
	userconfig.last.data = aceditor.getValue();
	userconfig.last.directory = itemlistselected.directory;

	optimizeUserConfig();
	saveConfigToLocal();
}


function recoverEnvironment(){

	var t = userconfig;
	try{
		console.log(userconfig.last.directory);
		(userconfig.last.directory).split("/").forEach(function(item,index,array){
			if (!item) return;
			t = t.children[item - 0];
		});
		if (t == userconfig) throw false;
	}catch(e){ // indexエラーを想定
		t = userconfig.children[0];
	}

	// selected復帰
	t.directory = userconfig.last.directory;
	itemlistselected = t;

	setValueToEditor(userconfig.last.data);
	remarkSelectedItemList();
}


function optimizeUserConfig(){
	// id再割り当て
	// memo:id使わないかも。階層を文字列で保持したほうが楽
	var counter = 0;
	(function(arr){
		for (var i=0;i<arr.length;i++){
			if (itemlistselected != arr[i]){
				delete arr[i].directory;
			}
			arr[i].id = counter++;
			arguments.callee(arr[i].children);
		}
	})(userconfig.children);
	userconfig.counter = counter;

	// TODO:不要な要素の消去

	// TODO:itemlistselectedと一致しない要素のdirectoryの消去
}


function applyUserConfig(){
	var dom = $("#div_itemlist");
	dom.empty();

	(function(arr,nest,from){
		for (var i=0;i<arr.length;i++){
			var elem_inner = $("<a></a>").text(arr[i].name);
			var elem = $("<li></li>").css("margin-left",20*nest).data("path",from+i);
			elem.on("click",{"path":from+i},event_itemListClicked);
				//.draggable({drag:event_itemListDragged,stop:event_itemListStoppedDragging})
			elem.append(elem_inner);
			dom.append(elem);
			arguments.callee(arr[i].children,nest+1,from+i+"/");
		}
	})(userconfig.children,0,"/");
}


function getJsonFromDirectory(directory){
	// TODO:
}


// TODO:
function cancelSelectedItemList(){
	var selectedDom = $("#div_itemlist li.active");
	selectedDom.removeClass("active");
	itemlistselected = null;
}


function appendItemList(parent,data){
	parent.children.push(data);
}


function removeItemList(directory){
	var t = userconfig ,l,i;
	(directory).split("/").forEach(function(item,index,array){
		if (!item) return;
		l = t;
		i = item - 0;
		t = t.children[i];
	});
	l.children.splice(i,1);
	applyUserConfig(); // TODO:追加したものだけ操作 ただしdirectoryの再構成をしていることに注意
}


function createFormItemNew(){
	var namedom = $("<input type='text' id='input_itemnew'>");
	namedom.on("focusout",function(e){
		var dom = $("#input_itemnew");
		var name = dom.val();
		dom.remove();
		if (name==="") return;
		appendItemList(userconfig,{
			"name":name,
			"data":"",
			"set":{"type":"plain"},
			"children":[]});
		applyUserConfig(); // TODO:追加したものだけ操作 ただしdirectoryの再構成をしていることに注意
	});
	$("#div_itemlist").append($("<li></li>").append(namedom));
	namedom.focus();
}


function setValueToEditor(data){
	aceditor.setValue(data,-1);
}


function saveEditing(){
	var target = userconfig;
	(itemlistselected.directory).split("/").forEach(function(item,index,array){
		if (!item) return;
		target = target.children[item - 0];
	});
	if (target == userconfig) return;

	target.data = aceditor.getValue();
}


function remarkSelectedItemList(){
	var selectedDom = $("#div_itemlist li.active");
	selectedDom.removeClass("active");

	$("#div_itemlist li").each(function(i,e){
		if ($(this).data("path")==itemlistselected.directory){
			$(this).addClass("active");
			return false;
		}
		return true;
	});

}



function event_itemListClicked(e){
	var target = userconfig;
	(e.data.path).split("/").forEach(function(item,index,array){
		if (!item) return;
		target = target.children[item - 0];
	});

	if (target == userconfig) return;
	if (itemlistselected.directory == e.data.path) return ;

	saveEditing();

	cancelSelectedItemList();
	$(this).addClass("active");

	target.directory = e.data.path;
	itemlistselected = target;

	setValueToEditor(itemlistselected.data);
}


function event_itemListDragged(e,ui){
	
}


function event_itemListStoppedDragging(e,ui){
	console.log("itemliststoppeddragging");
}


function event_itemnew(e){
	createFormItemNew();
}


function event_itemdelete(e){
	if (userconfig.children.length<=1 && userconfig.children[0].children.length==0){
		alert("すべてのアイテムを削除することは出来ません。");
		return ;
	}
	if (!confirm("このアイテムを削除してもよいですか？")) return;
	
	removeItemList(itemlistselected.directory);

	itemlistselected = userconfig.children[0];
	remarkSelectedItemList();	
	setValueToEditor(itemlistselected.data);
}


function event_openmodaljson(e){
	saveBackup();
	$("#textarea_json").val(JSON.stringify(userconfig,null,'  '));
	$("#div_modaljsonalert").text("").removeClass("bg-danger").removeClass("bg-success");
}


function event_applymodaljson(e){
	var source = $("#textarea_json").val();
	var alertdom = $("#div_modaljsonalert");
	if (source==""){
		userconfig = userconfig_default;
		optimizeUserConfig();
		applyUserConfig();
		recoverEnvironment();
		alertdom.removeClass("bg-danger").addClass("bg-success").text("userconfig has been initialized.");
	}else{
		var json = parseJson(source,alertdom);
		if (json){
			userconfig = json;
			optimizeUserConfig();
			applyUserConfig();
			recoverEnvironment();
			alertdom.removeClass("bg-danger").addClass("bg-success").text("Success loading local settings");
		}else{
			alertdom.removeClass("bg-success").addClass("bg-danger");
		}
	}
}



function fixResize(){
	$("#div_leftside").height($("#div_divider_left").innerHeight() - $("#div_leftopnav").outerHeight());
}

