
// ===============================
// Monte carlo Tree AI
// ===============================
// 確率的に良いスコアの手を選択
appendAI(function(){


    const tryCount = 600; // 試行回数

    this.setup = function(gamerule){
        // 開始時に実行するコードを書く．
        // gamerule = {width : Number , height : Number}
        // グローバル変数のgameruleと同じものが与えられる．
    }

    this.action = function(field, turn, hints){
        // 番が回ってきたときに実行するコードを書く．
        // field : 二次元配列(field[y][x] 1 -> 黒, 0 -> 空 , -1 -> 白)
        // turn : 自分の石の色(1 or -1)
        // hints : 二次元配列(hints[y][x] === 置くことができる?)

        // x,yを石を置きたい座標としたハッシュ{'x':x, 'y':y}を出力する．

        function simulateMonteCarlo(f_field, f_turn, f_hints){
            let twice = false;
            while (true){
                let able = [];
                for (let y = 0; y < gamerule.height; ++y){
                    for (let x = 0;x < gamerule.width; ++x){
                        if (f_hints[y][x]){
                            able.push([y,x]);
                        }
                    }
                }
                if (able.length === 0){
                    if (twice) break;
                    twice = true;
                    continue;
                }else{
                    twice = false;
                }
                let move = able[Math.floor(Math.random()*able.length)];
                putStone(f_field,f_turn,move[1],move[0]);
                f_turn = -f_turn;
                f_hints = createHintsField(f_field,f_turn);
            }
            let final = 0;
        
            for (let y = 0; y < gamerule.height; ++y){
                for (let x = 0;x < gamerule.width; ++x){
                    final += f_field[y][x];
                }
            }

            return final;
        }


        let able = [];
        for (let y = 0; y < gamerule.height; ++y){
            for (let x = 0;x < gamerule.width; ++x){
                if (hints[y][x]){
                    able.push({'x':x,'y':y,'n':0,'score':0});
                }
            }
        }
        for (let count = 0; count < tryCount; ++count){
            let i = Math.floor(Math.random()*able.length);

            let tmpf = copyMatrix(field);
            putStone(tmpf,turn,able[i].x,able[i].y);
            let sc = turn*simulateMonteCarlo(tmpf,-turn,createHintsField(tmpf,-turn));

            able[i].n += 1;
            able[i].score += tmpf;
        }

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

        return answer;
    }

},'montecarlotree');
