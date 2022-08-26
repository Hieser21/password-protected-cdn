
//Add dependencies
const express = require("express");
const app = express();
const multer = require("multer");
//Set destination
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "tmp/cdn");
  },
  //Name for the file in the folder
  filename: function (req, files, cb) {
    // let counter = 1;
    // const uniqueSuffix = ""
    // function filess() {
    //   if (files.mimetype === "image/jpeg") {
    //     return uniqueSuffix + ".jpg";
    //   } else if (files.mimetype === "image/png") {
    //     return uniqueSuffix + ".png";
    //   } else if (files.mimetype === "image/gif") {
    //     return uniqueSuffix + ".gif";
    //   } else if (files.mimetype === "image/svg") {
    //     return uniqueSuffix + ".svg";
    //   } else if (files.mimetype === "text/css") {
    //     return uniqueSuffix + ".css";
    //   } else if (files.mimetype === "text/html") {
    //     return uniqueSuffix + ".html";
    //   } else if (files.mimetype === "text/json") {
    //     return uniqueSuffix + ".json";
    //   } else if (files.mimetype === "text/javascript") {
    //     return uniqueSuffix + ".js";
    //   } else if (files.mimetype === "text/xml") {
    //     return uniqueSuffix + ".xml";
    //   } else if (files.mimetype === "text/yaml") {
    //     return uniqueSuffix + ".yaml";
    //   } else if (files.mimetype === "audio/mpeg") {
    //     return uniqueSuffix + ".mp3";
    //   } else if (files.mimetype === "audio/ogg") {
    //     return uniqueSuffix + ".ogg";
    //   } else if (files.mimetype === "audio/mp4") {
    //     return uniqueSuffix + ".mp4";
    //   } else if (files.mimetype === "audio/wav") {
    //     return uniqueSuffix + ".wav";
    //   } else if (files.mimetype === "video/wav") {
    //     return uniqueSuffix + ".mp4";
    //   } else if (files.mimetype === "video/mp4") {
    //     return uniqueSuffix + ".mp4";
    //   } else if (files.mimetype === "video/ogg") {
    //     return uniqueSuffix + ".ogg";
    //   } else {
    //     console.log("Unsupported file type");
    //   }
    // }
    cb(null, files.originalname);
  },
});

const upload = multer({ storage: storage });
const fs = require("fs");

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/fileanalyse", upload.array("file", 10), function (req, res) {
  if (req.body.password === "password") {
    res.json({
      location: "/tmp/cdn",
      res: "all files uploaded successfully",
    });
  } else {
    res.status(404).send("error pass not matched");
  }
});


const port = 3000;
app.listen(port, function () {
  console.log("Listening on port " + port);
});
