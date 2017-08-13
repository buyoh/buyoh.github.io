
var interpreter = null;
var flg_halt = false;

$(document).ready(function(){

    initialize_ace();

    $(window).on("unload", store_status);
    load_status();
});

function initialize_ace(){
	aceditor = ace.edit("aceditor");
	// aceditor.setTheme("ace/theme/monokai");
	// aceditor.getSession().setMode("ace/mode/ruby");
	aceditor.setOptions({
		//enableBasicAutocompletion: true,
		//enableSnippets: true,
		//enableLiveAutocompletion: true
	});
	aceditor.setFontSize(14);

	$( "#aceditorEdge" ).on("onresize",function(){
		aceditor.resize();
	});

	aceditor.$blockScrolling = Infinity ;
}


function load_status(){
    var code = localStorage.getItem('code');
    if (code)
        aceditor.setValue(code, -1);
    
}

function store_status(){
    localStorage.code = aceditor.getValue();
}


function halt_bfi(){
    if (interpreter !== null){
        flg_halt = true;
    }
}

function execute_bfi(){
    var code = aceditor.getValue();
    var stdin = $("#txt_stdin").val();
    if (code === null || code == "") return ;
    if (!stdin) stdin = "";

    $("#btn_run").prop("disabled",true);
    $("#btn_halt").prop("disabled",false);

    var io = new MyStringIO(stdin, function(str){ $("#txt_stdout").val(str); });

    interpreter = new Interpreter(io, code);
    interpreter.reset();

    var execloop = function(){
        var running = true;
        for (var cnt = 0; !flg_halt && running && cnt < 1000; ++cnt){
            running = interpreter.step();
        }
        if (!flg_halt && running)
            setTimeout(function(){execloop()}, 0);
        else
            setTimeout(function(){finalize_bfi()}, 0);
    };
    setTimeout(function(){execloop()}, 0);
}
function finalize_bfi(){
    interpreter.io.flush();
    interpreter = null;
    $("#btn_run").prop("disabled",false);
    $("#btn_halt").prop("disabled",true);
    flg_halt = false;
}
