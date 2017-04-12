
// ===============================
// reversi Greedy AI (max-score , depth 1)
// ===============================
// 今置いたスコア-相手が取ることができるスコアの最大 を最大化
appendAI(function(){

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

        let answer = [];
        let answerScore = -9999999;
        for (let y = 0; y < gamerule.height; ++y){
            for (let x = 0;x < gamerule.width; ++x){
                if (hints[y][x]){

                    let nextField = copyMatrix(field);
                    putStone(nextField, turn, x,y);
                    let nextHints = createHintsField(nextField, -turn);
                    let enemyScore = 0;                   
                    for (let i = 0; i < gamerule.height; ++i){
                        for (let j = 0;j < gamerule.width; ++j){
                            enemyScore = Math.max(enemyScore, nextHints[y][x]);
                        }
                    }

                    let score = hints[y][x]-enemyScore;

                    if (answerScore < score){
                        answerScore = score;
                        answer = [{'x':x,'y':y}];
                    }else if (answerScore === score){
                        answer.push({'x':x,'y':y});
                    }
                }
            }
        }
        return answer[Math.floor(Math.random()*answer.length)];
    }

},'greedy d2-sc');
