
var actors = {};
var movies = {};

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

function prettyList(a) {
  var s = "<ul>\n";
  for (var i=0; i < a.length; i++) {
    var row = "<li>"+a[i]+"</li>\n";
    s += row;
  }
  s += "</ul>";
  return s
}

function bfs(from_actor, to_actor) {
  var node = {"current":from_actor, "path":[from_actor]};
  var q = [node];
  var path = bfs_helper(q, to_actor);
  path = prettyList(path);
  return path;
}

self.addEventListener('message', function(e) {
  if ("actors" in e.data) {
    self.actors = e.data.actors;
    return;
  }
  if ("movies" in e.data) {
    self.movies = e.data.movies;
    return;
  }
  var args = e.data;
  var from_actor = args['from_actor'];
  var to_actor = args['to_actor'];
  var retval = bfs(from_actor, to_actor);
  self.postMessage(retval);
}, false);


