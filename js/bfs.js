// var fs = require('fs');

//var actors = JSON.parse(fs.readFileSync('actors.json', 'utf8'));
//var movies = JSON.parse(fs.readFileSync('movies.json', 'utf8'));
//
var giphyKey = "Muo79oxFvs3iuv21WGDWaX041M161BAO";
var actors = {};
var movies = {};

var leftActor = "";
var rightActor = "Kevin Bacon";
var worker = new Worker('js/bfs_worker.js');

worker.addEventListener('message', function(e) {
  var path = e.data;
  $("#myPath").html(e.data);
}, false);

$.ajax({
  url: "static/actors.json",
  method: "GET",
  success: function(x) {
    actors = x;
    setRandomFromImage();
    worker.postMessage({
      "actors": actors
    });
  }
});

$.ajax({
  url: "static/movies.json",
  method: "GET",
  success: function(x) {
    movies = x;
    worker.postMessage({
      "movies": movies
    });
  }
});


function logIt(x) {
  console.log(x);
}

function randomGif(s, imgId) {
  s = s.replace(/ /g,"+");
  var myUrl = "https://api.giphy.com/v1/gifs/search?q=" + s + "&api_key="+ giphyKey + "&limit=1";
  $.ajax({
    url: myUrl,
    method: "GET",
    success: function(x) {
      var imgUrl = x['data'][0]['embed_url'];
      var idLookup = "#" + imgId;
      var myHtml = $('<iframe />').attr({
        'id': idLookup,
        "src": imgUrl,
        "class": "actor-img giphy-embed"
      });

      var containerLookup = "#" + imgId + "Container";
      $(containerLookup).empty();
      myHtml.appendTo(containerLookup);
    }
  });
}


function bfs_worker_call(from_actor, to_actor) {
  var message = {
    "from_actor": from_actor,
    "to_actor": to_actor
  };
  worker.postMessage(message);
}

function prettyList(a) {
  var s = "<ul>\n";
  for (var i=0; i < a.length; i++) {
    var row = "<li>"+a[i]+"</li>\n";
    s += row;
  }
  s += "</ul>";
  return s
}

function randomProperty(obj) {
    var keys = Object.keys(obj);
    var key_index = Math.floor(keys.length * Math.random());
    return keys[key_index]
};

function setRandomFromImage() {
  var myActor = randomProperty(actors);
  $("#fromActor").attr("value", myActor);
  randomGif(myActor, "fromImage");
  leftActor = myActor;
}

$("#searchButton").click(function() {
  var fromActor = $("#fromActor").val();
  if (fromActor != leftActor) {
    leftActor = fromActor;
    randomGif(fromActor, "fromImage");
  }
  var toActor = $("#toActor").val();
  if (rightActor != toActor) {
    rightActor = toActor;
    randomGif(toActor, "toImage");
  }
  if (!(fromActor in actors)) {
    $("#myPath").html("We don't know " + fromActor);
    return
  }
  if (!(toActor in actors)) {
    $("#myPath").html("We don't know " + toActor);
    return;
  }
  var loadingHtml = "<img src='static/loading.gif' />"
  $("#myPath").html(loadingHtml);
  bfs_worker_call(fromActor, toActor);
});

randomGif("Kevin Bacon", "toImage");

