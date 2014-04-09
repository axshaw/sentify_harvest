$(document).ready(function(){


	$.ajax({
		url: "/getTweets",
		success: function(tweets){
			var counter = 0;

			setInterval(function(){
				if(counter < tweets.length){
					counter++;
					var tweet = tweets[counter];

					var headerSize = 60;
					var bodyWidth = $('body').width();
					var bodyHeight = $('body').height();

					$('body')
					.append('<div class="twall-user"></div>')
					.find('div:last')
					.append('<div class="picture"><img src="'+ tweet.user.profile_image_url +'"/></div><div class="text">' + tweet.text +'</div>')
					.hide();

					var tweetUI = $('.twall-user:last');

					tweetUI
					.fadeIn(500, function(){
						var elem = $(this);


						setTimeout(function(){
							elem.animate({
								left:'10000px'
							}, 4000)
						}, 8000);
					})
					.css({
						'position':'absolute',
						top: headerSize + Math.floor(Math.random() * (bodyHeight - tweetUI.height())) + 1,
						left:'-10000px'
					})
					.animate({
						left:Math.floor(Math.random() * (bodyWidth-tweetUI.width())) + 1
					}, 4000)


				}
			}, 1000);
		}
	});
});

