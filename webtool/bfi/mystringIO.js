
var MyStringIO = function(_string_in, _out_proc){
    this.byte_in = []; // byteではない
    this.byte_in_cursor = 0;
    this.byte_out = [];
    this.out_proc = _out_proc;

    for (var pos = 0, chr; !isNaN(chr = _string_in.charCodeAt(pos)); ++pos){
        this.byte_in.push(chr);
    }
};

MyStringIO.prototype.putchar = function(chr){
    this.byte_out.push(chr);
};
MyStringIO.prototype.getchar = function(){
    if (this.byte_in.length <= this.byte_in_cursor ){
        return -1;
    }
    return this.byte_in[this.byte_in_cursor++];
};
MyStringIO.prototype.print_int = function(val){
    val = Math.floor(val);
    buff = [];
    if (val < 0){
        val = -val;
        this.byte_out.push(45);
    }
    if (val == 0){
        buff.push(48);
    }else{
        while (0 < val){
            buff.push(48 + (val%10));
            val = Math.floor(val/10);
        }
    }
    buff.reverse();
    Array.prototype.push.apply(this.byte_out, buff);
    this.byte_out.push(32);
};
MyStringIO.prototype.scan_int = function(){
    // 48-57
    var val = 0;
    var sign = 1;
    while (this.byte_in_cursor < this.byte_in.length && (48 > this.byte_in[this.byte_in_cursor] || this.byte_in[this.byte_in_cursor] > 57)){
        sign = (this.byte_in[this.byte_in_cursor] == 45) ? -1 : 1; // '-'
        ++this.byte_in_cursor;
    }
    
    while (this.byte_in_cursor < this.byte_in.length && (48 <= this.byte_in[this.byte_in_cursor] && this.byte_in[this.byte_in_cursor] <= 57)){
        var c = this.byte_in[this.byte_in_cursor];
        val = val*10 + (c-48);
        ++this.byte_in_cursor;
    }

    val *= sign;
    return val;
};
MyStringIO.prototype.flush = function(){
    var s = String.fromCharCode.apply(null, this.byte_out);
    // console.log(this.byte_in, this.byte_out, s);
    this.out_proc(s);
    this.byte_out.splice(0, this.byte_out.length);
};