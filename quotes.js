/* GLOBAL QUOTES */

let quotes=[

"Small steps every day.",
"Progress beats perfection.",
"Focus on what matters.",
"You can do this.",
"Start before you are ready.",
"You're a cutie:)",
"The only impossible journey is the one you never begin.",
"Do what you can, with what you have, where you are.",
"The best way to predict the future is to create it.",
"What you believe, remember, you can achieve.",
"Sometimes you gotta just chill. You gotta chill your thinking process.",
"Fear is a choice",
"You could rattle the stars"

];


/* LOAD */

const savedQuotes=localStorage.getItem("quotes");

if(savedQuotes){

quotes=JSON.parse(savedQuotes);

}


/* RANDOM ROTATION */

let lastQuote=-1;

function showQuote(){

if(quotes.length===0)return;

let index;

do{

index=Math.floor(
Math.random()*quotes.length
);

}while(index===lastQuote && quotes.length>1);

lastQuote=index;

document.getElementById("quoteText")
.innerText=quotes[index];

}


/* ROTATE */

setInterval(showQuote,120000);


/* INITIAL */

showQuote();


/* EDIT */

function editQuotes(){

const text=prompt(

"Enter quotes (one per line):",

quotes.join("\n")

);

if(!text)return;

quotes=text
.split("\n")
.map(q=>q.trim())
.filter(q=>q!="");

localStorage.setItem(
"quotes",
JSON.stringify(quotes)
);

showQuote();

}