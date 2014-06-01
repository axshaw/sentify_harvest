var express = require('express');
var app = express();
var http = require('http');

var app = express();
var server = http.createServer(app);

var Twit = require('twit')
var _ = require('underscore');

var unirest = require('unirest');
var async = require('async');
var colors = require('colors');
var fs = require('fs');
var util = require('util');
// Retrieve
var MongoClient = require('mongodb').MongoClient;
var collection;

// Connect to the db
MongoClient.connect("mongodb://api.sentify.io:27017/sentify", function(err, db) {
  if(!err) {
    console.log("mongodb connected");
    collection = db.collection('tweets');
  }else{
    console.log("Mongo connection error" + err);
  }
});


var T = new Twit({
    consumer_key:         'GNaRtsOwtDBwIJKumIkxDRLA2'
  , consumer_secret:      'OinhKqJxZ0eIOsEZuehfZggPuhFRE7bc8x6eCKfHZVFjO2yjm8'
  , access_token:         '2427351680-fGbmfIlLxPAIogrZd2fbUcwQR8UyHyaISLt93RJ'
  , access_token_secret:  'TVI7UW8tHVpJ1PqZgZrSGpg9oQXRq3vm9N31nGqehk6aq'
});

var uk = [ '-10.990151', '49.832921', '2.171471', '59.580440'];
var peterborough = [  '-0.498505', '52.486125','-0.162048', '52.675549'];
var sentimentLimit = 35000;
var countFile = "countFile.data";
var count = 30000; //set count high to prevent hitting service if real data is not found

console.log("loading count data");

var count = fs.readFileSync(countFile);
console.log("current count: " + count);

//kill everything if the rate is up near the limit - this will be so much better but for now lets get data!
if(count > 35000)  {
  console.log("exiting due to rate limit");
  process.exit(1);
}
console.log("Listening for real time data");
console.log(peterborough);


//stream listener
var stream = T.stream('statuses/filter', { locations: peterborough, language: 'en' })
stream.on('tweet', function (tweet) {

      var Request = unirest.post("https://japerk-text-processing.p.mashape.com/sentiment/")
        .headers({
          "X-Mashape-Authorization": "djKNHiPRNuUdXAvipKg7KCXjrmlhMAQJ"
        })
        .send({
          "text": tweet.text,
          "language": "english"
        })
        .end(function (response) {
          dateStamp = Math.round(+new Date()/1000); //seconds since epoch
          if(response.body.label){
            tweet.sentiment = response.body.label;
            tweet.probability = response.body.probability;
          }else {
              tweet.sentiment = "";
              tweet.probability = "";
          }

        //  console.log(tweet.probability);
//          console.log(dateStamp + ' : ' + tweet.user.screen_name + ' : ' + tweet.sentiment + ' : ' + tweet.text)
          var mongoDoc = {"timestamp":dateStamp,"user":tweet.user.screen_name,"sentiment":tweet.sentiment,"probability":tweet.probability,"text":tweet.text};
          collection.insert(mongoDoc,function(err, result){
            if(err) console.log(err);
          });
          console.log(tweet.user.screen_name +' : '+tweet.text);
          count++;
          updateCount(countFile,count);
      });
})



//file editing for rate limitier


function updateCount(savPath, data) {
      fs.writeFile (savPath, data, function(err) {
          if (err) throw err;
          console.log('count update complete');
      });
}





//web server frontend

app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/assets", express.static(__dirname + '/assets'));
app.use("/bower_components", express.static(__dirname + '/bower_components'));


app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/getTweets', function(req, res) {
//stream twwets back to web frontend
});
