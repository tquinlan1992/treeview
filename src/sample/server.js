const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));

app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/sample.html');
});

var port = process.env.ADMIN_PORTAL_PORT || 8000;
app.listen(port, function(){
  console.log('CORS-enabled web server listening on port '+ port);
});
