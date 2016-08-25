
var mainContext=null;
var scrWidth;
var scrHeight;

var internalCode=new Array(30); // memo:jsは勝手に拡張される

var timerid_code=null;

$(document).ready(function(){
	var canvasDom = $("#canvas_main")[0];
	mainContext = canvasDom.getContext('2d');
	scrWidth =canvasDom.width;
	scrHeight=canvasDom.height;

	$("#input_code").on("keyup",function(){
		if (timerid_code!=null){
			clearTimeout(timerid_code);
		}
		timerid_code = setTimeout(updateCode,2000);
	});
	$("#canvas_main").on("click",function(e){
		var x,y;
		x = e.offsetX;
		y = e.offsetY;
		$("#div_notice").text("click ("+x+","+y+")");
	})
	updateCode();
});


function updateCode(){
	timerid_code = null;

	var code = $("#input_code").val();

	internalCode[0]=0;

	var t,prm,name;
	code.split(/\r\n|\r|\n|:/).forEach(function(item, index, array){
		var t = /^\s*(\w+)\s+([a-f0-9\.\-]+(?:\s*,\s*[a-f0-9\.\-]+)*)?\s*$/.exec(item);
		if (!t) return;
		name = t[1];
		if (t[2])
			prm = t[2].split(/\s*,\s*/);
		else
			prm = [];
		internalCode[0]++;
		internalCode[internalCode[0]] = {"n":name,"p":prm};
	});

	if (internalCode.length - internalCode[0] > 100){
		internalCode.splice(internalCode[0]+1,internalCode.length - internalCode[0] - 1);
	}

	updateContext();
}

function updateContext(){
	if (!mainContext) return;

	mainContext.save();

	mainContext.fillStyle="#ffffff";
	mainContext.fillRect(0,0,scrWidth,scrHeight);

	var px,py;
	px=py=0;

	mainContext.strokeStyle="#000000";
	mainContext.lineWidth=4;
	mainContext.lineCap="round";
	mainContext.lineJoin="round";

	var i,n,j;
	var x,y;
	n=internalCode[0];
	for(i=1;i<=n;i++){
		j = internalCode[i];
		if (!j || !j.p || !j.n) continue;
		switch (j.n){
			case "line":
				if (j.p.length==2){
					x = j.p[0]-0;
					y = j.p[1]-0;
					mainContext.beginPath();
					mainContext.moveTo(px,py);
					mainContext.lineTo(x,y);
					mainContext.stroke();
					px=x;py=y;
				}else if (j.p.length==4){
					x = j.p[0]-0;
					y = j.p[1]-0;
					mainContext.beginPath();
					mainContext.moveTo(x,y);
					mainContext.lineTo(j.p[2]-0,j.p[3]-0);
					mainContext.stroke();
					px=x;py=y;
				}
				break;
			case "pos":
				px = j.p[0]-0;
				py = j.p[1]-0;
				break;
			case "color":
				if (j.p.length==1){
					mainContext.strokeStyle = "#"+j.p[0];
					mainContext.fillStyle = "#"+j.p[0];
				}else if (j.p.length==3){
					var color = "rgb("+j.p[0]+","+j.p[1]+","+j.p[2]+")";
					mainContext.strokeStyle = color;
					mainContext.fillStyle = color;
				}else if (j.p.length==4){
					var color = "rgba("+j.p[0]+","+j.p[1]+","+j.p[2]+","+j.p[3]+")";
					mainContext.strokeStyle = color;
					mainContext.fillStyle = color;
				}
				break;
			case "circle":
				if (j.p.length==3){
					// x,y,r,startarg,endarg,clockwise
					mainContext.beginPath();
					mainContext.arc(j.p[0]-0, j.p[1]-0, j.p[2]-0, 0, Math.PI * 2, false);
					mainContext.stroke();
				}
				break;
			case "polygon":
				if (j.p.length>=3 && (j.p.length-1)/2==(j.p[0]-0) && j.p.length%2==1){
					mainContext.beginPath();
					for (var k=1;k<j.p.length;k+=2){
						if (k==0)
							mainContext.moveTo(j.p[k]-0, j.p[k+1]-0);
						else
							mainContext.lineTo(j.p[k]-0, j.p[k+1]-0);
					}
					mainContext.closePath();
					mainContext.stroke();
				}
				break;
			case "pset":
				if (j.p.length==2){
					// x,y,r,startarg,endarg,clockwise
					mainContext.beginPath();
					mainContext.arc(j.p[0]-0, j.p[1]-0, 3, 0, Math.PI * 2, false);
					mainContext.fill();
				}
				break;
			case "box":
				break;
			case "scale":
				console.log("scale:no support.");
				break;
			default:
				break;
		}
	}

	mainContext.restore();
}

function strToCode(name,prm){
	switch(name){
		case "line":

			break;
	}
}