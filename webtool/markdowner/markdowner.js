
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
    var basedom = $('<div></div>');
    var stack = [];

    while(lines.length && lines[0] == ""){lines.shift();}

    function flush_paragraph(){
        if (stack.length == 0) return;
        var t = $("<p></p>");
        while(stack.length){
            t.append(stack.shift());
        }
        basedom.append(t);
    }
    function push_br(){
        basedom.append('<br>');
    }
    function push_hr(){
        basedom.append('<hr>');
    }
    function push_headline(str, rank){
        basedom.append($(`<h${rank}></h${rank}>`).text(str));
    }

    while (lines.length){
        var line = lines.shift();
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

        }else if (mt = line.match(/^```([a-zA-Z0-9]*).*$/)){
            flush_paragraph();
            var dom = $('<pre></pre>');
            if (mt[1])
                dom.addClass("language-" + mt[1]);
            
            while(lines.length){
                var l = lines.shift();
                if (/^```$/.test(l)){
                    break;
                }
                dom.append(l);
            }
            basedom.append(dom);

        // }else if (mt = line.match(/^( *)-\s*(.+)/)){

        }else{
            function descript(str){
                var mt;
                var dom = $('<span></span>');

                if (mt = (str).match(/([^`]*)`((?:[^`]|\\`)+[^\\])`(.*$)/)){
                    dom.append(descript(mt[1]).html());
                    console.log(mt[2].replace('\\`','`'));
                    dom.append($('<code></code>').text(mt[2]));
                    dom.append(descript(mt[3]).html());
                }if (mt = (str).match(/([^\[]]*)\[html:((?:[^\]]|\\\])*[^\\])\](.*$)/)){
                    dom.append(descript(mt[1]).html());
                    dom.append($('<span></span>').html(mt[2]));
                    dom.append(descript(mt[3]).html());
                }else{
                    dom.text(str);
                }
                return dom;
            }

            stack.push(descript(line).html());
        }
    }
    return basedom.html();
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
