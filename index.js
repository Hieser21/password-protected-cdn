const express = require('express');
const app = express();
const multer = require('multer');
  const upload = multer({ dest: 'tmp/cdn'})


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});


app.post('/api/fileanalyse', upload.any('file', 10), function (req, res) {

    if (req.body.password === 'password') {
      
        res.json({
            'location': '/tmp/cdn',
            "res": 'all files uploaded successfully'

        })
    } else {
        res.status(404).send('error pass not matched')
    }
})



const port = 3000
app.listen(port, function () {
    console.log('Listening on port ' + port);
})