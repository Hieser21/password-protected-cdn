const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({dest: './files'})


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
    });


app.post('/api/fileanalyse', upload.array('file', 10), function (req, res) {    

    if (req.body.password === 'password') {
    const info = {
        name: req.file.filename,
        size: req.file.size,
        type: req.file.type,
        location: req.file.path
    }


            res.json(info)
} else {
    res.status(404).send('error pass not matched')
}
})
const port = 3000
app.listen(port, function () {
    console.log('Listening on port ' + port);
    })