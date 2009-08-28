// Extension: SessionSaver
// CONNECTION STUFF //
var myid,myiv,myport;
function conn(){if(typeof(myid) == "undefined"){
myport = chrome.extension.connect();
myport.onMessage.addListener(gotMessage);}
else clearInterval(myiv);}
conn();
myiv=setInterval(conn,1000);
function pm(n){
	var msg = new Array(n,myid);
	for(var i=1;i<arguments.length;i++){
		msg[i+1] = arguments[i];
	}
	myport.postMessage(msg);
}

function gotMessage(msg){
	if(msg[0] == "youare")myid = msg[1];
	else if(msg[0] == "who")pm("I'm",location.href);
	else if(msg[0] == "open"){
		nleft  = msg[2]; ntop    = msg[3];
		nwidth = msg[4]; nheight = msg[5];
		addStickyNote(msg[1],msg[6],msg[7]);
	}
	else if(msg[0] == "close"){
		if(wholeElem != null){
		pm("save",noteElem.value);
		contentWindow.document.body.removeChild(wholeElem);
		clearInterval(intv);
		wholeElem = null;
	}}
}

// NOTE STUFF //
var movingWindow = false;
var resizingWindow = false;
var diff = new Array(0,0);
var nleft=0,ntop=0,nheight=440,nwidth=500,intv;
var wholeElem=null,noteElem,moveElem,horzElem,vertElem;
function saveText(){
	pm("save",noteElem.value);
}

function prepMove(e){
	if(!movingWindow){
	if(!e)var e = window.event;
	if(e.button == 0){
		movingWindow = true;
		//noteElem.value = "diff[0] = "+e.clientX+"-"+nleft+";\ndiff[1] = "+e.clientY+"-"+ntop+";";
		diff[0] = (e.clientX-window.pageXOffset)-nleft;
		diff[1] = (e.clientY-window.pageYOffset)-ntop;
	}}
}

function doMove(e){
	if(movingWindow){
	if(!e)var e = window.event;
	nleft = (e.clientX-window.pageXOffset)-diff[0];
	ntop = (e.clientY-window.pageYOffset)-diff[1];
	wholeElem.style.left = (nleft+window.pageXOffset)+"px";
	wholeElem.style.top = (ntop+window.pageYOffset)+"px";
	//noteElem.value = "Moving to: ("+diff[0]+","+diff[1]+") ?= ("+wholeElem.style.left+","+wholeElem.style.top+")";
	contentWindow.document.getSelection().removeAllRanges();
	}
}

function stopMove(e){
	if(movingWindow){
	if(!e)var e = window.event;
	doMove(e);
	movingWindow = false;
	saveNewSize();
	setTimeout(function(){contentWindow.document.getSelection().removeAllRanges()},100);
	}
}

function prepHorzRes(e){
	if(!resizingWindow){
	if(!e)var e = window.event;
	if(e.button == 0){
		//Save the diff as a percentage (clientX/width) and adjust by resizing that point to new mouse position
		resizingWindow = 1;
		diff[0] = (e.clientX-nleft)/(nwidth+6);
	}}
}

function doHorzRes(e){
	if(resizingWindow == 1){
	if(!e)var e = window.event;
	nwidth = Math.round((e.clientX-nleft)/diff[0]-6);
	//noteElem.value = "Resizing: "+nwidth+" based on "+Math.floor(diff[0]*100)+"%";
	wholeElem.style.width = (nwidth+16)+"px"; //Add vert scroll width
	moveElem.style.width = (nwidth+16)+"px";
	noteElem.style.width = nwidth+"px";
	horzElem.style.width = (nwidth+16)+"px";
	contentWindow.document.getSelection().removeAllRanges();
	}
}

function stopHorzRes(e){
	if(resizingWindow == 1){
	if(!e)var e = window.event;
	doHorzRes(e);
	resizingWindow = false;
	saveNewSize();
	setTimeout(function(){contentWindow.document.getSelection().removeAllRanges()},100);
	}
}

function prepVertRes(e){
	if(!resizingWindow){
	if(!e)var e = window.event;
	if(e.button == 0){
		//Save the diff as a percentage (clientX/width) and adjust by resizing that point to new mouse position
		resizingWindow = 2;
		diff[1] = (e.clientY-(ntop+16))/nheight;
		//noteElem.value = "Start resize with: ("+e.clientY+") "+Math.floor(diff[1]*100)+"%";
	}}
}

function doVertRes(e){
	if(resizingWindow == 2){
	if(!e)var e = window.event;
	nheight = Math.round((e.clientY-(ntop+16))/diff[1]);
	//noteElem.value = "Resizing: "+nheight+" based on "+Math.floor(diff[1]*100)+"%";
	wholeElem.style.height = (nheight+26)+"px"
	noteElem.style.height = nheight+"px";
	vertElem.style.height = nheight+"px";
	contentWindow.document.getSelection().removeAllRanges();
	}
}

function stopVertRes(e){
	if(resizingWindow == 2){
	if(!e)var e = window.event;
	doVertRes(e);
	resizingWindow = false;
	saveNewSize();
	setTimeout(function(){contentWindow.document.getSelection().removeAllRanges()},100);
	}
}

function trimCSSJunk(css){
	if(css.substr(-2) == "px")return css.substr(0,css.length-2)*1;
}

function saveNewSize(){
	nleft = trimCSSJunk(wholeElem.style.left)-window.pageXOffset;
	ntop = trimCSSJunk(wholeElem.style.top)-window.pageYOffset;
	nwidth = trimCSSJunk(noteElem.style.width);
	nheight = trimCSSJunk(noteElem.style.height);
	pm("re*",nleft,ntop,nwidth,nheight);
	//noteElem.style.height = (window.innerHeight-33)+"px";
	//noteElem.style.width = (window.innerWidth-6)+"px";
}

contentWindow.document.onscroll = function(){
	if(wholeElem != null && !movingWindow && !resizingWindow){
		wholeElem.style.left = (nleft+window.pageXOffset)+"px";
		wholeElem.style.top = (ntop+window.pageYOffset)+"px";
	}
}

function darken(col){
	var by = 20;
	if(col.substr(0,3) == "rgb"){
		col = col.match(/rgb *\( *([0-9]+) *, *([0-9]+) *, *([0-9]+) *\)/);
		col[0] = col[1]*1-by;
		col[1] = col[2]*1-by;
		col[2] = col[3]*1-by;
		//console.log("rgb("+col[0]+","+col[1]+","+col[2]+")");
		return "rgb("+col[0]+","+col[1]+","+col[2]+")";
	} else if(col.substr(0,1) == "#"){
		var r = parseInt(col.substr(1,2),16)-by;
		var g = parseInt(col.substr(3,2),16)-by;
		var b = parseInt(col.substr(5,2),16)-by;
		r = (r<16?"0":"")+r.toString(16);
		g = (g<16?"0":"")+g.toString(16);
		b = (b<16?"0":"")+b.toString(16);
		//console.log("#"+r+g+b);
		return "#"+r+g+b;
	}
}

function addStickyNote(text,bgcol,fgcol){
	wholeElem = document.createElement("div");
	wholeElem.innerHTML = "<div style='width:"+(nwidth+16)+"px;height:16px;background-color:"+fgcol+";color:"+bgcol+"' "+
		"onmousedown='STICKYNOTE_prepMove(event)' onmousemove='STICKYNOTE_doMove(event)' onmouseup='STICKYNOTE_stopMove(event)' "+
		"onmouseout='STICKYNOTE_stopMove(event)'"+
		">Sticky Note</div>"+
		"<div style='width:10px;height:"+nheight+"px;background-color:"+darken(fgcol)+";color:"+bgcol+";float:right'"+
		"onmousedown='STICKYNOTE_prepVertRes(event)' onmousemove='STICKYNOTE_doVertRes(event)' onmouseup='STICKYNOTE_stopVertRes(event)' "+
		"onmouseout='STICKYNOTE_stopVertRes(event)'>^<br/>|<br/>v</div>"+
		"<div><textarea style='width:"+nwidth+"px;height:"+nheight+"px;background-color:"+bgcol+";color:"+fgcol+"'>"+
		text+"</textarea></div>"+
		"<div style='text-align:center;width:"+(nwidth+16)+"px;height:10px;background-color:"+darken(fgcol)+";color:"+bgcol+"'"+
		"onmousedown='STICKYNOTE_prepHorzRes(event)' onmousemove='STICKYNOTE_doHorzRes(event)' onmouseup='STICKYNOTE_stopHorzRes(event)' "+
		"onmouseout='STICKYNOTE_stopHorzRes(event)'>&lt;--&gt;</div>";
	wholeElem.setAttribute("style","position:absolute;left:"+(nleft+window.pageXOffset)+"px;top:"+(ntop+window.pageYOffset)+"px;width:"+
		(nwidth+16)+"px;height:"+(nheight+33)+"px;background-color:"+fgcol+";z-index:100000;font-family:Verdana,sans-serif;"+
		"font-size:10px;font-style:normal;font-variant:normal;font-weight:normal;");
	contentWindow.document.body.appendChild(wholeElem);
	moveElem = wholeElem.children[0];
	vertElem = wholeElem.children[1];
	noteElem = wholeElem.children[2].children[0];
	horzElem = wholeElem.children[3];
	contentWindow.STICKYNOTE_prepMove = prepMove;
	contentWindow.STICKYNOTE_doMove = doMove;
	contentWindow.STICKYNOTE_stopMove = stopMove;
	contentWindow.STICKYNOTE_prepHorzRes = prepHorzRes;
	contentWindow.STICKYNOTE_doHorzRes = doHorzRes;
	contentWindow.STICKYNOTE_stopHorzRes = stopHorzRes;
	contentWindow.STICKYNOTE_prepVertRes = prepVertRes;
	contentWindow.STICKYNOTE_doVertRes = doVertRes;
	contentWindow.STICKYNOTE_stopVertRes = stopVertRes;
	intv = setInterval(function(){
		pm("backup",noteElem.value);
	},100);
}