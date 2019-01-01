"use strict";

//

function includeBox(bx, by, lx, ly, x, y){
    if (bx > lx) return includeBox(lx, by, bx, ly, x, y);
    if (by > ly) return includeBox(bx, ly, lx, by, x, y);
    return bx <= x && x <= lx && by <= y && y <= ly;
}

// 

$(()=>{

    /**
     * @type {CanvasRenderingContext2D}
     */
    let ctx = null;
    let kWidth, kHeight;
    
    let items = [];
    
    let editmode = 'put';

    (()=>{
        const domDisp = $("#display");
        ctx = domDisp[0].getContext('2d');
        kWidth = +domDisp.prop("width");
        kHeight = +domDisp.prop("height");

        domDisp.on("click", (e)=>{display_onClick(e.offsetX/kWidth, e.offsetY/kHeight);});
        domDisp.on("mousedown", (e)=>{display_onMouseDown(e.offsetX/kWidth, e.offsetY/kHeight);});
        domDisp.on("mousemove", (e)=>{display_onMouseMove(e.offsetX/kWidth, e.offsetY/kHeight);});
        domDisp.on("mouseup", (e)=>{display_onMouseUp(e.offsetX/kWidth, e.offsetY/kHeight);});
        domDisp.on("mouseleave", (e)=>{display_onMouseLeave(e.offsetX/kWidth, e.offsetY/kHeight);});

        for (let name in Algo){
            $("<input type='button'>")
                .val(name)
                .on("click", {name: name}, (e)=>{applyAlgorithm(e.data.name);})
                .appendTo($("#actions"));
        }

        $("#pallet_put").on("change", ()=>{ if ($("#pallet_put").prop("checked")) editmode = "put"; });
        $("#pallet_del").on("change", ()=>{ if ($("#pallet_del").prop("checked")) editmode = "del"; });
    })();

    let drag = false;
    let beginX, beginY;
    let lastX, lastY;

    function paintDisplay(){
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, kWidth, kHeight);
        ctx.strokeStyle = "#222";
        for (let item of items) {
            ctx.fillStyle =
                item.label === 0 ? "#e40":
                item.label === 1 ? "#04e": "#ccc";
            ctx.beginPath();
            ctx.arc(item.x*kWidth, item.y*kHeight, 10, 0, Math.PI*2, false);
            ctx.stroke();
            ctx.fill();
        }
        if (drag){
            ctx.fillStyle = "#06ea";
            ctx.fillRect(beginX*kWidth, beginY*kHeight, (lastX-beginX)*kWidth, (lastY-beginY)*kHeight);
        }
    }

    function addItem(x, y){
        items.push({
            x: x,
            y: y,
            label: null
        });
    }

    function deleteItem(bx, xy, lx, ly){
        let o = 0;
        for (let i = 0; i < items.length; ++i){
            if (includeBox(beginX, beginY, lastX, lastY, items[i].x, items[i].y)){
                let t = items[i];
                items[i] = items[o];
                items[o] = t;
                ++o; 
            }
        }
        items = items.splice(o);
    }

    function display_onClick(mouseX, mouseY){
        if (editmode == "put"){
            addItem(mouseX, mouseY);
            window.requestAnimationFrame(paintDisplay);
        }
    }

    function display_onMouseDown(mouseX, mouseY){
        if (editmode == "del"){
            drag = true;
            beginX = lastX = mouseX;
            beginY = lastY = mouseY;
        }
    }
    function display_onMouseMove(mouseX, mouseY){
        if (drag) {
            lastX = mouseX;
            lastY = mouseY;
            window.requestAnimationFrame(paintDisplay);
        }
    }
    function display_onMouseUp(mouseX, mouseY){
        if (drag) {
            drag = false;
            deleteItem(beginX, beginY, lastX, lastY);
            window.requestAnimationFrame(paintDisplay);
        }
    }
    function display_onMouseLeave(mouseX, mouseY){
        drag = false;
    }

    function applyAlgorithm(name){
        Algo[name](items);
        window.requestAnimationFrame(paintDisplay);
    }
});


//
