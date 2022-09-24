
//Add dependencies
const express = require("express");
const app = express();
const multer = require("multer");
const ServeMe = require("serve-me");
const filemanagerMiddleware = require('@opuscapita/filemanager-server').middleware;
const serveMe = ServeMe({
  directory: './tmp/cdn'
});

let config = {
  fsRoot: './tmp/cdn',
  rootName: './tmp/cdn',
};

//Set destination
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "tmp/cdn");
  },
  //Name for the file in the folder
  filename: function (req, files, cb) {

    cb(null, files.originalname);
  },
});

const upload = multer({ storage: storage });
const fs = require("fs");

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/api/fileanalyse", upload.array("file", 10), function (request, response) {
  if (request.body.password === "password") {
    response.json({
      location: "/tmp/cdn",
      res: "all files uploaded successfully",
    });
  } else {
    response.status(404).send("error pass not matched");
  }
});


app.listen(3000);

