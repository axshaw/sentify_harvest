var express = require('express');
var app = express();
var http = require('http');

var app = express();
var server = http.createServer(app);

var Twit = require('twit')
var _ = require('underscore');

var T = new Twit({
    consumer_key:         'GNaRtsOwtDBwIJKumIkxDRLA2'
  , consumer_secret:      'OinhKqJxZ0eIOsEZuehfZggPuhFRE7bc8x6eCKfHZVFjO2yjm8'
  , access_token:         '2427351680-fGbmfIlLxPAIogrZd2fbUcwQR8UyHyaISLt93RJ'
  , access_token_secret:  'TVI7UW8tHVpJ1PqZgZrSGpg9oQXRq3vm9N31nGqehk6aq'
});

var keywords = ['car', 'insurance'];


var startDate = new Date();
startDate.setDate(startDate.getDate() - 7);
var from = startDate.getFullYear() + '-' + (startDate.getMonth()+1) + '-' +  startDate.getDate();

from = '2014-04-04';

var search = keywords.join(' ') + ' since:' + from;
var uk = [ '-10.990151', '49.832921', '2.171471', '59.580440'];

var arguments = process.argv.slice(2);

var showLiveData =  arguments[0] || false;

if(!showLiveData){
	console.log("Getting Historic Data.....")
	T.get('search/tweets', { q: search, count: 250, location : uk }, function(err, reply) {

		var tweets = reply.statuses;

		//Filter by location...only UK

		for(var i = 0 ; i < tweets.length; i++){

			console.log(tweets[i].user.screen_name + " : " + tweets[i].text)
		}
	});
}
else{
	console.log("Listening for real time data");

	var stream = T.stream('user', { track: 'car', locations: uk })

	stream.on('tweet', function (tweet) {
	if(tweet.place){
		if(tweet.place.country === "United Kingdom" || tweet.place.country === "Ireland"){



			var hasCar = new RegExp("\\b" + "car" + "\\b", "g").test(tweet.text);
			var hasInsurance = new RegExp("\\b" + "insurance" + "\\b", "g").test(tweet.text);

			if(hasInsurance || hasCar){
				console.log(tweet.place.country + " : " +  tweet.text)	
			}

			
		}
	}
})
}


app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/assets", express.static(__dirname + '/assets'));
app.use("/bower_components", express.static(__dirname + '/bower_components'));


app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/getTweets', function(req, res) {
	T.get('search/tweets', { q: search, count: 250, location : uk }, function(err, reply) {
		var tweets = reply.statuses;
		res.json(tweets);
	});
});

server.listen(3000);



