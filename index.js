var sentiment = require('./afinn-111-words-only');
var twitter = require('twitter');
var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// set up express server

app.use('/', express.static(__dirname + '/public'));

// set up twitter connection
var twit = new twitter({
  consumer_key: process.env.twitter_key,
  consumer_secret: process.env.twitter_secret,
  access_token_key: process.env.token_key,
  access_token_secret: process.env.token_secret
});

var twitter_filters = {
  locations: '-124.7625,24.5210,-66.9326,49.3845,' + // continental US
             '-179.1506,51.2097,-129.9795,71.4410,' + // Alaska
             '-160.2471,18.9117,-154.8066,22.2356'   // Hawaii
};

twit.stream('filter', twitter_filters, function(stream){
  stream.on('data', function(data){
    if( data.text && data.coordinates && !data.retweeted ){
      // only interested in original tweets with geo data
      var relevant_data = {
        coordinates: data.coordinates,
        sentiment: sentiment.calculate(data.text)
      };
      io.emit('tweet', relevant_data);
    }
  });
});

var port = Number(process.env.PORT || 8000);

http.listen(port, function(){
  console.log('listening on '+port);
});
