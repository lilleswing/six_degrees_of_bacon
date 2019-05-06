// var fs = require('fs');

//var actors = JSON.parse(fs.readFileSync('actors.json', 'utf8'));
//var movies = JSON.parse(fs.readFileSync('movies.json', 'utf8'));
//
var actors = {}
var movies = {}
$.ajax({
  url: "static/actors.json",
  method: "GET",
  success: function(x) {
    actors = x;
  }
});

$.ajax({
  url: "static/movies.json",
  method: "GET",
  success: function(x) {
    movies = x;
  }
});

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
    if (node["path"].length > 20) {
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
      console.log(current + " not in actors or movies");
    }
  }
}

function bfs(from_actor, to_actor) {
  var node = {"current":from_actor, "path":[from_actor]};
  var q = [node];
  var path = bfs_helper(q, to_actor);
  return path;
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


$("#searchButton").click(function() {
  var fromActor = $("#fromActor").val();
  var toActor = $("#toActor").val();
  var path = bfs(fromActor, toActor);
  path = prettyList(path);
  $("#myPath").html(path);
});

