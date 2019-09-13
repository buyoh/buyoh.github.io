
let editorJS = null;
let editorCSS = null;
let editorHTML = null;

$(()=>{
    editorJS = initializeEditor("editor_js", "javascript");
    editorCSS = initializeEditor("editor_css", "css");
    editorHTML = initializeEditor("editor_html", "html");
    $("#editor_js").data("ace", editorJS);
    $("#editor_css").data("ace", editorCSS);
    $("#editor_html").data("ace", editorHTML);

    $(".editor_wrapper").on("mouseup", (e)=>{
        const domm = $(e.target);
        if (!domm.hasClass("editor_wrapper")) return;
        resizeEditor(domm);
    });
    $(".editor_wrapper").each((i)=>{resizeEditor($(".editor_wrapper").eq(i));});

    setInterval(()=>{ storeBackup(); }, 60000);
    $(window).on("beforeunload",()=>{ storeBackup(); });
    loadBackup();
});


function initializeEditor(editor_id, mode = "plain"){
    const editor = ace.edit(editor_id);
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/"+mode);
    
	editor.setOptions({
		enableBasicAutocompletion: true,
		//enableSnippets: true,
		enableLiveAutocompletion: true
	});
	editor.setShowInvisibles(true);
	editor.setFontSize(14);

	//$( "#aceditorEdge" ).on("onresize",function(){
	//	aceditor.resize();
	//});
    return editor;
}


function resizeEditor(domm){
    const domc = domm.find(".editor");
    const doml = domm.find(".editor_label");
    domc.width(domm.width())
        .height(domm.height()-doml.height());
    domc.data("ace").resize(true);
}


function loadBackup(){
    const js = localStorage.getItem("backup_js");
    if (js === null) return;
    const css = localStorage.getItem("backup_css");
    if (css === null) return;
    const html = localStorage.getItem("backup_html");
    if (html === null) return;
    editorJS.setValue(js, 0);
    editorCSS.setValue(css, 0);
    editorHTML.setValue(html, 0);
}


function storeBackup(){
    const js = editorJS.getValue();
    const css = editorCSS.getValue();
    const html = editorHTML.getValue();
    
    localStorage.setItem("backup_js", js);
    localStorage.setItem("backup_css", css);
    localStorage.setItem("backup_html", html);
}


function button_run(){
    const isTailJs = $("#chk_tailjs").prop("checked");
    const js = editorJS.getValue();
    const css = editorCSS.getValue();
    const html = editorHTML.getValue();

    let gen = "";
    if (isTailJs){
        gen += "<html><head><script src='https://code.jquery.com/jquery-3.4.1.min.js'></script>";
        gen += "<style>\n"+css+"\n</style>";
        gen += "</head><body>\n"+html+"\n";
        gen += "<script>\n"+js+"\n</script></body></html>";
    }else{
        gen += "<html><head><script src='https://code.jquery.com/jquery-3.4.1.min.js'></script>";
        gen += "<script>\n"+js+"\n</script>\n";
        gen += "<style>\n"+css+"\n</style>";
        gen += "</head><body>\n"+html+"</body></html>";
    }

    $("#viewer").prop("srcdoc", gen);
}


function button_clearDisplay(){
    $("#viewer").prop("srcdoc", "");
}


function select_resize(){
    const [x, y] = $("#select_resizer").val().split(',');
    $("#viewer").css("width", x).css("height", y);
}
