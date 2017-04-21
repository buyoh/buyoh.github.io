
/*
TODO
・

既知バグ・不具合など
・

起こりそうなバグ・不具合など
・瞬時に(2msぐらいで)複数のマスをクリックする

*/

var debugSwitch = false;

const check_vertion = 'abc';

var cvContext = null;
var cvWidth, cvHeight;

var buffContext = null;
var buffCanvas = null;

const themes = {
    'color' : {
        'basic' : {
            'background' : '#051',
            'border' : '#FFF',
            'stoneWhiteFill' : '#FFF',
            'stoneWhiteStroke' : '#888',
            'stoneBlackFill' : '#000',
            'stoneBlackStroke' : '#888',
            'cellHintsStroke' : '#8F3'
        },
        'white' : {
            'background' : '#EEE',
            'border' : '#777',
            'stoneWhiteFill' : '#FFF',
            'stoneWhiteStroke' : '#4FF',
            'stoneBlackFill' : '#777',
            'stoneBlackStroke' : '#4FF',
            'cellHintsStroke' : '#4FF'
        },
        'monokai' : {
            'background' : '#272822',
            'border' : '#e6db74',
            'stoneWhiteFill' : '#66d9ef',
            'stoneWhiteStroke' : '#ae81ff',
            'stoneBlackFill' : '#f92672',
            'stoneBlackStroke' : '#fd971f',
            'cellHintsStroke' : '#a6e22e'
        }
    }
};

const display = {'board' : {
                   'width' : 320,
                   'height' : 320,
                   'offsetX' : 20,
                   'offsetY' : 20,
                   'padding' : 0.25
               },
               'color' : {
                   'background' : '#051',
                   'border' : '#FFF',
                   'stoneWhiteFill' : '#FFF',
                   'stoneWhiteStroke' : '#888',
                   'stoneBlackFill' : '#000',
                   'stoneBlackStroke' : '#888',
                   'cellHintsStroke' : '#8F3'
               }};
var gamerule = {'width' : 8,
                'height' : 8,
                'black' : null,
                'white' : null};
var gamestyle = {'skipAnim' : false};

var game = {'field' : null,
            'turn' : 1};

var work = {'hints' : null,
            'state' : 0 // for animation
           };


var effect = [];
// effect.elem => {'type','timeLeft','onpaint':proc,'onfinish':proc}
var effect_timerID = null;
const effect_animInterval = 50;

// work.state ... 0=>ready , 20=>thinking , 21=>userInput , 25=>animationTime , 50=>finish

var ailist = [];

// 初めに呼び出される
$(document).ready(function(){
	let canvasDom = $('#canvas_main')[0];
	cvContext = canvasDom.getContext('2d');
	cvWidth  = canvasDom.width;
	cvHeight = canvasDom.height;

    buffCanvas = $('<canvas></canvas>')[0];
    buffCanvas.width = cvWidth; buffCanvas.height = cvHeight;
    buffContext = buffCanvas.getContext('2d');

    $('#canvas_main').on('contextmenu',function(e){clickready(e);return false;});
    $('#canvas_main').on('click',clickready);
    $('#canvas_main').on('mousemove',function(e){});


    let flg_selectedAi = false;
    for (name in ailist){
        $('#sel_type_black').append('<option value="'+name+'">AI ['+name+']</option>');
        $('#sel_type_white').append('<option value="'+name+'">AI ['+name+']</option>');
        if (!flg_selectedAi){
            flg_selectedAi = true;
            $('#sel_type_white > option[value!=\'\']').eq(0).attr('selected','selected');
        }
    }

    $('#div_debugsw').on('click',function(){
        debugSwitch = !debugSwitch;
        $('#div_debugsw').css('color',debugSwitch ? '#F00' : '#000');
    });

    initialize_game();
    updateInfomation();
    paint();
});


function initialize_game(){
    work.state = 0;

    removeAllEffect();

    // load gamerule
    gamerule.black = $('#sel_type_black').val();
    gamerule.black = gamerule.black == "" ? null : new ailist[gamerule.black];
    gamerule.white = $('#sel_type_white').val();
    gamerule.white = gamerule.white == "" ? null : new ailist[gamerule.white];

    // initialize game
    game.field = new Array(gamerule.height);
    for (let y = 0; y < gamerule.height; ++y){
        game.field[y] = new Array(gamerule.width);
        for (let x = 0; x < gamerule.width; ++x){
            if ((x==gamerule.width/2-1||x==gamerule.width/2)&&(y==gamerule.height/2-1||y==gamerule.height/2)){
                game.field[y][x] = x == y ? -1 : 1;
            }else{
                game.field[y][x] = 0;
            }
        }
    }
    game.turn = 1;
    work.hints = createHintsField(game.field, game.turn);

    callNextPlayer();
}


// 石を置いた後の処理(ターン遷移，終了判定など)
function continueGame(twice = false){
    game.turn = -game.turn;
    work.hints = createHintsField(game.field, game.turn);

    let puttable = work.hints.reduce(function(s,e){return s+e.reduce(function(s,e){return s+e;});},0);

    if (puttable == 0){
        if (twice){
            quitGame();
            updateInfomation();
            paint();
        }else{
            continueGame(true);
        }
        return;
    }
    updateInfomation();
    paint();
    setTimeout(function(){callNextPlayer();},0);
}


// 次のプレイヤーがすること
// USERならばクリックされるまで待つ．
// AIなら思考する．
function callNextPlayer(){
    work.state = 20; // thinking

    let ctrl = null;
    if (game.turn === 1){
        ctrl = gamerule.black;
    }else if (game.turn === -1){
        ctrl = gamerule.white;
    }
    if (ctrl === null){
        // user
        work.state = 21; // userControl

    }else{
        // AI
        setAIWatchTimer();
        ctrl.action(game.field, game.turn, work.hints, function(pos){
            // todo: check
            setupEffect(20,{'oldField':copyMatrix(game.field)},function(){
                continueGame();
            });
            putStone(game.field, game.turn, pos.x, pos.y);
            updateInfomation();
            paint();
            clearAIWatchTimer();
        });
    }
}


function quitGame(){
    removeAllEffect();
    pushAlert('おしまい！');
}


function appendAI(ai, name){
    ailist[name] = ai;
}


function changedStyleSettings(){
    gamestyle = {'skipAnim' : $('#chk_skipAnim').is(':checked')
                };
    let v;
    if (v = $('#sel_color').val())
        display.color = themes.color[v];
    paint();
}


function button_restart(){
    initialize_game();
    updateInfomation();
    paint();
}


function clickready(e){ // e.button : 0=left, 1=right
    let x = e.offsetX;
    let y = e.offsetY;
    if (display.board.offsetX <= x && x < display.board.offsetX + display.board.width
        && display.board.offsetY <= y && y < display.board.offsetY + display.board.height){
        click_board((x-display.board.offsetX)*gamerule.width/display.board.width,
                    (y-display.board.offsetY)*gamerule.height/display.board.height,e.button);
    }
}


function click_board(x,y,button){
    let lx = Math.floor(x);
    let ly = Math.floor(y);
    if (button === 2){
        if (debugSwitch){
            game.field[ly][lx] = (game.field[ly][lx] + 2) % 3 - 1;
            work.hints = createHintsField(game.field, game.turn);
        }
    }else{
        // is userControl state ?
        if (work.state == 21){
            if (work.hints[ly][lx]){
                setupEffect(20,{'oldField':copyMatrix(game.field)},function(){continueGame();});
                putStone(game.field,game.turn,lx,ly);
                work.state = 25;
            }
        }
    }
    updateInfomation();
    paint();
}


function updateInfomation(){
    let str = "";
    let score = 0;
    let sum = 0;
    let x,y;
    for (y = 0; y < gamerule.height; ++y){
        for (x = 0; x < gamerule.width; ++x){
            score += game.field[y][x];
            sum += Math.abs(game.field[y][x]);
        }
    }
    $('#div_dispturn').text(game.turn == 1 ? "先手:黒\n" : "後手:白\n");
    $('#div_dispscore').text(`黒:${(sum+score)/2} 白:${(sum-score)/2} 差(黒-白):${score}\n`);
    
    $('#infomation').val('');
}


function removeAllEffect(){
    if (effect_timerID !== null){
        clearInterval(effect_timerID);
        effect_timerID = null;
    }
    effect = [];
}


function pushAlert(text, classes=['alert-success'], isHtmlText=false){
    let dom = $('<div class="alert"></div>');

    if (isHtmlText)
        dom.html(text);
    else
        dom.text(text);
    classes.forEach(function(val,idx,arr){dom.addClass(val);});

    dom.on('click',function(){ $(this).slideUp('slow', function(){$(this).remove();}) });

    dom.append($('<button type="button" class="close" data-dismiss="alert">&times;</button>'));

    $('#div_alertspace').append(dom);
}


var aiThinking_timerID = null;

function setAIWatchTimer(){
    if (aiThinking_timerID !== null) clearAIWatchTimer();
    aiThinking_timerID = setInterval(procAIWatchTimer, 280);
    $('#progress_AIthinking').css('width','0').parent().addClass('progress-striped').addClass('active');
}
function procAIWatchTimer(){
    if (work.state === 20){
        let ctrl = game.turn === 1 ? gamerule.black : gamerule.white;
        if (ctrl !== null){
            let dom = $('#progress_AIthinking').css('width',''+(ctrl.getProgress()*100)+'%');
        }
    }
}
function clearAIWatchTimer(){
    if (aiThinking_timerID !== null){
        clearInterval(aiThinking_timerID);
        $('#progress_AIthinking').css('width','100%').parent().removeClass('progress-striped').removeClass('active');
    }
    
}


function setupEffect(type, data, proc){ // {'type','timeLeft','onpaint','onfinish':proc}
    switch (type){
        case 20: // flipping stone anim
        effect.push({'type':type,'timeLeft':1000,'data':data,'onpaint':function(context,eff){
            let x,y;
            let nw,nh,w,h,ox,oy,srad,arc;
            nw = gamerule.width;
            nh = gamerule.height;
            w = display.board.width;
            h = display.board.height;
            ox = display.board.offsetX;
            oy = display.board.offsetY;
            srad = Math.min(w/nw,h/nh) * (1 - display.board.padding) / 2;
            arc = 2*Math.PI*(eff.timeLeft/1000);
            for (y = 0; y < gamerule.height; ++y){
                for (x = 0; x < gamerule.width; ++x){
                    if (eff.data.oldField[y][x] !== 0 &&eff.data.oldField[y][x] != game.field[y][x] ){
                        // todo:
                        if (eff.data.oldField[y][x] == 1){
                            buffContext.fillStyle = display.color.stoneBlackFill;
                            buffContext.strokeStyle = display.color.stoneBlackStroke;
                        }else if (eff.data.oldField[y][x] == -1){
                            buffContext.fillStyle = display.color.stoneWhiteFill;
                            buffContext.strokeStyle = display.color.stoneWhiteStroke;
                        }
                        buffContext.beginPath();
                        buffContext.arc(ox+w*(2*x+1)/nw/2, oy+h*(2*y+1)/nh/2, srad,0,arc);
                        buffContext.lineTo(ox+w*(2*x+1)/nw/2, oy+h*(2*y+1)/nh/2);
                        buffContext.fill();

                    }
                }
            }
        },'onfinish':proc});
        break;
    }
    if (0 < effect.length && effect_timerID === null){
        effect_timerID = setInterval(effectInterval, effect_animInterval);
    }
}


function effectInterval(){
    // TODO: 時間計測? nowtime-begintime
    paint();
    for (let i = 0; i < effect.length; ++i){
        let elem = effect[i];
            elem.timeLeft -= (gamestyle.skipAnim) ? (effect_animInterval * 8) : effect_animInterval;
        if (elem.timeLeft <= 0){
            setTimeout(elem.onfinish(),0);
            effect.splice(i,1);
            --i;
        }
    }

    if (effect.length === 0){
        clearInterval(effect_timerID);
        effect_timerID = null;
    }
}


// 描画呼び出し
function paint(){
	buffContext.fillStyle = '#FFF';
	buffContext.fillRect(0, 0, cvWidth, cvHeight);
    
    drawGame();
    effect.forEach(function(elem,index,arr){
        elem.onpaint(buffContext,elem);
    });

    cvContext.drawImage(buffCanvas, 0, 0);
}


function drawGame(){
    let x,y;
    let nw,nh,w,h,ox,oy,srad;
    nw = gamerule.width;
    nh = gamerule.height;
    w = display.board.width;
    h = display.board.height;
    ox = display.board.offsetX;
    oy = display.board.offsetY;
    srad = Math.min(w/nw,h/nh) * (1 - display.board.padding) / 2;

	buffContext.fillStyle = display.color.background;
	buffContext.fillRect(0, 0, cvWidth, cvHeight);

    buffContext.strokeStyle = display.color.border;
    for (y = 0; y < nh; ++y){
        for (x = 0; x < nw; ++x){
            buffContext.strokeRect(ox+w*x/nw, oy+h*y/nh, (w)/nw, (h)/nh);
        }
    }

    for (y = 0; y < nh; ++y){
        for (x = 0; x < nw; ++x){
            if (game.field[y][x] !== 0){
                if (game.field[y][x] == 1){
                    buffContext.fillStyle = display.color.stoneBlackFill;
                    buffContext.strokeStyle = display.color.stoneBlackStroke;
                }else if (game.field[y][x] == -1){
                    buffContext.fillStyle = display.color.stoneWhiteFill;
                    buffContext.strokeStyle = display.color.stoneWhiteStroke;
                }
                buffContext.beginPath();
                buffContext.arc(ox+w*(2*x+1)/nw/2, oy+h*(2*y+1)/nh/2, srad,0,2*Math.PI);
                buffContext.fill();
                buffContext.beginPath();
                buffContext.arc(ox+w*(2*x+1)/nw/2, oy+h*(2*y+1)/nh/2, srad,0,2*Math.PI);
                buffContext.stroke();

            }else{
                if (work.hints[y][x]){
                    buffContext.strokeStyle = display.color.cellHintsStroke;
                    buffContext.strokeRect(ox+w*x/nw+((w)/nw/2-srad), oy+h*y/nh+((h)/nh/2-srad), srad*2, srad*2);
                }
            }
        }
    }
}

// 石を置く．
// 置けない場所に置こうとした場合の挙動の例外処理は行わない．
// @return 反した数
function putStone(field,turn,x,y){
    function dfs(x,y,turn,vx,vy){
        if (x < 0 || y < 0 || gamerule.width <= x || gamerule.height <= y) return false;
        if (field[y][x] === 0) return false;
        if (field[y][x] === turn) return 0;
        let r = dfs(x+vx,y+vy,turn,vx,vy);
        if (r !== false){
            field[y][x] = turn;
            return r + 1;
        }
        return false;
    }
    field[y][x] = turn;
    // memo: false+2+1 = 3
    return  dfs(x-1,y-1,turn,-1,-1) + dfs(x  ,y-1,turn, 0,-1) + dfs(x+1,y-1,turn, 1,-1)
          + dfs(x-1,y  ,turn,-1, 0) +                         + dfs(x+1,y  ,turn, 1, 0)
          + dfs(x-1,y+1,turn,-1, 1) + dfs(x  ,y+1,turn, 0, 1) + dfs(x+1,y+1,turn, 1, 1);
}


// 置くことができるセルは1以上の値
function createHintsField(field,turn){
    let result_hints = new Array(gamerule.height);
    let i,x,y,l,r;
    for (y = 0; y < gamerule.height; ++y){
        result_hints[y] = new Array(gamerule.width);
        for (x = 0; x < gamerule.width; ++x){
            result_hints[y][x] = 0;
        }
    }
    // yoko
    for (y = 0; y < gamerule.height; ++y){
        l = 0;
        for (r = 0; r < gamerule.width; ++r){
            if (field[y][r] === 0){ // empty
                if (field[y][l] === turn){
                    result_hints[y][r] += r-l-1;
                }
                l = r;
            }else if (field[y][r] === turn){ // own
                if (field[y][l] === 0){
                    result_hints[y][l] += r-l-1;
                }
                l = r;
            }
        }
    }
    //tate
    for (x = 0; x < gamerule.width; ++x){
        l = 0;
        for (r = 0; r < gamerule.height; ++r){
            if (field[r][x] === 0){ // empty
                if (field[l][x] === turn){
                    result_hints[r][x] += r-l-1;
                }
                l = r;
            }else if (field[r][x] === turn){ // own
                if (field[l][x] === 0){
                    result_hints[l][x] += r-l-1;
                }
                l = r;
            }
        }
    }
    // migishita
    for (i = 3-gamerule.width; i < gamerule.height - 2; ++i){
        l = Math.max(0,-i);
        for (r = l; r < gamerule.width && r+i < gamerule.height; ++r){
            if (field[i+r][r] === 0){ // empty
                if (field[i+l][l] === turn){
                    result_hints[i+r][r] += r-l-1;
                }
                l = r;
            }else if (field[i+r][r] === turn){ // own
                if (field[i+l][l] === 0){
                    result_hints[i+l][l] += r-l-1;
                }
                l = r;
            }
        }
    }
    // migiue
    for (i = 2; i < gamerule.height + gamerule.width - 3; ++i){
        l = Math.max(0,i-gamerule.height+1);
        for (r = l; r < gamerule.width && 0 <= i-r; ++r){
            if (field[i-r][r] === 0){ // empty
                if (field[i-l][l] === turn){
                    result_hints[i-r][r] += r-l-1;
                }
                l = r;
            }else if (field[i-r][r] === turn){ // own
                if (field[i-l][l] === 0){
                    result_hints[i-l][l] += r-l-1;
                }
                l = r;
            }
        }
    }
    return result_hints;
}


function copyMatrix(mat){
    let result = new Array(mat.length);
    for (let i = 0; i < mat.length; ++i){
        result[i] = mat[i].slice();
    }
    return result;
}