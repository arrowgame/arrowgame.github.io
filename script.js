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

let fakeuserid = "nchintala";
let fakeuserobj = {"username": "NishChin", "ready":false};

/*let gameDemo = {
	"gameid":"randomgameidhere",
  	"created":"2020-10-02T12:49:00.000Z",
	"maxplayers":2,  
	"status":"Waiting 1/2",
	"players": {
		"player1idhere": {
			"username": "ProfNinja",
			"ready": false
		}
	}
}*/

class LobbyGame {
	constructor(gameJSON, ref){
		this.database = ref;
		this.$html = $(`<div></div>`);
		this.database.on("value", ss=>{
			this.updateFromJSON(ss.val());
		});
  }
  
  updateFromJSON(gameJSON){
    this.created = gameJSON.created || new Date().toLocaleString();
    this.title = gameJSON.title || `New Game ${this.created}`;
    this.gameid = gameJSON.gameid || `Game-${Math.floor(Math.random()*1000000000)}`;
    this.maxplayers = gameJSON.maxplayers || 2;
    this.players = gameJSON.players || {};
    this.status = gameJSON.status || `Waiting ${Object.keys(this.players).length}/${this.maxplayers}`;
    this.render();
  }
  
  toJSON(){
    let gameObj = {};
    gameObj.created = this.created;
    gameObj.gameid = this.gameid;
    gameObj.title = this.title;
    gameObj.maxplayers = this.maxplayers;
    gameObj.players = this.players;
    gameObj.status = this.status;
    return gameObj;
  }
  
  render(){
		this.$html.html(`
<div class="lobbygame">
<h3 class="title">${this.title}</h3>
<h4 class="status">${this.status}</h4>
<button class="join">Join</button>
<button class="edit">Edit</button>
</div>
      `);
//    this.$html.find(".join").off("click");//TODO: zombie check
    this.$html.find(".join").on("click", ()=>{
			this.database.child("players").child(fakeuserid).set(fakeuserobj);
			//TODO: make sure a max of 4 players can join the game
    });
    this.$html.find(".edit").on("click", ()=>{
			let newTitle = prompt("Enter the new title for the lobby:");
			this.database.child("title").set(newTitle || this.title);
    });
  }
}


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
	myDatabase.ref("arrows").once('value', ss=>{
		let numArrows = ss.val().length;
		let randArrow = Math.floor(numArrows*Math.random());
		myDatabase.ref("arrows").child(randArrow).once('value', ss2=>{
			currentImage = ss2.val();
		})
	})
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
	//let aGame = new LobbyGame({});
	let mylobbiesDB = myDatabase.ref("lobbies");

	mylobbiesDB.on("child_added", (aGameSnap)=>{
		let gameJSON = aGameSnap.val();
		let newGameInstance = new LobbyGame(gameJSON, mylobbiesDB.child(aGameSnap.key));
		$("#multiplayerLobby").append(newGameInstance.$html);
	});
	//TODO need a child_removed to get rid of deleted games
	//console.log(JSON.stringify(aGame.toJSON()));
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


