$(document).ready(function(){

        
    var canvas = $("#gameCanvas");
    var context = canvas.get(0).getContext("2d");
    
    //カンバスサイズ
    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();
    
    var previousBoxes;
    var candidateBoxes;
    var currentBoxes;
    var goalBoxes;
    var nextBoxes;
    
    var candidatePlasmids;
    var previousPlasmids;
    var currentPlasmids;
    var goalPlasmids;
    var nextPlasmids;
    var stepCount;
    
    var stageCount = 1;
    
    var plasmid01 = new Plasmid(new Array("E","b","X","1","S","n","P"), new Array("1"), true);
    var plasmid02 = new Plasmid(new Array("E","b","X","2","S","b","P"), new Array("1"), true);
    var plasmid0g = new Plasmid(new Array("E","b","X","1","M","2","S","b","P"), new Array("1"), false);
    
    var plasmid11 = new Plasmid(new Array("E","b","X","1","S","b","P"), new Array("1"), true);
    var plasmid12 = new Plasmid(new Array("E","b","X","2","S","b","P"), new Array("1"), true);
    var plasmid1g = new Plasmid(new Array("E","b","X","1","M","2","S","b","P"), new Array("1"), false);
    
    var plasmid21 = new Plasmid(new Array("E","b","X","1","S","b","P"), new Array("1"), false);
    var plasmid22 = new Plasmid(new Array("E","b","X","b","S","b","P"), new Array("1"), true);
    var plasmid2g = new Plasmid(new Array("E","b","X","1","S","b","P"), new Array("1"), true);
    
    var plasmid31 = new Plasmid(new Array("E","b","X","1","S","b","P"), new Array("1"), true);
    var plasmid32 = new Plasmid(new Array("E","b","X","2","S","b","P"), new Array("1"), true);
    var plasmid33 = new Plasmid(new Array("E","b","X","3","S","b","P"), new Array("1"), true);
    var plasmid3g = new Plasmid(new Array("E","b","X","1","M","2","M","3","S","b","P"), new Array("1"), true);
    
    var dialogueBoxMode = false;
    var gameClearMode = false;
    var animationMode = false;
    var animationCount = 0;
    
    function init(){
        stepCount = 0;
        previousBoxes = new Array();
        candidateBoxes = new Array();
        currentBoxes = new Array();
        goalBoxes = new Array();
        nextBoxes = new Array();

        candidatePlasmids = new Array();
        previousPlasmids = new Array();
        currentPlasmids = new Array();
        nextPlasmids = new Array();
        goalPlasmids = new Array();
        switch(stageCount){
            case 1:
                currentPlasmids.push(plasmid11);
                currentPlasmids.push(plasmid12);
                goalPlasmids.push(plasmid1g);                
                break;
            case 2:
                currentPlasmids.push(plasmid21);
                currentPlasmids.push(plasmid22);
                goalPlasmids.push(plasmid2g);   
                break;
            case 3:
                currentPlasmids.push(plasmid31);
                currentPlasmids.push(plasmid32);
                currentPlasmids.push(plasmid33);
                goalPlasmids.push(plasmid3g);   
            default:
                break;
                
        }
        for(var i=0; i<currentPlasmids.length; ++i){
            var tmpPlasmid = currentPlasmids[i];
            var tmpWidth = tmpPlasmid.getLength();
            currentBoxes.push(new Box(0, 240, tmpWidth+32+32, 160));
            console.log("Box with Width %d Pushed when init", tmpWidth+64+64);
        }
        setBoxesPositionX(currentBoxes);
        for(var i=0; i<goalPlasmids.length; ++i){
            var tmpPlasmid = goalPlasmids[i];
            var tmpWidth = tmpPlasmid.getLength();
            goalBoxes.push(new Box(0, 240, tmpWidth+32+32, 160));
            console.log("Box with Width %d Pushed when init", tmpWidth+64+64);
        }
        setBoxesPositionX(goalBoxes);
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
        
        if(animationMode){
            return;
        }
        
        if(dialogueBoxMode){
            var canvasOffset = canvas.offset();
            var canvasX = Math.floor(e.pageX-canvasOffset.left);
            var canvasY = Math.floor(e.pageY-canvasOffset.top);
            console.log("%d, %d\n", canvasX, canvasY);
            for(var i=0; i<candidateBoxes.length; ++i){
                var tmpBox = candidateBoxes[i];
                var tmpIndex = i;
                if(tmpBox.x < canvasX && canvasX < tmpBox.x+tmpBox.width && 
                    tmpBox.y < canvasY && canvasY < tmpBox.y+tmpBox.height){
                    console.log("clicked exiting dailgue");
                    nextPlasmids.push(candidatePlasmids[i]);
                    nextBoxes.push(new Box(0, 240, candidatePlasmids[i].getLength()+32+32, 160));
                    dialogueBoxMode = false;
                    //animationMode = true;
                    candidatePlasmids = new Array();
                    candidateBoxes = new Array();
                    /////
                    for(var i=0; i<currentBoxes.length; ++i){
                        currentBoxes[i].selected = false;
                    }
                    //curretからpreviousにコピーする
                    previousPlasmids = new Array();
                    previousBoxes = new Array();
                    console.log(previousPlasmids);
                    for(var i=0; i<currentPlasmids.length; ++i){
                        previousPlasmids.push($.extend(true, {}, currentPlasmids[i]));
                    }
                    for(var i=0; i<currentBoxes.length; ++i){
                        previousBoxes.push($.extend(true, {}, currentBoxes[i]));
                    }
                    console.log(previousPlasmids);
                    
                    setBoxesPositionX(nextBoxes)
                    currentBoxes = nextBoxes;
                    currentPlasmids = nextPlasmids;
                    nextBoxes = new Array();
                    nextPlasmids = new Array();
                    /////////
                }else{
                    //tmpBox.selected = false;
                }
            }
            return;
        }
        
        var canvasOffset = canvas.offset();
        var canvasX = Math.floor(e.pageX-canvasOffset.left);
        var canvasY = Math.floor(e.pageY-canvasOffset.top);
        console.log("%d, %d\n", canvasX, canvasY);
    
        //リセット
        if(900 < canvasX && canvasX < 1024 && 600 < canvasY && canvasY < 640){
            console.log("reset");
            init();
        }

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
                candidatePlasmids = new Array();
                var tmpPlasmids = new Array();
                for(var i=0; i<currentBoxes.length; ++i){
                    if(currentBoxes[i].selected == true){
                        tmpPlasmids.push(currentPlasmids[i]);
                    }
                }
                ligateTwoParts(tmpPlasmids[0],tmpPlasmids[1],candidatePlasmids);
                //元の選択されているものを消して、新しいパーツを入れる
                //具体的にはcandidateが1つだけなら、選択されているものを消して、candidateから1つ入れて新しい手札にする。
                if(candidatePlasmids.length == 1){
                    //previousを設定
                    previousPlasmids = new Array();
                    previousBoxes = new Array();
                    for(var i=0; i<currentPlasmids.length; ++i){
                        previousPlasmids.push($.extend(true, {}, currentPlasmids[i]));
                    }
                    for(var i=0; i<currentBoxes.length; ++i){
                        previousBoxes.push($.extend(true, {}, currentBoxes[i]));
                    }

                    //新しいものを設定
                    nextPlasmids = new Array();
                    nextBoxes = new Array();
                    nextPlasmids.push(candidatePlasmids[0]);
                    nextBoxes.push(new Box(0, 240, candidatePlasmids[0].getLength()+32+32, 160));
                    for(var i=0; i<currentBoxes.length; ++i){
                        if(!currentBoxes[i].selected){
                            nextPlasmids.push($.extend(true, {}, currentPlasmids[i]));
                            nextBoxes.push($.extend(true, {}, currentBoxes[i]));
                        }
                    }
                    currentBoxes = nextBoxes;
                    currentPlasmids = nextPlasmids;
                    setBoxesPositionX(nextBoxes);
                    nextBoxes = new Array();
                    nextPlasmids = new Array();
                    console.log("afte ligation,"+currentBoxes.length+"boxes,"+currentPlasmids.length+"plasmids");
 
                    //previousの選択を解除
                    for(var i=0; i<previousBoxes.length; ++i){
                        var tmpBox = previousBoxes[i];
                        tmpBox.selected = false;
                    }
                    stepCount++;
                    console.log("STEPCOUNT INCLIMENTED TO %d", stepCount);
                }
                
                for(var i=0; i<currentBoxes.length; ++i){
                    var tmpBox = currentBoxes[i];
                    tmpBox.selected = false;
                }
                candidatePlasmids = new Array();
                break;
            default:
                break;
        }
        
        //if two restriction sites selected
        if(siteSelection.twoSitesSelected()){
            currentPlasmids[focuesdIndex].cut(siteSelection, candidatePlasmids);
            siteSelection.reset();
            if(candidatePlasmids.length < 2){
                console.log("no Change during cutting");
                siteSelection.reset()
                for(var i=0; i<currentBoxes.length; ++i){
                    currentBoxes[i].selected = false;
                }
                candidatePlasmids = new Array();
            }else{
                for(var i=0; i<currentPlasmids.length; ++i){
                    if(i != focuesdIndex){
                        nextPlasmids.push(currentPlasmids[i]);
                        nextBoxes.push(new Box(0, 240, currentPlasmids[i].getLength()+32+32, 160));
                    }
                } 
                stepCount++;
                console.log("STEPCOUNT INCLIMENTED TO %d", stepCount);
                dialogueBoxMode = true;
                for(var i=0; i<candidatePlasmids.length; ++i){
                    var tmpPlasmid = candidatePlasmids[i];
                    var tmpWidth = tmpPlasmid.getLength();
                    candidateBoxes.push(new Box(0, 240, tmpWidth+32+32, 160));
                    console.log("Box with Width %d Pushed when init", tmpWidth+64+64);
                }
                setBoxesPositionX(candidateBoxes);
            }
        }
        
        if(goalPlasmids[0].bioBrickParts.toString() == currentPlasmids[0].bioBrickParts.toString()  && goalPlasmids[0].backBone == currentPlasmids[0].backBone){
            if(goalPlasmids[0].backBone == true){
                if(goalPlasmids[0].backBoneParts.toString() == currentPlasmids[0].backBoneParts.toString()){gameClearMode = true;}
            }else{
                gameClearMode = true;
            }
        }

    });
    
    
    
    function draw(){
        if(gameClearMode){
            context.save();
            context.fillStyle = "rgba(0, 0, 0, 0.1)";
            context.fillRect(0,0,canvasWidth,canvasHeight);
            context.font = "24px Futura";
            context.textAlign = "center";
            context.fillStyle = "rgb(255,255,255)";
            context.fillText("Congratulations!", 512, 310);
            context.fillText("You finished the game in " + stepCount + " steps!", 512, 340);
            context.restore();
        }else if(dialogueBoxMode){
            context.save();
            context.fillStyle = "rgba(0, 0, 0, 0.1)";
            context.fillRect(0,0,canvasWidth,canvasHeight);
            for(var i=0; i<candidateBoxes.length; ++i){
                var tmpPlasmid = candidatePlasmids[i]
                var tmpBox = candidateBoxes[i];
                tmpBox.render(context);
                tmpPlasmid.render(context, tmpBox);
            context.restore();
            }
        }else{
            context.clearRect(0,0, canvasWidth, canvasHeight);
            /*
            if(animationMode){
                context.translate(0, -20*animationCount);
                animationCount++;
                if(animationCount >= 12){
                    animationMode = false;
                    animationCount = 0;
                }
            }
            */
            for(var i=0; i<currentBoxes.length; ++i){
                var tmpPlasmid = currentPlasmids[i]
                var tmpBox = currentBoxes[i];
                tmpBox.render(context);
                tmpPlasmid.render(context, tmpBox);
            }
            //console.log("draw Previous Boxes");
            context.save();
            context.translate(0, -240);
            for(var i=0; i<previousBoxes.length; ++i){
                var tmpPlasmid = previousPlasmids[i]
                var tmpBox = previousBoxes[i];
                tmpBox.render(context);
                tmpPlasmid.render(context, tmpBox);
            }

            context.restore();
            context.save();
            context.translate(0, 240);
            for(var i=0; i<goalBoxes.length; ++i){
                var tmpPlasmid = goalPlasmids[i]
                var tmpBox = goalBoxes[i];
                tmpBox.render(context);
                tmpPlasmid.render(context, tmpBox);
            }

            context.restore();
            //draw EXSP indicator
            if(siteSelection.enable){
                siteSelection.render(context, focusedBox.x, focusedBox.width);    
            }
         
            //リセット表記
            context.save();
            context.font = "24px Futura";
            context.textAlign = "center";
            context.fillStyle = "rgb(0,0,0, 0.8)";
            context.fillText("RESET", 960, 620);
            context.restore();
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
    //箱の位置を全てx = 0に初期化
    for(var i=0; i<boxes.length; ++i){
        var tmpBox = boxes[i];
        tmpBox.x = 0;
    }
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
            context.fillStyle = "rgb(255, 255, 255)";
            context.shadowColor = "rgba(0, 0, 0, 0.4)"
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowBlur = 16;
        }else{
            context.fillStyle = "rgb(255, 255, 255)";
            context.shadowColor = "rgba(0, 0, 0, 0.4)"
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowBlur = 4;
            
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
    
    
    this.cut = function (siteSelection, candidatePlasmids){
        //convert Array to String for editability
        var tmpPlasmidString = new String("");
        for(var i=0; i<this.bioBrickParts.length; ++i){
            tmpPlasmidString += this.bioBrickParts[i];
        }
        
        console.log(tmpPlasmidString);
        if(siteSelection.e){
            tmpPlasmidString=tmpPlasmidString.replace("E", "EnE");
        }
        if(siteSelection.x){
            tmpPlasmidString=tmpPlasmidString.replace("X", "XnX");
        }
        if(siteSelection.s){
            tmpPlasmidString=tmpPlasmidString.replace("S", "SnS");
        }
        if(siteSelection.p){
            tmpPlasmidString=tmpPlasmidString.replace("P", "PnP");
        }
        console.log(tmpPlasmidString);
        while(tmpPlasmidString.match(/n[EXSP]n/) != null){
            tmpPlasmidString = tmpPlasmidString.replace(/n[EXSP]n/, "n");
        }
        console.log(tmpPlasmidString);
        newPlasmidStrings = tmpPlasmidString.split("n");
        console.log(newPlasmidStrings);
        //tweak Stirngs considering backBone
        if(this.backBone && newPlasmidStrings[0].indexOf("E")==0 &&
            newPlasmidStrings[newPlasmidStrings.length-1].indexOf("P") == (newPlasmidStrings[newPlasmidStrings.length-1].length) -1){
            console.log("need backBoneLiagtion");
            newPlasmidStrings[0] = newPlasmidStrings[0] + "n" +  newPlasmidStrings[newPlasmidStrings.length-1];
            newPlasmidStrings.splice(newPlasmidStrings.length-1, 1);
        }
        //delete inappropriate pieces(less than 3 length)
        for(var i = 0; i<newPlasmidStrings.length; ++i){
            if(newPlasmidStrings[i].length < 3){newPlasmidStrings.splice(i, 1);}
        }
        console.log(newPlasmidStrings);
        
        for(var i=0; i<newPlasmidStrings.length; ++i){
            var tmpBackBone = false;
            var tmpBackBoneParts;
            var tmpBioBrickParts = new Array();
            if(i==0 && this.backBone){
                tmpBackBoneParts = this.backBoneParts;
                tmpBackBone = true;
            }
            for(var j=0; j<newPlasmidStrings[i].length; ++j){
                tmpBioBrickParts.push(newPlasmidStrings[i].charAt(j));
            }
            candidatePlasmids.push(new Plasmid(tmpBioBrickParts, tmpBackBoneParts, tmpBackBone));
        }
        console.log("candidates number: %d", candidatePlasmids.length);
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
                    if(tmpString == "M") {context.fillStyle = "rgb(192,192,192)";}
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
                    switch(tmpString){
                        case "1":
                            context.fillStyle = "rgb(255, 128, 192)";
                            break;
                        case "2":
                            context.fillStyle = "rgb(63, 169, 245)";
                            break;
                        case "3":
                            context.fillStyle = "rgb(251, 176, 59)";
                            break;
                        default:
                            context.fillStyle = "rgb(128, 128, 128)";
                            break;
                    }
                    context.fillRect(tmpX+16, 16, parseInt(tmpString)*32, 32);
                    tmpX += 16+parseInt(tmpString)*32+16;
            }
        }
        
        context.restore();
    }

}


function ligateTwoParts(tmpPlasmid1, tmpPlasmid2, candidatePlasmids){
    console.log("try Ligation");
    //2つのパーツに両方バックボーンがあった場合はエラー
    if(tmpPlasmid1.backBone && tmpPlasmid2.backBone){
        console.log("ligation Error, Two BackBones");
        return false;
    }
    //2つのプラスミドを両方文字列に変換
    var tmpPlasmidString1 = new String("");
    for(var i=0; i<tmpPlasmid1.bioBrickParts.length; ++i){
        tmpPlasmidString1 += tmpPlasmid1.bioBrickParts[i];
    }
    var tmpPlasmidString2 = new String("");
    for(var i=0; i<tmpPlasmid2.bioBrickParts.length; ++i){
        tmpPlasmidString2 += tmpPlasmid2.bioBrickParts[i];
    }
    
    //戻り値のための変数
    var newPlasmidString;
    var tmpBioBrickParts = new Array();
    var tmpBackBoneParts;
    var tmpBackBone = false;
    
    //片方にバックボーンがある場合
    if(tmpPlasmid1.backBone){
        tmpBackBone = true;
        tmpBackBoneParts = tmpPlasmid1.backBoneParts;
        if(tmpPlasmidString1.match(/n/) == null){console.log("no room for ligation"); return false;}
        if(tmpPlasmidString1)
        tmpPlasmidString1 = tmpPlasmidString1.replace(/n/, tmpPlasmidString2);
        tmpPlasmidString1 = tmpPlasmidString1.replace(/EE/, "E");
        tmpPlasmidString1 = tmpPlasmidString1.replace(/XX/, "X");
        tmpPlasmidString1 = tmpPlasmidString1.replace(/SS/, "S");
        tmpPlasmidString1 = tmpPlasmidString1.replace(/PP/, "P");
        tmpPlasmidString1 = tmpPlasmidString1.replace(/SX/, "M");
        if(tmpPlasmidString1.match(/EX|ES|EP|XE|XS|XP|SE|SP|PE|PX|PS/) != null){console.log("imperfect matching"); return false;}
        console.log(tmpPlasmidString1);
        newPlasmidString = tmpPlasmidString1;
    }else if(tmpPlasmid2.backBone){
        console.log("this type");
        tmpBackBone = true;
        tmpBackBoneParts = tmpPlasmid2.backBoneParts;
        if(tmpPlasmidString2.match(/n/) == null){console.log("no room for ligation"); return false;}
        tmpPlasmidString2 = tmpPlasmidString2.replace(/n/, tmpPlasmidString1);
        console.log(tmpPlasmidString2);
        tmpPlasmidString2 = tmpPlasmidString2.replace(/EE/, "E");
        tmpPlasmidString2 = tmpPlasmidString2.replace(/XX/, "X");
        tmpPlasmidString2 = tmpPlasmidString2.replace(/SS/, "S");
        tmpPlasmidString2 = tmpPlasmidString2.replace(/PP/, "P");
        tmpPlasmidString2 = tmpPlasmidString2.replace(/SX/, "M");
        if(tmpPlasmidString2.match(/EX|ES|EP|XE|XS|XP|SE|SP|PE|PX|PS/) != null){console.log("imperfect matching"); return false;}
        console.log(tmpPlasmidString2);
        newPlasmidString = tmpPlasmidString2;
    }else{
        //両方共にバックボーンがない場合
        console.log("no backbones");
        console.log(tmpPlasmidString1 +" "+ tmpPlasmidString2);
        if(tmpPlasmidString1.charAt(tmpPlasmidString1.length -1) == "S" && tmpPlasmidString2.charAt(0) == "X"){
            tmpPlasmidString1 = tmpPlasmidString1 + tmpPlasmidString2;
            tmpPlasmidString1 = tmpPlasmidString1.replace(/SX/, "M");
        }else if(tmpPlasmidString2.charAt(tmpPlasmidString2.length -1) == "S" && tmpPlasmidString1.charAt(0) == "X"){
            tmpPlasmidString1 = tmpPlasmidString2 + tmpPlasmidString1;
            tmpPlasmidString1 = tmpPlasmidString1.replace(/SX/, "M");
        }
        console.log(tmpPlasmidString1);
        newPlasmidString = tmpPlasmidString1;
    }
    
    //元の形式に戻してリターン
    for(var j=0; j<newPlasmidString.length; ++j){
        tmpBioBrickParts.push(newPlasmidString.charAt(j));
    }
    candidatePlasmids.push(new Plasmid(tmpBioBrickParts, tmpBackBoneParts, tmpBackBone));
    console.log("ligation finished with success");
    console.log(candidatePlasmids);
    
}

