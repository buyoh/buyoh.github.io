
var interpreter = null;
var flg_halt = false;

var le_mem = 102000;
var le_stk = 102000;
var le_out = 2000;

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



function check_le(vm){
    if (le_out < vm.io.byte_out.length) return true;
    if (le_stk < vm.stack.length) return true;
    return false;
}


function put_status(str, type = null){
    var dom = $("#div_state");
    if (type !== null){
        dom.addClass("text-"+type);
    }
    dom.text(str);
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

    le_mem = $("#txt_limitmem").val()-0;
    le_stk = $("#txt_limitstk").val()-0;
    le_out = $("#txt_limitout").val()-0;

    $("#btn_run").prop("disabled",true);
    $("#btn_halt").prop("disabled",false);

    var io = new MyStringIO(stdin, function(str){ $("#txt_stdout").val(str); });

    interpreter = new Interpreter(io, code);
    interpreter.reset();

    var execloop = function(){
        var running = true;
        for (var cnt = 0; !flg_halt && running && cnt < 2000; ++cnt){
            running = interpreter.step();
        }

        if (running && !flg_halt && !check_le(interpreter))
            setTimeout(function(){execloop()}, 0);
        else
            setTimeout(function(){finalize_bfi()}, 0);
    };
    setTimeout(function(){execloop()}, 0);
}
function finalize_bfi(){
    var exitcode = interpreter.step();
    interpreter.io.flush();
    $("#btn_run").prop("disabled",false);
    $("#btn_halt").prop("disabled",true);

    if (exitcode === null){
        put_status(`RuntimeError: (memptr: ${interpreter.mem_ptr} , codeptr: ${interpreter.code_ptr} , stackptr: ${interpreter.stack.length} )`,"warning");
    }else if (exitcode === true) {
        put_status("Stop","primary");
    }else{
        interpreter = null;
        put_status("Success","success");
    }

    flg_halt = false;
}
