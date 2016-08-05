
userconfig={
	"date":(new Date()).getTime(),
	"words":[
		{
			"t":"approximately",
			"d":"近似"
		},
		{
			"t":"truncate",
			"d":"切り捨て"
		},
		{
			"t":"independently",
			"d":"独立して、無関係に"
		},
		{
			"t":"criteria",
			"d":"基準、尺度(単:criterion)"
		},
		{
			"t":"variant",
			"d":"確率"
		}
	]
};
userconfig.words.sort(function(l,r){return l.t>r.t;});

wordlistindex=null;
wordlistdom=null;

domTemplate={
	"word_dt":$("<dt></dt>"),
	"word_dd":$("<dd></dd>")
};

bodyoffset=null;

// initialize
$(document).ready(function(){
	$("#input_keyword").on("keyup",function(){updateList();});

	$("#button_appenditem").on("click",function(){appendNewWordToList();});
	$("#button_removeitem").on("click",function(){removeSelectedWordFromList();});

	$("#button_modaljson").on("click",function(){$("#textarea_json").val(JSON.stringify(userconfig,null,'  '));});
	$("#button_jsonapply").on("click",function(){readConfig($("#textarea_json").val());});

	loadConfigFromStorage();
	userconfig.words.sort(function(l,r){return l.t>r.t;});
	makeListFromConfig();

	bodyoffset=parseInt($("body").css("padding-top"));

	setInterval(function(){saveBackup();},1000*600);
});

$(window).on("unload",function(){
	saveBackup();
});

function saveBackup(){
	storeConfigToStorage();
}

function loadConfigFromStorage(){
	try{
		var r=JSON.parse(localStorage.myDictionary);
		userconfig=r;
		console.info("Success loading local settings");
	}catch(e){
		console.error("!!Failed loading local settings ->"+e);
	}
}

function storeConfigToStorage(){
	try{
		userconfig.date=(new Date()).getTime();
		localStorage.myDictionary=JSON.stringify(userconfig);
		console.info("Success storing local settings");
	}catch(e){
		console.error("!!Failed storing local settings ->"+e);
	}
}

function clearConfigAll(){
	localStorage.clear();
}

function readConfig(str){
	try{
		var r=JSON.parse(str);
		$("#input_keyword").val("");
		$("#input_description").val("");
		updateList();
		userconfig=r;
		makeListFromConfig();
		alert("Success loading local settings");
	}catch(e){
		alert("!!Failed loading local settings ->"+e);
	}
}

function makeListFromConfig(){
	var domlist=$("#div_wordlist");
	domlist.empty();
	for (var i=0;i<userconfig.words.length;i++){
		var word=userconfig.words[i];
		domlist.append(domTemplate.word_dt.clone().text(word.t).data("idx",i).on("click",call_selectWord));
		domlist.append(domTemplate.word_dd.clone().text(word.d));
	}
}

function updateList(){
	var word=$("#input_keyword").val();
	
	var w=userconfig.words;
	var l=0,h=w.length-1,m;
	while (l<h){
		m=Math.floor((l+h)/2);
		if (w[m].t<word){
			l=m+1;
		}else if (word<w[m].t){
			h=m-1;
		}else{
			l=m;h=m;
		}
	}
	if (h<0)h=0;
	if (w.length<=h) h=w.length-1;

	if (word === w[h].t){
		$("#button_removeitem").removeAttr("disabled");

		if (wordlistdom!==null){
			wordlistdom.removeClass("bg-success");
			wordlistdom.next().removeClass("bg-success");
		}

		wordlistindex=h;
		wordlistdom=$("#div_wordlist > dt").eq(wordlistindex);

		wordlistdom.addClass("bg-success");
		wordlistdom.next().addClass("bg-success");
	}else{
		$("#button_removeitem").attr("disabled","disabled");

		if (wordlistdom!==null){
			wordlistdom.removeClass("bg-success");
			wordlistdom.next().removeClass("bg-success");
		}
		wordlistindex=null;
		wordlistdom=null;
	}

	scrollTo($("#div_wordlist > dt").eq(h));
}

function appendNewWordToList(){
	var word=$("#input_keyword").val();
	var description=$("#input_description").val();
	if (word===null || word==="" || description===null || description==="")
		return;

	var json={"t":word,"d":description};

	var w=userconfig.words;
	var l=0,h=w.length-1,m;
	while (l<h){
		m=Math.floor((l+h)/2);
		if (w[m].t<word){
			l=m+1;
		}else if (word<w[m].t){
			h=m-1;
		}else{
			l=m;h=m;
		}
	}

	if (word===w[l].t){
		w[l].d=description;
		$("#div_wordlist > dd").eq(wordlistindex).text(description);
	}else{
		w.splice(l+(word<w[l].t ? 0 : 1),0,json);
		makeListFromConfig();
	}
	
}

function removeSelectedWordFromList(){
	if (wordlistdom===null) return;
	if (!confirm("<< alert (remove) >>")) return;
	
	userconfig.words.splice(wordlistindex,1);
	makeListFromConfig();

	$("#button_removeitem").attr("disabled","disabled");
}


function call_selectWord(){
	var dom=$(this);
	var idx=dom.data("idx");

	$("#input_keyword").val(userconfig.words[idx].t);
	$("#input_description").val(userconfig.words[idx].d);

	updateList();

	return ;
}

function scrollTo(dom){
	var p=dom.offset().top-bodyoffset;
	$('html,body').animate({ scrollTop:p },'fast');
}

