
const Algo = {

    kmeans: function(items){
        if (items.length < 2) return;

        const center = [
            ({x: 0, y: 0}),
            ({x: 0, y: 0})
        ];
        const nItems = items.length;
        let label = new Array(nItems).fill(0);
        for (let i = 0; i < nItems/2; ++i) label[i] = 1;

        function dist2(p1, p2) {
            return (p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y);
        }
        
        for (let loop = 0; loop < 19; ++loop) {
            const cnt = [0, 0];
            center[0].x = 0;
            center[0].y = 0;
            center[1].x = 0;
            center[1].y = 0;
            for (let i = 0; i < nItems; ++i){
                const l = label[i];
                center[l].x += items[i].x;
                center[l].y += items[i].y;
                cnt[l]++;
            }
            if (cnt[0] > 0){
                center[0].x /= cnt[0];
                center[0].y /= cnt[0];
            }
            if (cnt[1] > 0){
                center[1].x /= cnt[1];
                center[1].y /= cnt[1];
            }

            for (let i = 0; i < nItems; ++i) {
                const d0 = dist2(items[i], center[0]);
                const d1 = dist2(items[i], center[1]);
                label[i] = d0 < d1 ? 0 : 1;
            }
        }

        for (let i = 0; i < nItems; ++i){
            items[i].label = label[i];
        }
    },

    
    greedy: function(items){
        if (items.length < 2) return;

        const nItems = items.length;

        let pque = [];

        function dist2(p1, p2) {
            return (p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y);
        }

        for (let i = 0; i < nItems-1; ++i) {
            for (let j = i+1; j < nItems; ++j) {
                pque.push([dist2(items[i], items[j]), i, j]);
            }
        }
        pque = pque.sort();

        const uf_data = new Array(nItems).fill(-1);
        const uf_root = (i)=>(uf_data[i] < 0 ? i : (uf_data[i] = uf_root(uf_data[i])));
        const uf_connect = (i, j)=>{
            const ri = uf_root(i);
            const rj = uf_root(j);
            if (ri == rj) return;
            if (-uf_data[ri] < -uf_data[rj]) {
                uf_data[rj] += uf_data[ri];
                uf_data[ri] = rj;
            }
            else {
                uf_data[ri] += uf_data[rj];
                uf_data[rj] = ri;
            }
        };

        let comp = nItems;

        for (let p of pque) {
            const i = p[1];
            const j = p[2];
            if (uf_root(i) === uf_root(j)) continue;
            uf_connect(i, j);
            --comp;
            if (comp <= 2) break;
        }

        let r0 = uf_root(0);
        for (let i = 0; i < nItems; ++i) {
            let r = uf_root(i);
            if (r === r0){
                items[i].label = 1;
            }
            else {
                items[i].label = 0;
            }
        }
    },

    
    maxcut_exptime: function(items){
        if (items.length < 2) return;
        if (items.length >= 20){
            alert("too many items");
            return;
        }

        const nItems = items.length;

        function dist2(p1, p2) {
            return (p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y);
        }

        let bestSel = null;
        let bestVal = 0;

        function dfs(sel, idx, total){
            if (idx == nItems) {
                if (total > bestVal){
                    bestSel = sel.concat();
                    bestVal = total;
                }
                return;
            }
            let t0 = 0, t1 = 0;
            for (let i = 0; i < idx; ++i){
                const d = dist2(items[i], items[idx]);
                if (sel[i] === 0)
                    t0 += d;
                else
                    t1 += d;
            }
            sel.push(0);
            dfs(sel, idx+1, total + t1);
            sel.pop();
            sel.push(1);
            dfs(sel, idx+1, total + t0);
            sel.pop();
        }

        dfs([], 0, 0);

        for (let i = 0; i < nItems; ++i){
            items[i].label = bestSel[i];
        }

    }

};

