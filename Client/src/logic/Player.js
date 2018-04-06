/**
 * Created by orange on 2016/8/17.
 */
function Player(chairID) {
    this.chairID = chairID;
    this.isPlaying = false;
    this.cardData = null;
}

var p = Player.prototype;

p.reset = function () {
    this.isPlaying = false;
    this.cardData = null;
};