
$(document).ready(function(){

});


function ebtn_convert(){
    var cin = $('#txt_in').val();

    var result = null;
    switch($('#sel_type').val()){
        case 'html':
            result = escapehtml(cin);
            break;
        case 'htmlr':
            result = escapehtml_rev(cin);
            break;
    }
    if (result === null){
        var dom = $('#div_msg');
        dom.text('falure');
    }else{
        var dom = $('#div_msg');
        dom.text('success');
        $('#txt_out').val(result);
    }
}


function escapehtml(cin){
    return $('<i></i>').text(cin).html();
}
function escapehtml_rev(cin){
    return $('<i>'+cin+'</i>').text();
}