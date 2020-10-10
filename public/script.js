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
let mylobbiesDB = myDatabase.ref("lobbies");
let userid = localStorage.getItem("userid");
if (!userid){
  uuid = `userid-${Math.floor(1000000000*Math.random())}`;
  localStorage.setItem("userid", uuid);
}
let userobj = {"username":"Anonymous","ready":false};
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
var lobbies = [];
var visibleLobbies = [];

class LobbyGame {
	constructor(gameJSON, ref){
		this.database = ref;
		this.$html = $(`<div></div>`);
		this.database.on("value", ss=>{
			if(!ss.val()){
				this.$html.html('');
				this.database.off("value");
			}
			this.updateFromJSON(ss.val());
		});
  }
  
  updateFromJSON(gameJSON){
    this.created = gameJSON.created || new Date().toLocaleString();
    this.title = gameJSON.title || `New Game ${this.created}`;
    this.gameid = gameJSON.gameid || `Game-${Math.floor(Math.random()*1000000000)}`;
    this.maxplayers = gameJSON.maxplayers || 4;
		this.players = gameJSON.players || {};
		this.creator = gameJSON.creator || "anon";
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
		<div class = "lobbygame ${this.creator == userid ? "yours" : ""}">
			<h3 class = "title">${this.title}</h3>
			<h4 class = "status">${this.status}</h4>
			<div class = "buttons"></div>
		</div>
		`);
		if (Object.keys(this.players).indexOf(userid) > -1){
			if (userid == this.creator){
				this.$html.find(".buttons").html(`
					<button class = "edit">Edit</button>
					<button class = "delete">Delete</button>
					<button class = "goto">Go to Game</button>
				`);
				this.$html.find(".delete").on("click", ()=>{
					this.database.remove();
				});
				this.$html.find(".edit").on("click", ()=>{
					let newtitle = prompt("Edit Lobby Title:");
					this.database.child("title").set(newtitle || this.title);
				});
			} else {
				this.$html.find(".buttons").html(`
				<button class="leave">Leave</button>
				<button class="goto">Go to Game</button>
				`);
				this.$html.find(".leave").on("click",()=>{
					this.database.child("players").child(userid).remove();
				});
			}
			this.$html.find(".goto").on("click", ()=>{
				let gameParams = {
					lobbyDB: this.database,
					gameid: this.gameid
				}
				this.database.child("players").child(userid).child("ready").set(true);
				gotoScreen(gameParams);
			});
		} else {
			this.$html.find(".buttons").html(`
			<button class="join">Join</button>
			`);
			this.$html.find(".join").on("click", ()=>{
				let username = prompt("Enter a username:")||Math.floor(Math.random()*100000);
				userobj = {"username":username,"ready":false};
				this.database.child("players").child(userid).set(userobj);
			});
		}
	}
}
let renderLobbyStartScreen = function(lobbyDB, gameDB, param){
	//renderTeamChooser
}
let renderActiveGame = function(gameDB, $body){
	$body.html(`
	<button id = "startTheGame">Start Game</button>
	`)
	$("#startTheGame").on("click", ()=>{
		seconds = timeLimit;
		scoreInc = false;
		score = 0;
		$body.classList.add("hidden");
		//document.getElementById("startScreen").classList.add("hidden");
		document.getElementById("game").classList.remove("hidden");
		updateScore();
		interval = setInterval(updateGame,1000);
	});
}
let renderWaitingScreen = function(gameDB, $body, status, lobbyDB){
	$body.html(`<h1>Game Status: ${status}</h1>`);
	lobbyDB.child("status").on("value", ss=>{
		$body.find("h1").html(`Game Status: ${ss.val()}`);
	});
	
};

let gotoScreen = function(params){
	mylobbiesDB.off();
	let lobbyDB = params.lobbyDB;
	let gameid = params.gameid;
	$("body").html(`
	<button id = "backtolobby">Back to Lobby</button>
	<div id = "gamescreen">
	</div>
	`);
	$("#backtolobby").click(renderLobby);
	let gameDB = firebase.database().ref("lobbies").child(gameid);
	lobbyDB.child('players').child(userid).child('ready').on('value', (ss)=>{
		let readyState = ss.val();
		//console.log(readyState);
		if(!readyState){
			lobbyDB.child('status').off();
			renderWaitingScreen(gameDB, $("#gamescreen"), status, lobbyDB);
		} else {
			lobbyDB.child('status').on('value', ss=>{
				let status = ss.val();
				if(status.substring(0,5) == "Ready"){
					renderActiveGame(gameDB, $("#gamescreen"));
				} else {
					renderWaitingScreen(gameDB, $("#gamescreen"), status, lobbyDB);
				}
			});
		}
	});
};
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
	seconds = timeLimit;
	scoreInc = false;
	score = 0;
	document.getElementById("startScreen").classList.add("hidden");
	document.getElementById("game").classList.remove("hidden");
	updateScore();
	interval = setInterval(updateGame,1000);
}

let renderLobby = function(){
	$("#multiplayerLobby").html(`<button id = "newgame">Click to make lobby</button>`);
	mylobbiesDB.on("child_added", (aGameSnap)=>{
		let gameJSON = aGameSnap.val();
		let newGameInstance = new LobbyGame(gameJSON, mylobbiesDB.child(aGameSnap.key));
		$("#multiplayerLobby").append(newGameInstance.$html);
	});

	let makeGame = function(gameJSON){
		let res = {};
		res.created = gameJSON.created || new Date().toLocaleString();
		res.title = gameJSON.title || `New Game ${res.created}`;
		res.gameid = gameJSON.gameid || `Game-${Math.floor(Math.random()*1000000000)}`;
		res.maxplayers = gameJSON.maxplayers || 4;
		res.players = gameJSON.players || false;
		res.status = gameJSON.status || `Starting Up`;
		return res;
	}

	$("#newgame").click(()=>{
		let username = prompt("Enter a username:") || Math.floor(Math.random()*100000);
		let newGameRef = mylobbiesDB.push();
		let gameObj = makeGame({});
		gameObj.creator = userid;
		gameObj.gameid = newGameRef.key;
		gameObj.players = {};
		userobj = {"username":username,"ready":false};
		gameObj.players[userid] = userobj;
		newGameRef.set(gameObj);
	});
};

/*document.getElementById("addLobby").onclick = function() {
	let newGameRef = mylobbiesDB.push();
	let gameObj = makeGame({});
	gameObj.creator = userid;
	gameObj.gameid = newGameRef.key;
	gameObj.players = {};
	gameObj.players[userid] = userobj;
	newGameRef.set(gameObj);
	mylobbiesDB.once("child_added", (aGameSnap)=>{
		//console.log(mylobbiesDB.child(aGameSnap.key));
		newGameRef = new LobbyGame(gameObj, mylobbiesDB.child(aGameSnap.key));
		lobbies.push(newGameRef);
	})*/
	/*mylobbiesDB.once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			$("#multiplayerLobby").append(childSnapshot.$html);
		})
	})*/
	/*mylobbiesDB.once("child_added", (aGameSnap)=>{
		//console.log(mylobbiesDB.child(aGameSnap.key));
		newGameRef = new LobbyGame(gameObj, mylobbiesDB.child(aGameSnap.key));
		console.log(newGameRef);
		$("#multiplayerLobby").append(newGameRef.$html);
	});
	displayLobbies();*/
	//TODO need a child_removed to get rid of deleted games
//}

document.getElementById("multiplayer").onclick = function() {
	document.getElementById("startScreen").classList.add("hidden");
	document.getElementById("multiplayerLobby").classList.remove("hidden");
	renderLobby();
	//displayLobbies();
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


