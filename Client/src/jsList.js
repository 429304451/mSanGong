
var jsListFramework = [
	"src/extend/Storage.js",
    "src/extend/CCNodeExtend.js",
];

var jsListGame = [
	"src/resource.js",
    "src/app.js"
];



if (typeof module != "undefined") {
    module.exports.jsListFramework = jsListFramework;
    module.exports.jsListGame = jsListGame;
}