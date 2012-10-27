$(document).ready(function(){
    var canvas = $("#gameCanvas");
    var context = canvas.get(0).getContext("2d");
    
    //カンバスサイズ
    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();
    
    var previousBoxes = new Array();
    var currentBoxes = new Array();
    var goalBoxes = new Array();
    
    var currentPlasmids = new Array();
    var plasmid1 = new Plasmid(new Array("E","b","X","1","S","n","P"), new Array("1"), true);
    var plasmid2 = new Plasmid(new Array("E","b","X","2","S","b","P"), new Array("1"), true);
    var plasmid3 = new Plasmid(new Array("X","3","S","b","P"), new Array("1"), false);
    
    var dialogueBoxMode = false;
    
    function init(){
        currentPlasmids.push(plasmid1);
        currentPlasmids.push(plasmid2);
        currentPlasmids.push(plasmid3);
        for(var i=0; i<currentPlasmids.length; ++i){
            var tmpPlasmid = currentPlasmids[i];
            var tmpWidth = tmpPlasmid.getLength();
            currentBoxes.push(new Box(0, 240, tmpWidth+32+32, 160));
            console.log("Box with Width %d Pushed when init", tmpWidth+64+64);
        }
        setBoxesPositionX(currentBoxes);
    }
    
    init();

    //
    //ゲーム設定
    //
    //bigboxes
    var nTotalSelect = 0;
    var focusedBox;
    var focuesdIndex;
    var selectionEnable = false;
    var siteSelection = new SiteSelection();
    var boxes = new Array();
    for(var i=0; i<3; ++i){
        var tmpBox = new Box(i*200, i*240, 32, 160);
        boxes.push(tmpBox);
    }

    
    $(canvas).mousedown(function(e){
        if(dialogueBoxMode){
            //process
            
            dialogueBoxMode = false;
            return;
        }
        var canvasOffset = canvas.offset();
        var canvasX = Math.floor(e.pageX-canvasOffset.left);
        var canvasY = Math.floor(e.pageY-canvasOffset.top);
        console.log("%d, %d\n", canvasX, canvasY);
    
        
        //big boxes
        for(var i=0; i<currentBoxes.length; ++i){
            var tmpBox = currentBoxes[i];
            if(tmpBox.x < canvasX && canvasX < tmpBox.x+tmpBox.width && 
                tmpBox.y < canvasY && canvasY < tmpBox.y+tmpBox.height){
                tmpBox.selected = !tmpBox.selected;
            }else{
                //tmpBox.selected = false;
            }
        }
        nTotalSelect = 0;
        for(var i=0; i<currentBoxes.length; ++i){
            if(currentBoxes[i].selected){nTotalSelect++; focusedBox = currentBoxes[i]; focuesdIndex=i;};
        }
        console.log("%d Big Box selected", nTotalSelect);
        
        //small boxes
        switch(nTotalSelect){
            case 0:
                siteSelection.reset();
                break;
            case 1:
                siteSelection.enable = true;
                if(focusedBox.x+focusedBox.width*0/4 < canvasX  && canvasX < focusedBox.x+focusedBox.width/4 * 1 && 400 < canvasY && canvasY < 440){siteSelection.e = !siteSelection.e; console.log("e changed");}
                if(focusedBox.x+focusedBox.width*1/4 < canvasX && canvasX < focusedBox.x+focusedBox.width/4 * 2 && 400 < canvasY && canvasY < 440){siteSelection.x = !siteSelection.x; console.log("x changed");}
                if(focusedBox.x+focusedBox.width*2/4 < canvasX  && canvasX < focusedBox.x+focusedBox.width/4 * 3 && 400 < canvasY && canvasY < 440){siteSelection.s = !siteSelection.s; console.log("s changed");}
                if(focusedBox.x+focusedBox.width*3/4 < canvasX && canvasX < focusedBox.x+focusedBox.width/4 * 4 && 400 < canvasY && canvasY < 440){siteSelection.p = !siteSelection.p; console.log("p changed");}
                break;
            case 2:
                siteSelection.reset();
                console.log("ligate?");
                for(var i=0; i<currentBoxes.length; ++i){
                    var tmpBox = currentBoxes[i];
                    tmpBox.selected = false;
                }
                break;
            default:
                break;
        }
        
        //if two restriction sites selected
        if(siteSelection.twoSitesSelected()){
            var candidatePlasmids = new Array();
            currentPlasmids[focuesdIndex].cut(siteSelection, candidatePlasmids);
            if(candidatePlaamids.length != 2){siteSelection.reset();}
        }

    });
    
    
    
    function draw(){
        if(dialogueBoxMode){
            context.clearRect(0,0, canvasWidth, canvasHeight);
        }
        context.clearRect(0,0, canvasWidth, canvasHeight);
        for(var i=0; i<currentBoxes.length; ++i){
            var tmpPlasmid = currentPlasmids[i]
            var tmpBox = currentBoxes[i];
            tmpBox.render(context);
            tmpPlasmid.render(context, tmpBox);
        }
        //draw EXSP indicator
        if(siteSelection.enable){
            siteSelection.render(context, focusedBox.x, focusedBox.width);    
        }
        setTimeout(draw, 40);
        
        
    };
    draw();
        
});



function setBoxesPositionX(boxes){
    var totalWidth = 0;
    for(var i=0; i<boxes.length; ++i){
        var tmpBox = boxes[i];
        totalWidth += tmpBox.width;
    }
    console.log("total width %d", totalWidth);
    var interval = (960 - totalWidth) / (boxes.length+1);
    var tmpX = interval;
    for(var i=0; i<boxes.length; ++i){
        var tmpBox = boxes[i];
        tmpBox.x += tmpX;
        console.log("X set at %d", tmpX);
        tmpX += tmpBox.width + interval;
    }
}

//
//Classes
//
function Box(x, y, width, height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.selected = false;
    
    this.render = function(context){
        context.save();
        if(this.selected){
            context.fillStyle = "rgb(255, 0, 0)";
        }else{
            context.fillStyle = "rgb(128, 128, 128)";
        }
        context.fillRect(this.x, this.y, this.width, this.height);
        context.restore();
    };
}

function SiteSelection(){
    this.e = false;
    this.x = false;
    this.s = false;
    this.p = false;
    this.nSelected = 0;
    this.enable = false;
    
    this.init = function(){
        this.e = false;
        this.x = false;
        this.s = false;
        this.p = false;
        this.nSelected = 0;
        this.enable = true;
    }
    
    this.reset = function(){
        this.e = false;
        this.x = false;
        this.s = false;
        this.p = false;
        this.nSelected = 0;
        this.enable = false;
    }
    
    this.twoSitesSelected = function(){
        var nSite = 0;
        if(this.e){nSite++;}
        if(this.x){nSite++;}
        if(this.s){nSite++;}
        if(this.p){nSite++;}
        if(nSite==2){return true;}else{return false};
    }

    this.render = function(context, x, width){
        context.save();
        context.font = "24px Futura";
        context.textAlign = "center"
        if(this.e){
            context.fillStyle = "rgb(0,0,0)";
        }else{
            context.fillStyle = "rgb(192,192,192)";
        }
        context.fillText("E", x + width/5 * 1, 430);
        if(this.x){
            context.fillStyle = "rgb(0,0,0)";
        }else{
            context.fillStyle = "rgb(192,192,192)";
        }
        context.fillText("X", x+width/5 * 2, 430);
        if(this.s){
            context.fillStyle = "rgb(0,0,0)";
        }else{
            context.fillStyle = "rgb(192,192,192)";
        }
        context.fillText("S", x+width/5 * 3, 430);
        if(this.p){
            context.fillStyle = "rgb(0,0,0)";
        }else{
            context.fillStyle = "rgb(192,192,192)";
        }
        context.fillText("P", x+width/5 * 4, 430);
        context.restore();
    }

}



//example of bioBrickParts: new Array("E","b","X","b","1","b","S","n","P")
function Plasmid(bioBrickParts, backBoneParts, backBone){
    this.bioBrickParts = bioBrickParts;
    this.backBoneParts = backBoneParts;
    this.backBone = backBone;
    
    
    this.cut = function (siteSelection,candidatePlasmids){
        if(siteSelection.e){
        }
    }
    
    
    this.getLength= function(){
        var partsLength = 0;
        for(var i=0; i<this.bioBrickParts.length; ++i){
            var tmpString = this.bioBrickParts[i];
            switch(tmpString){
                case "E":
                case "X":
                case "S":
                case "P":
                case "M":
                    break;
                case "b":
                    partsLength++;
                    break;
                case "n":
                    partsLength+=2;
                    break;
                default:
                    partsLength += 2+2*parseInt(tmpString);
            }
        }
        if(this.backBone){partsLength+=4;};
        partsLength *= 16;
        console.log("getLength returned %d", partsLength);
        return partsLength;
    };
    
    this.render =function(context, box){
        context.save();
        if(this.backBone){
            context.translate(box.x+32, box.y+32);
        }else{
            context.translate(box.x, box.y+56);
        }
        
        var partsLength = 0;
        for(var i=0; i<this.bioBrickParts.length; ++i){
            var tmpString = this.bioBrickParts[i];
            switch(tmpString){
                case "E":
                case "X":
                case "S":
                case "P":
                case "M":
                    break;
                case "b":
                    partsLength++;
                    break;
                case "n":
                    partsLength+=2;
                    break;
                default:
                    partsLength += 2+2*parseInt(tmpString);
            }
        }
        partsLength *= 16;
        //console.log("partsLength = %d", partsLength);
        
        //Draw plasmid backbone;
        if(this.backBone){
            context.lineWidth = 2.5;
            context.beginPath();
            context.arc(32, 64, 32, -0.5 * Math.PI, -1.5 * Math.PI, true);
            context.arc(32+partsLength, 64, 32, -1.5 * Math.PI, -0.5 * Math.PI, true);
            context.stroke();
        }
        
        //Draw Parts
        var tmpX = 32;
        for(var i=0; i<this.bioBrickParts.length; ++i){
            var tmpString = this.bioBrickParts[i];
            switch(tmpString){
                case "E":
                case "X":
                case "S":
                case "P":
                case "M":
                    context.fillStyle = "rgb(0,0,0)"
                    context.font = "18px Futura";
                    context.textAlign = "center"
                    context.fillText(tmpString, tmpX, 16);
                    context.lineWidth = 1;
                    context.beginPath();
                    context.moveTo(tmpX, 24);
                    context.lineTo(tmpX, 40);
                    context.stroke();
                    break;
                case "b":
                    context.lineWidth = 2.5;
                    context.moveTo(tmpX, 32);
                    context.lineTo(tmpX+16, 32);
                    context.stroke();
                    tmpX+=16;
                    break;
                case "n":
                    tmpX+=32;
                    break;
                default:
                    context.lineWidth = 2.5;
                    context.moveTo(tmpX, 32);
                    context.lineTo(parseInt(tmpString)*32+tmpX+32, 32);
                    context.stroke();
                    context.fillStyle = "rgb(255, 128, 192)";
                    context.fillRect(tmpX+16, 16, parseInt(tmpString)*32, 32);
                    tmpX += 16+parseInt(tmpString)*32+16;
            }
        }
        
        context.restore();
    }

}


