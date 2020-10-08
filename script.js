var firebaseConfig = {
    apiKey: "AIzaSyCxs_wnFFO1qFvcJUFkK3VzHbZdlPKGP_o",
    authDomain: "arrowgame-f0b5f.firebaseapp.com",
    databaseURL: "https://arrowgame-f0b5f.firebaseio.com",
    projectId: "arrowgame-f0b5f",
    storageBucket: "arrowgame-f0b5f.appspot.com",
    messagingSenderId: "338708782169",
    appId: "1:338708782169:web:1bf0833518b82fba83a548"
};
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);

let myDatabase = firebase.database();
myDatabase.ref("arrows").once('value', ss=>{
	let numArrows = ss.val().length;
	let randArrow = Math.floor(numArrows*Math.random());
	myDatabase.ref("arrows").child(randArrow).once('value', ss2=>{
		alert(ss2.val());
	})
})

const timeLimit = 10;
var timeInterval = 1000;
var score = 0;
var gameState = "active";
var scoreInc = false;
var seconds = timeLimit;
let arrows = ["bluedownarrow", "blueleftarrow", "bluerightarrow", "blueuparrow",
"reddownarrow", "redleftarrow", "redrightarrow", "reduparrow"];
let currentImage = arrows[0];
var interval;

function updateGame(){
	document.getElementById("gameboard").innerHTML = "";
	setTimeout(createNewImage, 500);
	updateClock();
	document.addEventListener("keyup", event => {
		if(event.keyCode== 37 && scoreInc){
			//console.log("left");
			if(currentImage=="blueleftarrow" || currentImage == "redrightarrow"){
				score+=100;
				updateScore();
			}
			scoreInc = false; 
		}
		else if(event.which == 39 && scoreInc){
			//console.log("right");
			if(currentImage=="bluerightarrow" || currentImage == "redleftarrow"){
				score+=100;
				updateScore();
			}
			scoreInc = false;
		}
		else if(event.which == 38 && scoreInc){
			//console.log("up");
			if(currentImage=="blueuparrow" || currentImage == "reddownarrow"){
				score+=100;
				updateScore();
			}
			scoreInc = false;
		}
		else if(event.which == 40 && scoreInc){
			//console.log("down");
			if(currentImage=="bluedownarrow" || currentImage == "reduparrow"){
				score+=100;
				updateScore();
			}
			scoreInc = false;
		}
	});
	if(seconds == -2){
		endGame();
	}
}

function endGame(){
	clearInterval(interval);
	document.getElementById("game").classList.add("hidden");
	document.getElementById("end").classList.remove("hidden");
	document.getElementById("gameover").innerHTML = "Score: " + score;
}

function updateClock(){
	document.getElementById("clock").innerHTML = "Clock:";
	var clockDisplay = document.createElement("p");
	clockDisplay.innerText = seconds;
	seconds = seconds -1;
	var board = document.getElementById("clock");
	board.appendChild(clockDisplay);
}

function updateScore(){
	document.getElementById("scoreboard").innerHTML = "Score:";
	var scoreDisplay = document.createElement("p");
	scoreDisplay.innerText = score;
	var board = document.getElementById("scoreboard");
	board.appendChild(scoreDisplay);
}

function createNewImage(){
	var img = document.createElement("img");
	currentImage = arrows[Math.floor(Math.random()*8)];
	img.src = "/images/"+ currentImage + ".png";
	var src = document.getElementById("gameboard");
	src.appendChild(img);
	scoreInc = true;
}

document.getElementById("start").onclick = function() {
	timeInterval = 1000;
	seconds = timeLimit;
	scoreInc = false;
	score = 0;
	document.getElementById("startScreen").classList.add("hidden");
	document.getElementById("game").classList.remove("hidden");
	updateScore();
	interval = setInterval(updateGame,timeInterval);
}

document.getElementById("multiplayer").onclick = function() {
	document.getElementById("startScreen").classList.add("hidden");
	document.getElementById("multiplayerLobby").classList.remove("hidden");
}

document.getElementById("playagain").onclick = function() {
	seconds = 1;
	document.getElementById("end").classList.add("hidden");
	document.getElementById("startScreen").classList.remove("hidden");
}

document.getElementById("backtostart").onclick = function() {
	document.getElementById("startScreen").classList.remove("hidden");
	document.getElementById("multiplayerLobby").classList.add("hidden");
}


