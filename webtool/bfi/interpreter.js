

var Interpreter = function(_io, _code=""){
    this.mem = new Array(102000).fill(0);
    this.code = _code;
    this.stack = new Array(0);
    this.mem_ptr = 0;
    this.code_ptr = 0;
    this.stack_ptr = 0;
    this.io = _io;

    this.errmsg = "";
}


Interpreter.prototype.set_errmsg = function(str){
    this.errmsg = str;
    return null;
}

Interpreter.prototype.issafe_memidx = function(idx){
    return 0<=idx && idx<this.mem.length;
}

Interpreter.prototype.reset = function(){
    this.memptr = 0;
    this.code_ptr = 0;
    this.stack_ptr = 0;
    this.stack.splice(0, this.stack.length);
}

// true : success
// false: halt
// null : error
Interpreter.prototype.step = function(){
    if (this.code.length <= this.code_ptr) return false;

    switch (this.code[this.code_ptr]){
            // brainfuck
        case '>':
            ++this.mem_ptr;
            break;
        case '<':
            --this.mem_ptr;
            break;
        case '+':
            if (!this.issafe_memidx(this.mem_ptr)) return null;
            ++this.mem[this.mem_ptr];
            break;
        case '-':
            if (!this.issafe_memidx(this.mem_ptr)) return null;
            --this.mem[this.mem_ptr];
            break;
        case ',':
            if (!this.issafe_memidx(this.mem_ptr)) return null;
            this.mem[this.mem_ptr] = this.io.getchar();
            break;
        case '.':
            if (!this.issafe_memidx(this.mem_ptr)) return null;
            this.io.putchar(this.mem[this.mem_ptr]);
            break;
        case '[':
            if (this.mem[this.mem_ptr] == 0){
                var depth = 0;
                while (this.code_ptr < this.code.length - 1 && (this.code[++this.code_ptr] != ']' || depth > 0)){
                    if (this.code[this.code_ptr] == '[') ++depth;
                    if (this.code[this.code_ptr] == ']') --depth;
                }
            }
                
            break;
        case ']':
            if (this.mem[this.mem_ptr] != 0){
                var depth = 0;
                while (0 < this.code_ptr && (this.code[--this.code_ptr] != '[' || depth > 0)){
                    if (this.code[this.code_ptr] == ']') ++depth;
                    if (this.code[this.code_ptr] == '[') --depth;
                }
            }
            break;

            // lunatic brain basic
        case '#':
            if (!this.issafe_memidx(this.mem_ptr)) return null;
            this.mem[this.mem_ptr] <<= 1;
            break;
        case '=':
            if (!this.issafe_memidx(this.mem_ptr)) return null;
            this.mem[this.mem_ptr] >>= 1;
            break;
        case '^':
            if (!this.issafe_memidx(this.mem_ptr)) return null;
            this.stack.push(this.mem[this.mem_ptr]);
            break;
        case 'v':
            if (!this.issafe_memidx(this.mem_ptr)) return null;
            if (this.stack.length <= 0) return null;
            this.mem[this.mem_ptr] = this.stack.pop();
            break;
        case '$':
            this.stack.push(this.mem_ptr);
            break;
        case '*':
            if (this.stack.length <= 0) return null;
            this.mem_ptr = this.stack.pop();
            break;
        case 'i':
            this.stack.push(this.code_ptr);
            break;
        case '!':
            if (this.stack.length <= 0) return null;
            this.code_ptr = this.stack.top();
            break;


            // lunatic brain extended
        case 'p':
            if (!this.issafe_memidx(this.mem_ptr)) return null;
            this.io.print_int(this.mem[this.mem_ptr]);
            break;
        case 's':
            if (!this.issafe_memidx(this.mem_ptr)) return null;
            this.mem[this.mem_ptr] = this.io.scan_int();
            break;
        case '~':
            if (!this.issafe_memidx(this.mem_ptr)) return null;
            this.mem[this.mem_ptr]=~this.mem[this.mem_ptr];
            break;
    }
    this.code_ptr+= 1;

    return true;

}