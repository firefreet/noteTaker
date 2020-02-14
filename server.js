const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

var db = [];

// adds an id key to an object based on its place in an array
// since the front end code does a semi-truthy check against
// the id value existing (which fails on id = 0), need to move it to
// a 1 base instead of 0
function giveID(db) {
    db = db.map((v,i) => {
        v.id = i + 1
        return v
    });
    return db;
};

// setting up the express server
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"))

// serve the html that actually takes input and displays the current list of notes
app.get("/notes",function(req, res) {
    res.sendFile(path.join(__dirname, "public","notes.html"));
});

// serve the landing page html
app.get("/",function(req,res) {
    res.sendFile(path.join(__dirname, "public","index.html"));
});

// get the current array of notes objects, give them IDs, and return to page for display
app.get("/api/notes",function(req,res){
    db = JSON.parse(fs.readFileSync("./db/db.json"));
    db = giveID(db)
    return res.json(db);
});

// take an object from the front end
app.post("/api/notes",function(req,res){
    var newNote = req.body;
    // give it an id
    newNote.id = db.length + 1;
    // add it to the end of the array
    db.push(newNote);
    // write it back to the file
    fs.writeFileSync("./db/db.json",JSON.stringify(db))
    res.end();
});

// take an id from the front end
app.delete("/api/notes/:id", function(req,res){
    // remove that item from the array, have to switch back to 0 base reference
    db.splice(req.params.id -1,1)
    // re-id the array
    db = giveID(db)
    // write the array back to the file
    fs.writeFileSync("./db/db.json",JSON.stringify(db));
    res.end();
})

// start up the server
app.listen(PORT, function() {
    console.log("App listenting on PORT " + PORT);
});


