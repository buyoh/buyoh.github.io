
// ===============================
// Monte carlo Tree AI
// ===============================
// 確率的に良いスコアの手を選択
// ただし，評価基準を『置いた石が何回反転されたか』
// 『角は取られないので強い』という性質をプログラムに組み込まなくても，自然と角を優先しようとする．
// (取られることはよくある)
appendAI(function(){

    this.tryCount = 1000; // 試行回数
    this.perLoopCount = 50;
    this.currentCount = this.tryCount;

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

        // 40 -40 10 -10...という数列
        function fzig(n){
            return Math.max(40/(2<<(n>>1)),1)*((n%2)*2-1);
        }

        function simulateMonteCarlo(f_field, f_turn, f_hints, point){
            let twice = false;
            let pointlist = [[f_field[point.y][point.x],[point.y,point.x],0]];
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

                for (let i = 0; i < pointlist.length; ++i){
                    let p = pointlist[i];
                    if (p[0] != f_field[p[1][0]][p[1][1]]){
                        p[0] = f_field[p[1][0]][p[1][1]];
                        ++p[2];
                    }
                }

                

                if (pointlist.length < 10){
                    pointlist.push([f_field[move[0]][move[1]],[move[0],move[1]],0]);
                }
            }
            let final = 0;

            for (let i = 0; i < pointlist.length; ++i){
                let p = pointlist[i];
                final += fzig(p[2])/(i+1);
            }
        
            // for (let y = 0; y < gamerule.height; ++y){
            //     for (let x = 0;x < gamerule.width; ++x){
            //         final += f_field[y][x];
            //     }
            // }

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

        setTimeout(function(ai){
            if (ai.currentCount < ai.tryCount){
                for (let cnt = 0; cnt < ai.perLoopCount; ++cnt){
                    let i = Math.floor(Math.random()*able.length);

                    let tmpf = copyMatrix(field);
                    putStone(tmpf,turn,able[i].x,able[i].y);
                    let sc = turn*simulateMonteCarlo(tmpf,-turn,createHintsField(tmpf,-turn),able[i]);

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

},'montecarlotree-F');
