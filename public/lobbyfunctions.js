const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

exports.lobbyStatus = functions.database.ref('/lobbies')