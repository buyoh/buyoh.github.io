
// https://bl.ocks.org/mbostock/4063269


$(()=>{

    $("#btn_execute").on("click", onClick_execute);
    readyD3js();

});

function onClick_execute(ev){
    const prm = $("#in_param").val();
    const id = $("#in_userID").val(); // 
    Promise.all([new Promise((resolve, reject)=>{
        $.getJSON("https://yukicoder.me/api/v1/solved/"+prm+"/"+id, (json)=>{
            resolve(json);
        }).fail(()=>{reject();});
    }), new Promise((resolve, reject)=>{
        $.getJSON("https://yukicoder.me/api/v1/problems/", (json)=>{
            resolve(json);
        }).fail(()=>{reject();});
    })]).then(([solvedJson, problemsJson])=>{
        [p,st,ut] = processJson(solvedJson, problemsJson);
        updateD3js(d3.select("#svg_solved"), st);
        updateD3js(d3.select("#svg_unsolved"), ut);
    });
}


function readyD3js(){
    
}


// d3jsツライ
function updateD3js(svg_main, data){
    let color = d3.scaleOrdinal(d3.schemeCategory20);
    lo = 0;

    const list = [];
    for (const k in data)
        list.push({
            name:k,
            value: data[k].reduce((s,e)=>(s+e.Level),0),
            count: data[k].length}
        );

    const root = d3.hierarchy({children: list})
        .sum(function(d) { return d.value; })
        .each(function(d) {
            d.id = lo++; // TODO:
        });

    const pack = d3.pack()
        .size([800, 800]) // TODO:
        .padding(1.5);

    pack(root);

    const node = svg_main.selectAll(".node")
        .data(root.leaves()) // .data(pack(root).leaves())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    
    node.append("circle")
        .attr("id", function(d) { return d.id; })
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d, i) { return color(i); });
    
    // node.append("text")
    //     // .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
    //     .selectAll("tspan")
    //     .data(function(d) { return 256; }) // TODO:
    //     .enter().append("tspan")
    //     .attr("x", 0)
    //     .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
    //     .text(function(d) { console.log(d.data); return d.data.name; });

    node.append("text")
        .style("text-anchor", function(d) { return "middle"; })
        .text(function(d) { return d.data.name;  });

    node.append("title")
        .text(function(d) { return d.data.name+"\nレベル:"+d.data.value+"\n問題数:"+d.data.count; });
}


function processJson(solvedJson, problemsJson){
    const problems = {};
    const allTags = {};
    const solvedTags = {};
    const unsolvedTags = {};
    
    problemsJson.forEach((problem, i, a)=>{
        if (problem.ProblemType !== 0) return;
        problems[problem.No] = problem;
        const ts = problem.Tags.split(',');
        ts.forEach((tag, i, a)=>{
            tag = convertTag(tag);
            if (!allTags[tag]) allTags[tag] = [];
            if (tag !== "")
            allTags[tag].push({No: problem.No, Level: problem.Level});
        });
    });

    solvedJson.forEach((problem, i, a)=>{
        if (problem.ProblemType !== 0) return;
        const ts = problem.Tags.split(',');
        ts.forEach((tag, i, a)=>{
            tag = convertTag(tag);
            if (!solvedTags[tag]) solvedTags[tag] = [];
            if (tag !== "")
            solvedTags[tag].push({No: problem.No, Level: problem.Level});
        });
    });

    for (const tag in allTags){
        if (!solvedTags[tag])
            unsolvedTags[tag] = allTags[tag];
        else{
            const ut = allTags[tag].filter((v,i,a)=>(solvedTags[tag].every((u,i,a)=>(v.No != u.No))));
            if (ut.length) unsolvedTags[tag] = ut;
        }
    }

    return [problems, solvedTags, unsolvedTags];
}


const convertionTag = [
    ["辞書順", "辞書列順", "辞書順最小"],
    ["セグメント木", "セグメントツリー", "segment-tree"],
    ["組合せ", "組み合わせ"],
    ["多倍長整数", "多倍長"],
    ["動的計画法", "DP"],
    ["二分探索", "2分探索"],
    ["いもす法", "imos法", "一次元いもす法", "ニ次元いもす法"],
    ["実装", "実装問題"],
    ["約数", "約数列挙"],
    ["ローリングハッシュ", "rolling-hash"]
    ["UnionFind", "union-find"],
    ["剰余", "Mod"]
];
function convertTag(tag){
    const r = convertionTag.find((v)=>(v ? v.includes(tag) : false));
    return r ? r[0] : tag;
}