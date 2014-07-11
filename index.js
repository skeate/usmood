var twitter = require('twitter');
var sentiments = require('./afinn-111-words-only');
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

function toLower(word){ return word.toLowerCase(); }

/**
 * @param {string} tweet
 */
function calculate_sentiment(tweet){
  var words, tweet_sentiment, matched_words;
  try{
    words = tweet.match(/[\w-']+/g).map(toLower);
    tweet_sentiment = 0;
    matched_words = 0;
    words.forEach(function(word){
      if( sentiments.hasOwnProperty(word) ){
        tweet_sentiment += sentiments[word];
        matched_words++;
      }
    });
    return tweet_sentiment / matched_words;
  } catch (ex){
    return 0;
  }
}

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
        sentiment: calculate_sentiment(data.text)
      };
      io.emit('tweet', relevant_data);
    }
  });
});

http.listen(80, function(){
  console.log('listening on 80');
});
