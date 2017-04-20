
// ===============================
// Monte carlo Tree AI (mark2)
// ===============================
// 確率的に良いスコアの手を選択
// 探索木の再利用機能を追加
appendAI(function(){

    this.tryCount = 100; // 試行回数
    this.perLoopCount = 4;
    this.currentCount = this.tryCount;

    this.tryWidth = 4;

    this.setup = function(gamerule){
        // 開始時に実行するコードを書く．
        // gamerule = {width : Number , height : Number}
        // グローバル変数のgameruleと同じものが与えられる．

    }

    this.action = function(field, turn, hints, callback){
        // 番が回ってきたときに実行するコードを書く．
        // field : 二次元配列(field[y][x] 1 -> 黒, 0 -> 空 , -1 -> 白)
        // turn : 自分の石の色(1 or -1)
        // hints : 二次元配列(hints[y][x] === 置くことができる?)
        // callback : 処理が終わったら呼び出す

        // x,yを石を置きたい座標としたハッシュ{'x':x, 'y':y}を出力する．

        this.currentCount = 0;

        

        let able = [];
        for (let y = 0; y < gamerule.height; ++y){
            for (let x = 0;x < gamerule.width; ++x){
                if (hints[y][x]){
                    able.push({'x':x,'y':y,'n':0,'score':0});
                }
            }
        }

        setTimeout(function(ai){
            function finalScore(f_field){
                let score = 0;
            
                for (let y = 0; y < gamerule.height; ++y){
                    for (let x = 0;x < gamerule.width; ++x){
                        score += f_field[y][x];
                    }
                }
                return score;
            }

            function simulateMonteCarlo(f_field, f_turn, tryWidth, twice=false){

                let f_hints = createHintsField(f_field, f_turn);

                let able = [];
                for (let y = 0; y < gamerule.height; ++y){
                    for (let x = 0;x < gamerule.width; ++x){
                        if (f_hints[y][x]){
                            able.push([y,x]);
                        }
                    }
                }
                if (able.length === 0){
                    if (twice) {
                        return finalScore(f_field);
                    }
                    else
                        return simulateMonteCarlo(f_field, -f_turn, tryWidth, true);
                }else{
                    twice = false;
                }

                let result = 0;
                for (let cnt = 0; cnt < tryWidth; ++cnt){
                    let tmpf = copyMatrix(f_field);
                    let move = able[Math.floor(Math.random()*able.length)];
                    putStone(tmpf,f_turn,move[1],move[0]);
                    result += simulateMonteCarlo(tmpf, -f_turn, Math.max(tryWidth - 1, 1));
                }
                
                return result;
            }


            if (ai.currentCount < ai.tryCount){
                for (let cnt = 0; cnt < ai.perLoopCount; ++cnt){
                    let i = Math.floor(Math.random()*able.length);

                    let tmpf = copyMatrix(field);
                    putStone(tmpf, turn, able[i].x, able[i].y);
                    let sc = turn*simulateMonteCarlo(tmpf, -turn, ai.tryWidth);

                    able[i].n += 1;
                    able[i].score += sc;
                }
                ai.currentCount += ai.perLoopCount;

                setTimeout(arguments.callee, 0, ai);

            }else{
                let answer = null;
                let answer_s = null;

                for(let i = 0; i < able.length; ++i){
                    if (able[i].n === 0) continue;

                    let h = able[i].score / able[i].n;

                    if (answer_s === null || answer_s < h){
                        answer_s = h;
                        answer = able[i];
                    }
                }
                callback(answer);
            }
        },0,this);

    }

    this.getProgress = function(){
        // AIの思考進捗を[0,1]の範囲で返す．
        return this.currentCount / this.tryCount;
    }

},'montecarlotree-2');
