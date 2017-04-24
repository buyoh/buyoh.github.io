
// ===============================
// BeamSearch AI
// ===============================
// 良いスコアの手を複数選択して最後までシミュレート
// TODO: よわい
appendAI(function(){

    this.tryCount = 1;
    this.currentCount = this.tryCount;

    this.beamSize = 15;
    this.beamDepth = 60;

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
                    able.push({'x':x,'y':y});
                }
            }
        }
        this.tryCount = able.length;

        let answer;
        let answer_s = null;


        setTimeout(function(ai){
            function finalScore(f_field){
                let score = 0;
                for (let y = 0; y < gamerule.height; ++y){
                    for (let x = 0;x < gamerule.width; ++x){
                        score += turn * f_field[y][x];
                    }
                }
                return score;
            }
            function heuristic(f_field, f_turn){
                let score = 0;
                //let sp = 0;
                for (let y = 0; y < gamerule.height; ++y){
                    for (let x = 0;x < gamerule.width; ++x){
                        score += f_turn*f_field[y][x];
                        //sp += !(f_field[y][x])-0;
                    }
                }
                // if (sp < 10) return score;
                // score = 0;
// 
                // let _hints = createHintsField(f_field, f_turn);
                // for (let i = 0; i < gamerule.height; ++i){
                //     for (let j = 0;j < gamerule.width; ++j){
                //         score += ((!!_hints[i][j])-0);
                //     }
                // }
                return score;
            }

            // 
            function beamSimulate(fieldStack, f_turn, leftDepth, ai){

                let nextFieldStack = [];

                for (let i = 0; i < fieldStack.length; ++i){
                    let t_field = fieldStack[i];
                    let f_hints = createHintsField(t_field, f_turn);

                    let able = [];
                    for (let y = 0; y < gamerule.height; ++y){
                        for (let x = 0;x < gamerule.width; ++x){
                            if (f_hints[y][x]){
                                able.push([y,x]);
                            }
                        }
                    }
                    if (able.length === 0){
                        nextFieldStack.push(t_field);
                    }else{
                        for (let j = 0; j < able.length; ++j){
                            let tmpf = copyMatrix(t_field);
                            let move = able[j];
                            putStone(tmpf, f_turn, move[1], move[0]);
                            nextFieldStack.push(tmpf);
                        }
                    }
                }

                for (let i = 0; i < nextFieldStack.length; ++i){
                    nextFieldStack[i] = [heuristic(nextFieldStack[i], f_turn)+0.001*i, nextFieldStack[i]];
                }
                nextFieldStack.sort(function(l,r){return r[0]-l[0];});
                
                let result = [];
                for (let i = 0; i < nextFieldStack.length && i < ai.beamSize; ++i){
                    result.push(nextFieldStack[i][1]);
                }

                if (leftDepth <= 0){
                    let score = 0;
                    score = result.reduce(function(p,c,i,a){return p + finalScore(c);}, 0);
                    return score;
                }else{
                    return beamSimulate(result, -f_turn, leftDepth - 1, ai);
                }
            }


            if (ai.currentCount < ai.tryCount){
                let move = able[ai.currentCount];
                let tmpf = copyMatrix(field);
                putStone(tmpf, turn, move.y, move.x);

                let h = -beamSimulate([tmpf], -turn, ai.beamDepth, ai);

                if (answer_s === null || answer_s < h){
                    answer_s = h;
                    answer = move;
                }

                ai.currentCount += 1;
                setTimeout(arguments.callee, 0, ai);

            }else{
                callback(answer);
            }
        },0,this);

    }

    this.getProgress = function(){
        // AIの思考進捗を[0,1]の範囲で返す．
        return this.currentCount / Math.max(1,this.tryCount);
    }

},'beam');
