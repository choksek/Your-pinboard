const board=document.getElementById("board");
const boardId=localStorage.getItem("currentBoard");

let cards=[];
let topZ=1;

/* ZOOM */

let zoomLevel=1;

/* HISTORY */

let historyStack=[];
let redoStack=[];

function saveState(){

const snapshot=JSON.stringify(cards);

if(historyStack.length>0){

if(historyStack[historyStack.length-1]===snapshot){
return;
}

}

historyStack.push(snapshot);

if(historyStack.length>50){
historyStack.shift();
}

redoStack=[];

}

/* ADD TEXT CARD */

function addTextCard(){

saveState();

const cardData={

id:Date.now(),
type:"text",

title:"Title",
body:"Write here...",

color:"#ffff88",

x:100,
y:100,

width:220,
height:150

};

cards.push(cardData);

saveCards();

createCardElement(cardData);

}

/* ADD TODO CARD */

function addTodoCard(){

saveState();

const cardData={

id:Date.now(),
type:"todo",

title:"Title",

items:["Task no"],

color:"#ffff88",

x:100,
y:100,

width:220,
height:180

};

cards.push(cardData);

saveCards();

createCardElement(cardData);

}

/* ADD TEXT CARD AT POSITION */

function addTextCardAt(x,y){

saveState();

const cardData={

id:Date.now(),
type:"text",

title:"Title",
body:"Write here...",

color:"#ffff88",

x:Math.max(10,x),
y:Math.max(10,y),

width:220,
height:150

};

cards.push(cardData);

saveCards();

const newCard=createCardElement(cardData);

setTimeout(function(){

const title=newCard.querySelector(".title");

if(title){

title.focus();
selectAllText(title);

}

},50);

}

/* CREATE CARD */

function createCardElement(cardData){

const card=document.createElement("div");

card.className="card";
card.dataset.id=cardData.id;

card.style.left=cardData.x+"px";
card.style.top=cardData.y+"px";

card.style.width=(cardData.width||220)+"px";
card.style.height=(cardData.height||150)+"px";

card.style.background=cardData.color||"#ffff88";

/* TEXT CARD */

if(cardData.type==="text"){

card.innerHTML=`

<div class="drag">☰</div>
<div class="delete">✖</div>
<div class="duplicate">⧉</div>

<div class="cardColor">
<input type="color" class="colorPicker">
</div>

<div class="resize"></div>

<div class="title" contenteditable="true">
${cardData.title}
</div>

<div class="body" contenteditable="true">
${cardData.body}
</div>

`;

}

/* TODO CARD */

if(cardData.type==="todo"){

card.innerHTML=`

<div class="drag">☰</div>
<div class="delete">✖</div>
<div class="duplicate">⧉</div>

<div class="cardColor">
<input type="color" class="colorPicker">
</div>

<div class="resize"></div>

<div class="title" contenteditable="true">
${cardData.title}
</div>

<ul class="todoList">

${cardData.items.map(i=>`<li contenteditable="true">${i}</li>`).join("")}

</ul>

<button class="addItem">+ Item</button>

`;

}

board.appendChild(card);

/* Z INDEX */

topZ++;
card.style.zIndex=topZ;

card.addEventListener("mousedown",function(){

topZ++;
card.style.zIndex=topZ;

});

/* DELETE */

card.querySelector(".delete").onclick=function(e){

e.stopPropagation();

saveState();

card.remove();

cards=cards.filter(
c=>c.id!==cardData.id
);

saveCards();

};

/* DUPLICATE */

card.querySelector(".duplicate").onclick=function(e){

e.stopPropagation();

saveState();

const copy=JSON.parse(
JSON.stringify(cardData)
);

copy.id=Date.now();

copy.x+=30;
copy.y+=30;

cards.push(copy);

saveCards();

createCardElement(copy);

};

/* COLOR */

const picker=card.querySelector(".colorPicker");

picker.value=cardData.color||"#ffff88";

picker.onclick=e=>e.stopPropagation();

picker.oninput=function(e){

e.stopPropagation();

saveState();

cardData.color=picker.value;

card.style.background=cardData.color;

saveCards();

};

/* TITLE AUTO SELECT */

const titleDiv=card.querySelector(".title");

if(titleDiv){

titleDiv.onclick=function(){

if(titleDiv.innerText==="Title"){
selectAllText(titleDiv);
}

};

titleDiv.onfocus=function(){

if(titleDiv.innerText==="Title"){
selectAllText(titleDiv);
}

};

}

/* BODY AUTO SELECT */

const bodyDiv=card.querySelector(".body");

if(bodyDiv){

bodyDiv.onclick=function(){

if(bodyDiv.innerText==="Write here..."){
selectAllText(bodyDiv);
}

};

bodyDiv.onfocus=function(){

if(bodyDiv.innerText==="Write here..."){
selectAllText(bodyDiv);
}

};

}

/* TODO */

if(cardData.type==="todo"){

const list=card.querySelector(".todoList");
const addBtn=card.querySelector(".addItem");

function setupTodoPlaceholder(li){

li.onclick=function(){

if(li.innerText==="Task no"){
selectAllText(li);
}

};

li.onfocus=function(){

if(li.innerText==="Task no"){
selectAllText(li);
}

};

}

list.querySelectorAll("li").forEach(setupTodoPlaceholder);

addBtn.onclick=function(e){

e.stopPropagation();

saveState();

const li=document.createElement("li");

li.contentEditable=true;

li.innerText="Task no";

setupTodoPlaceholder(li);

list.appendChild(li);

updateTodo(cardData,list);

};

list.oninput=function(){

saveState();

updateTodo(cardData,list);

};

}

/* DRAG */

makeDraggable(card,cardData);

/* RESIZE */

makeResizable(card,cardData);

return card;

}

/* DRAG */

function makeDraggable(card,cardData){

const drag=card.querySelector(".drag");

let dragging=false;

let offsetX=0;
let offsetY=0;

drag.onmousedown=function(e){

e.stopPropagation();

saveState();

dragging=true;

offsetX=e.clientX-card.offsetLeft;
offsetY=e.clientY-card.offsetTop;

};

document.addEventListener("mousemove",function(e){

if(!dragging)return;

card.style.left=(e.clientX-offsetX)+"px";
card.style.top=(e.clientY-offsetY)+"px";

cardData.x=card.offsetLeft;
cardData.y=card.offsetTop;

});

document.addEventListener("mouseup",function(){

if(dragging) saveCards();

dragging=false;

});

}

/* RESIZE */

function makeResizable(card,cardData){

const resize=card.querySelector(".resize");

let resizing=false;

let startX,startY,startW,startH;

resize.onmousedown=function(e){

e.stopPropagation();

saveState();

resizing=true;

startX=e.clientX;
startY=e.clientY;

startW=card.offsetWidth;
startH=card.offsetHeight;

};

document.addEventListener("mousemove",function(e){

if(!resizing)return;

const w=startW+(e.clientX-startX);
const h=startH+(e.clientY-startY);

card.style.width=w+"px";
card.style.height=h+"px";

cardData.width=w;
cardData.height=h;

});

document.addEventListener("mouseup",function(){

if(resizing) saveCards();

resizing=false;

});

}

/* SAVE */

function saveCards(){

localStorage.setItem(
"cards_"+boardId,
JSON.stringify(cards)
);

}

/* LOAD */

function loadCards(){

const saved=localStorage.getItem(
"cards_"+boardId
);

if(!saved)return;

cards=JSON.parse(saved);

cards.forEach(createCardElement);

}

/* TODO SAVE */

function updateTodo(cardData,list){

cardData.items=[];

list.querySelectorAll("li").forEach(li=>{
cardData.items.push(li.innerText);
});

saveCards();

}

/* BOARD SIZE */

function resizeBoard(){

const w=document.getElementById("boardWidth").value;
const h=document.getElementById("boardHeight").value;

board.style.width=w+"px";
board.style.height=h+"px";

localStorage.setItem(
"boardSize_"+boardId,
JSON.stringify({w,h})
);

}

/* ZOOM */

function zoomIn(){

zoomLevel+=0.1;

if(zoomLevel>3) zoomLevel=3;

board.style.transform="scale("+zoomLevel+")";
board.style.transformOrigin="top left";

}

function zoomOut(){

zoomLevel-=0.1;

if(zoomLevel<0.3) zoomLevel=0.3;

board.style.transform="scale("+zoomLevel+")";
board.style.transformOrigin="top left";

}

/* UNDO REDO */

document.addEventListener("keydown",function(e){

if(e.ctrlKey && e.key==="z"){

if(historyStack.length===0)return;

redoStack.push(JSON.stringify(cards));

cards=JSON.parse(historyStack.pop());

reloadBoard();

}

if(e.ctrlKey && e.key==="y"){

if(redoStack.length===0)return;

historyStack.push(JSON.stringify(cards));

cards=JSON.parse(redoStack.pop());

reloadBoard();

}

});

function reloadBoard(){

board.innerHTML="";

cards.forEach(createCardElement);

saveCards();

}

/* SELECT TEXT */

function selectAllText(element){

const range=document.createRange();
range.selectNodeContents(element);

const selection=window.getSelection();

selection.removeAllRanges();
selection.addRange(range);

}

/* DOUBLE CLICK ADD */

window.addEventListener("load",function(){

board.addEventListener("dblclick",function(e){

if(e.target.closest(".card")) return;

const rect=board.getBoundingClientRect();

const x=e.clientX-rect.left;
const y=e.clientY-rect.top;

addTextCardAt(x,y);

});

});

/* START */

loadCards();

/* LOAD SIZE */

const savedSize=localStorage.getItem(
"boardSize_"+boardId
);

if(savedSize){

const size=JSON.parse(savedSize);

board.style.width=size.w+"px";
board.style.height=size.h+"px";

document.getElementById("boardWidth").value=size.w;
document.getElementById("boardHeight").value=size.h;

}