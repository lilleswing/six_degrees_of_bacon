// var fs = require('fs');

//var actors = JSON.parse(fs.readFileSync('actors.json', 'utf8'));
//var movies = JSON.parse(fs.readFileSync('movies.json', 'utf8'));
//
var giphyKey = "Muo79oxFvs3iuv21WGDWaX041M161BAO";
var actors = {};
var movies = {};

var leftActor = "";
var rightActor = "Kevin Bacon";

$.ajax({
  url: "static/actors.json",
  method: "GET",
  success: function(x) {
    actors = x;
    setRandomFromImage();
  }
});

$.ajax({
  url: "static/movies.json",
  method: "GET",
  success: function(x) {
    movies = x;
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


function deepCopy(o) {
   return JSON.parse(JSON.stringify(o));
}

function appendQueue(q, n, a, used) {
  // q is the queu
  // n is the current node
  // a is the array to expand
  // used: object holding keys in the queue
  for (var i=0; i < a.length;  i++) {
    var elem = a[i];
    if (elem in used) {
      continue
    }
    var copy = deepCopy(n);
    copy['current'] = elem;
    copy['path'].push(elem);
    q.push(copy);
    used[elem] = true;
  }
}

function bfs_helper(q, dest) {
  /*
   * q is an array of \{"current": str, "path": array\}
   * dest: string of goal actor
   */
  var used = {}
  while (q.length > 0) {
    var node = q.shift();
    var current = node['current'];
    if (current === dest) {
      return node["path"];
    }
    if (node["path"].length > 8) {
      return "No Path To " + dest + "!"
    }
    // Expand through movies
    if (current in actors) {
      var new_movies = actors[current];
      appendQueue(q, node, new_movies, used);
    } else if (current in movies) {
      // Expand through actors
      var new_actors = movies[current];
      appendQueue(q, node, new_actors, used);
    } else {
      console.log(current + " not in actors or movies"); }
  }
}

async function bfs(from_actor, to_actor) {
  var node = {"current":from_actor, "path":[from_actor]};
  var q = [node];
  var path = bfs_helper(q, to_actor);
  path = prettyList(path);
  $("#myPath").html(path);
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
    console.log("Key Index:" + key_index);
    return keys[key_index]
};

function setRandomFromImage() {
  var myActor = randomProperty(actors);
  console.log(myActor);
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
    $("myPath").html("We don't know " + fromActor);
    return
  }
  if (!(toActor in actors)) {
    $("myPath").html("We don't know " + toActor);
    return;
  }
  var loadingHtml = "<img src='static/loading.gif' />"
  $("#myPath").html(loadingHtml);

  setTimeout(function() {
    console.log("timeout");
    bfs(fromActor, toActor);
  }, 1);
});

randomGif("Kevin Bacon", "toImage");

