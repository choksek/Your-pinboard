const boardsList = document.getElementById("boardsList");

let boards = [];

/* UNDO HISTORY */

let boardHistory = [];
let boardRedo = [];


/* LOAD BOARDS */

function loadBoards(){

const saved = localStorage.getItem("boards");

if(saved){
boards = JSON.parse(saved);
}

}


/* SAVE BOARDS */

function saveBoards(){

localStorage.setItem(
"boards",
JSON.stringify(boards)
);

}


/* SAVE STATE FOR UNDO */

function saveBoardState(){

const snapshot = JSON.stringify(boards);

if(boardHistory.length>0){

if(boardHistory[boardHistory.length-1]===snapshot){
return;
}

}

boardHistory.push(snapshot);

if(boardHistory.length>50){
boardHistory.shift();
}

boardRedo=[];

}



/* CREATE BOARD */

function addBoard(){

const input=document.getElementById("boardName");

const name=input.value.trim();

if(name===""){
alert("Enter a board name");
return;
}

saveBoardState();

const board={

id:Date.now(),
name:name,
color:"#ffffff"

};

boards.push(board);

saveBoards();

renderBoards();

input.value="";

}



/* RENDER BOARDS */

function renderBoards(){

boardsList.innerHTML="";

boards.forEach(board=>{

const row=document.createElement("div");

row.dataset.name=board.name.toLowerCase();


/* CLICK BOARD */

row.onclick=function(){

localStorage.setItem(
"currentBoard",
board.id
);

window.location.href="board.html";

};


row.style.margin="10px";
row.style.padding="10px";
row.style.border="1px solid black";
row.style.display="flex";
row.style.justifyContent="space-between";
row.style.alignItems="center";


/* Board color */

row.style.background=board.color || "#ffffff";


/* BOARD NAME */

const nameDiv=document.createElement("div");

nameDiv.innerText=board.name;


/* RIGHT SIDE */

const rightSide=document.createElement("div");

rightSide.style.display="flex";
rightSide.style.gap="10px";
rightSide.style.alignItems="center";


/* COLOR PICKER */

const colorPicker=document.createElement("input");

colorPicker.type="color";

colorPicker.value=board.color || "#ffffff";

colorPicker.onclick=function(e){
e.stopPropagation();
};

colorPicker.oninput=function(e){

e.stopPropagation();

saveBoardState();

board.color=colorPicker.value;

saveBoards();

renderBoards();

};



/* RENAME */

const renameBtn=document.createElement("span");

renameBtn.innerText="✎";

renameBtn.style.cursor="pointer";

renameBtn.onclick=function(e){

e.stopPropagation();

const newName=prompt(
"Rename board:",
board.name
);

if(!newName) return;

saveBoardState();

board.name=newName.trim();

saveBoards();

renderBoards();

};



/* DELETE */

const deleteBtn=document.createElement("span");

deleteBtn.innerText="✖";

deleteBtn.style.cursor="pointer";

deleteBtn.onclick=function(e){

e.stopPropagation();

if(!confirm("Delete this board?")) return;

saveBoardState();

boards=boards.filter(
b=>b.id!==board.id
);

saveBoards();

localStorage.removeItem(
"cards_"+board.id
);

renderBoards();

};


rightSide.appendChild(colorPicker);
rightSide.appendChild(renameBtn);
rightSide.appendChild(deleteBtn);


row.appendChild(nameDiv);
row.appendChild(rightSide);

boardsList.appendChild(row);

});

}



/* RESET */

function resetApp(){

localStorage.clear();

alert("App reset complete");

}



/* UNDO / REDO */

document.addEventListener("keydown",function(e){


/* UNDO */

if(e.ctrlKey && e.key==="z"){

if(boardHistory.length===0) return;

const state=boardHistory.pop();

if(!state) return;

boardRedo.push(JSON.stringify(boards));

boards=JSON.parse(state);

saveBoards();

renderBoards();

}



/* REDO */

if(e.ctrlKey && e.key==="y"){

if(boardRedo.length===0) return;

boardHistory.push(JSON.stringify(boards));

boards=JSON.parse(boardRedo.pop());

saveBoards();

renderBoards();

}


});



/* SEARCH BOARDS */

const boardSearch=document.getElementById("boardSearch");

if(boardSearch){

boardSearch.oninput=function(){

const term=boardSearch.value.toLowerCase();

document.querySelectorAll("#boardsList > div").forEach(board=>{

const name=board.dataset.name || "";

if(term!=="" && !name.includes(term)){

board.style.opacity="0.2";

}else{

board.style.opacity="1";

}

});

};

}



/* START */

loadBoards();

renderBoards();