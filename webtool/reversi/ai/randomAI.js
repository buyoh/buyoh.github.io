
// ===============================
// reversi RANDOM AI
// ===============================
// 完全ランダム
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

        let arr=[];
        for (let y = 0; y < gamerule.height; ++y){
            for (let x = 0;x < gamerule.width; ++x){
                if (hints[y][x]) arr.push({'y':y,'x':x});
            }
        }
        return arr[Math.floor(Math.random()*arr.length)];
    }

},'random');
