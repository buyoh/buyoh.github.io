
var interpreter = null;

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



function execute_bfi(){
    var code = aceditor.getValue();
    var stdin = $("#txt_stdin").val();
    if (code === null || code == "") return ;

    $("#btn_run").prop("disabled",true);

    var io = new MyStringIO(stdin, function(str){ $("#txt_stdout").val(str); });

    interpreter = new Interpreter(io, code);
    interpreter.reset();

    var execloop = function(){
        var running = true;
        for (var cnt = 0; running && cnt < 1000; ++cnt){
            running = interpreter.step();
        }
        if (running)
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
}
