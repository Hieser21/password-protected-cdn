require('dotenv').config()
const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const bodyParser = require("body-parser");
const port = 3000;
const helmet = require("helmet");
const responsedelay = 50; // miliseconds
// static folders

var options = {
  setHeaders: function (res, path, stat) {
    res.set({
      "cache-control": "public, max-age=86400",
      vary: "accept-encoding",
    });
  },
};
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet.hidePoweredBy());
app.use(express.static("userfiles"));
app.use(express.static("view", options));

// home page
app.get("/", function (req, res) {
  express.response.setHeader("cache-control", "public, max-age=86400");
  res.sendFile("index.html");
});

// upload handler
var uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./userfiles/${req.query.type}`); ///${req.folder}`);
  },
  filename: function (req, file, cb) {
    //let fileName = checkFileExistense(req.query.folder ,file.originalname);
    cb(null, file.originalname);
  },
});

var upload = multer({
  storage: uploadStorage,
  fileFilter: function (req, file, cb) {
    if (req.body.password == process.env.PASSWORD) {
      cb(null, true);
    } else {
      return cb(new Error("Invalid password"));
    }
  },
});

app.post("/", upload.array("file"), function (req, res, err) {
  if (req.body.password === process.env.PASSWORD) {
    res.status(200);
  } else {
    console.log(req.body.password + "\n" + "Did not match");
    res.status(500).json({ Message: "Password incorrect" });
  }
  if (err) {
    console.log(err);
  }
  console.log(req.files);
  console.log("file upload...");
});

app.post("/file/delete", function (req, res) 
{ if (req.body.password == process.env.PASSWORD) {
  const filenames = req.body.delete.split(", ");
  filenames.forEach(function (filename) {
    fs.unlink('userfiles' + filename, function (err) {
        if (err) { throw err;
    }})
    console.log(filename + "\n Deleted");
 }) } else {
  console.log(req.body.password + "\n" + "Did not match");
 }})

app.post('/lock', function (req, res) {
  console.log(req.body)
    if (req.body.password == process.env.PASSWORD) {
         res.status(200).send('OK')  
    } else {
        res.status(403).send("NO")
    }
});

// all type of files except images will explored here
app.post("/files-list", function (req, res) {
  let folder = req.query.folder;
  let contents = "";

  let readingdirectory = `./userfiles/${folder}`;

  fs.readdir(readingdirectory, function (err, files) {
    if (err) {
      console.log(err);
    } else if (files.length > 0) {
      files.forEach(function (value, index, array) {
        fs.stat(`${readingdirectory}/${value}`, function (err, stats) {
          let filesize = ConvertSize(stats.size);
          contents +=
            '<tr><td><a href="/' +
            folder +
            "/" +
            encodeURI(value) +
            '">' +
            value +
            "</a></td><td>" +
            filesize +
            "</td><td>/" +
            folder +
            "/" +
            value +
            "</td></tr>" +
            "\n";

          if (index == array.length - 1) {
            setTimeout(function () {
              res.send(contents);
            }, responsedelay);
          }
        });
      });
    } else {
      setTimeout(function () {
        res.send(contents);
      }, responsedelay);
    }
  });
});

/*
this part is written because i wanted to show you how you can explore in differnt directories
for search a specific type of files (in this case images)
*/
app.post("/image-list", function (req, res) {
  // this part is a little different because i wanted to find all images without looking at file extentions
  // and instead i will looking for image files due to the binary information of files and check several first bytes
  // those bytes are unique for each file type (or mime type)

  var contents = "";

  var directories = ["/font", "/html", "/image", "/pdf", "/video"];
  var dirindex = 0;

  /**
   * this is an inline function for iterating the directories array instead of loops. it cause avoiding conflitcness of loops and async jobs.
   * @param dindex index of directories
   */
  var readNextDirectory = function (dindex) {
    let directory = directories[dindex];

    fs.readdir(`./userfiles${directory}`, function (err, files) {
      if (err) {
        console.log(`Error: ${err}`);
      } else if (files.length > 0) {
        files.forEach(function (value, index, array) {
          fs.readFile(`./userfiles${directory}/${value}`, function (err, data) {
            if (err) {
              console.log(err);
            }
            // ffd8 and 89504e47 are magic number of image files (jpeg and png)
            // this condition searches for "jpeg" and "png" images (you must add other magic numbers yourself)
            else if (
              data.toString("hex").search("ffd8") == 0 ||
              data.toString("hex").search("89504e47") == 0 ||
              data.toString("hex").search("47494638") == 0
            ) {
              // findig jpeg and png images by watching files as binary data and checking the 2 or 4 magic bytes/numbers.
              fs.stat(
                `./userfiles${directory}/${value}`,
                function (err, stats) {
                  let filesize = ConvertSize(stats.size);
                  contents +=
                    '<div class="details"><div class="image"><img src="' +
                    directory +
                    "/" +
                    encodeURI(value) +
                    '" alt="' +
                    value +
                    '"></div><p><a href="' +
                    directory +
                    "/" +
                    encodeURI(value) +
                    '">' +
                    value +
                    "</a></p><p>" +
                    filesize +
                    "</p><p>" +
                    directory +
                    "/" +
                    value +
                    "</p></div>" +
                    "\n";
                }
              );
            }

            if (
              index == array.length - 1 &&
              dirindex == directories.length - 1
            ) {
              setTimeout(function () {
                res.send(contents);
              }, responsedelay);
              return;
            } else if (
              index == array.length - 1 &&
              dirindex < directories.length
            ) {
              readNextDirectory(++dirindex);
            }
          });
        });
      } else if (dirindex == directories.length - 1) {
        setTimeout(function () {
          res.send(contents);
        }, responsedelay);
      } else if (files.length == 0) {
        readNextDirectory(++dirindex);
      }
    });
  };

  readNextDirectory(dirindex);
});

/**
 * it gives a number as byte and convert it to KB, MB and GB (depends on file size) and return the result as string.
 * @param number file size in Byte
 */
function ConvertSize(number) {
  if (number <= 1024) {
    return `${number} Byte`;
  } else if (number > 1024 && number <= 1048576) {
    return (number / 1024).toPrecision(3) + " KB";
  } else if (number > 1048576 && number <= 1073741824) {
    return (number / 1048576).toPrecision(3) + " MB";
  } else if (number > 1073741824 && number <= 1099511627776) {
    return (number / 1073741824).toPrecision(3) + " GB";
  }
}

// start server
app.listen(port, function () {
  console.log(`Server is started on port: ${port}`);
});
