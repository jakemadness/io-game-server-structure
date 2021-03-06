/*
********************************************************
*                     GAME MECHANICS
********************************************************
*/
module.exports = function(config, data, utilities, sockets) {
   var self  = this;
   self.loop = function() {
      self.updateDelta();
      self.updateGameTime();
      self.updateLeaderboard();
      for ( var i = 0; i < data.players.length; i++ ) {
         data.players[i].update();
      }
   };
   self.updateDelta = function() {
      data.loopNow   = Date.now();
      data.loopDelta = (data.loopNow - data.loopLast) / config.updateRate;
      data.loopLast  = data.loopNow;
   };
   self.updateGameTime = function() {
      var difference = (data.loopNow - data.serverStart);
      data.gameTime  = [
         Math.floor(difference / (config.dayDifference / 24) % 24),
         Math.floor(difference / (config.dayDifference / 24 / 60) % 60),
         Math.floor(difference / (config.dayDifference / 24 / 60 / 60) % 60)
      ];
   };
   self.updateLeaderboard = function() {
      var leaderboard = [];
      var players     = utilities.sortBy(data.players, 'score', true);
      for ( var i = 0; i < players.length && i < config.leaderboardSize; i++ ) {
         leaderboard.push([
            players[i].id,
            players[i].name,
            players[i].day,
            players[i].score
         ]);
      }
      data.leaderboard = leaderboard;
   };
   self.player = function(socketId) {
      var player           = this;
      player.spawned       = data.loopNow;
      player.socketId      = socketId;
      player.id            = utilities.nextId(data.players);
      player.viewDirection = utilities.randomRadiansAngle(0, 360);
      player.moveDirection = null;
      player.speed         = 1;
      player.x             = 0;
      player.y             = 0;
      player.score         = 0;
      player.send          = function(name, value) {
         sockets.to(player.socketId).emit(name, value);
      };
      player.updateCoordinates = function() {
         if ( player.moveDirection !== null ) {
            player.x += (Math.cos(player.moveDirection) * player.speed) * data.loopDelta;
            player.y += (Math.sin(player.moveDirection) * player.speed) * data.loopDelta;
         }
      };
      player.update = function() {
         player.updateCoordinates();
      };
      return player;
   };
};
