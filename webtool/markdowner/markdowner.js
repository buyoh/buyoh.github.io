
var isenable_testView = false;
var timer_testView = null;

$(document).ready(function(){
    initializeAce();

	$(window).on("unload",saveBackup);
	setInterval(function(){saveBackup();},1000*600);

    loadBackup();
});


function initializeAce(){
	aceditor = ace.edit("aceditor");
	aceditor.setTheme("ace/theme/monokai");
	// aceditor.getSession().setMode("ace/mode/ruby");
	aceditor.setOptions({
		enableBasicAutocompletion: true,
		//enableSnippets: true,
		enableLiveAutocompletion: true
	});
	aceditor.setFontSize(14);

    aceditor.getSession().setMode("ace/mode/markdown");
    aceditor.setOption('wrap', 'free');
    // aceditor.setOption('wrap', 'off');

	$( "#aceditorEdge" ).on("onresize",function(){
		aceditor.resize();
	});

	aceditor.$blockScrolling = Infinity ;

    aceditor.on("change", function(e){
        if (!isenable_testView) return;
        if (timer_testView){
            clearTimeout(timer_testView);
            timer_testView = null;
        }
        timer_testView = setTimeout(function(){update_testpanel();}, 3000);
    });
}



function ebtn_testpanel_open(){
    update_testpanel();
    $('#div_testpanel').slideDown();
    isenable_testView = true;
}

function ebtn_testpanel_close(){
    isenable_testView = false;
    timer_testView = null;
    $('#div_testpanel').slideUp();
}

function update_testpanel(){
    $('#div_testpanel').html(markdownToHtml(aceditor.getValue()));
}



function ebtn_convert(){
    var raw = aceditor.getValue();

    $('#txt_result').val(markdownToHtml(raw));
}



function markdownToHtml(md){
    var lines = (md+"\n").split(/\r\n|\r|\n/);
    var dom = $('<div></div>');
    var stack = [];

    while(lines.length && lines[0] == ""){lines.shift();}

    function flush_paragraph(){
        if (stack.length == 0) return;
        var t = "";
        while(stack.length){
            t += stack.shift() + ' ';
        }
        dom.append($("<p></p>").text(t));
    }
    function push_br(){
        dom.append('<br>');
    }
    function push_hr(){
        dom.append('<hr>');
    }
    function push_headline(str, rank){
        dom.append($(`<h${rank}></h${rank}>`).text(str));
    }

    for (i in lines){
        var line = lines[i];
        var mt;
        if (line == ""){
            if (stack.length){
                flush_paragraph();
            }else{
                push_br();
            }
        }else if (mt = line.match(/^(#+)\s*(.+)/)){
            flush_paragraph();
            push_headline(mt[2], mt[1].length);

        }else if (mt = line.match(/^(?:[*\-]{3,})|(?:[-*](?: [*\-]){2,})$/)){
            flush_paragraph();
            push_hr();

        }else{
            stack.push(line);
        }
    }
    return dom.html();
}



function saveBackup(){
    localStorage.text = aceditor.getValue();
}

function loadBackup(){
    var text = localStorage.getItem('text');

    if (text){
        aceditor.setValue(text, -1);
    }
}
