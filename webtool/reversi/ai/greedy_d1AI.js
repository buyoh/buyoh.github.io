
// ===============================
// reversi Greedy AI (max-score , depth 0.5)
// ===============================
// 今置いたスコア を最大化
appendAI(function(){

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

        let answer = [];
        let answer_s = 0;
        for (let y = 0; y < gamerule.height; ++y){
            for (let x = 0;x < gamerule.width; ++x){
                if (answer_s < hints[y][x]){
                    answer_s = hints[y][x];
                    answer = [{'x':x,'y':y}];
                }else if (answer_s === hints[y][x]){
                    answer.push({'x':x,'y':y});
                }
            }
        }
        callback( answer[Math.floor(Math.random()*answer.length)] );
    }

    this.getProgress = function(){
        // AIの思考進捗を[0,1]の範囲で返す．
        return 1.0;
    }

},'greedy d1-s');
