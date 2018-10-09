let snekfetch   = require('snekfetch');
const Snoowrap  = require('snoowrap');
const Snoostorm = require('snoostorm');
let pm2         = require('pm2');
require('dotenv').config();

const e = new Snoowrap({
    userAgent: 'reddit-bot-example-node',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});
const rClient = new Snoostorm(e);

const streamOpts = {
	subreddit: 'all',
	results: 100
};

const comments = rClient.CommentStream(streamOpts);
comments.on('comment', (comment) => {

	let rawComment = comment.body.replace(String.fromCharCode(92), ''); 

	let rawSubreddit = comment.subreddit_name_prefixed.split("r/")[1]


	if (rawComment.startsWith("-lyrics ")) {
		if (rawSubreddit === 'depression' || rawSubreddit === 'suicidewatch') return; 

		let lyrics = comment.body.replace(String.fromCharCode(92), "").split("-lyrics ")[1] 

	snekfetch.get(`http://api.genius.com/search?q=${lyrics}`, {
		headers: {
		'Authorization': `Bearer ${process.env.GENIUS}` 
	}

}).catch(function(err) {
	if (err) throw err;
})
.then(r => {
	try {
		let song = JSON.parse(JSON.stringify(r.body)) // fetched song
		
		comment.reply(lyrics == String(song.response.hits[0].result.full_title.toLowerCase()) || lyrics == String(song.response.hits[0].result.title.toLowerCase()) ?  `[${song.response.hits[0].result.full_title}]`+`(${song.response.hits[0].result.url})\n______\n*Hey! I'm a bot! You can use **-lyrics [song name]** to search for the lyrics of a song.*` : `[${song.response.hits[0].result.full_title}]`+`(${song.response.hits[0].result.url})\n______\n*This is not an exact match. If you were looking for a different song, try being more specific.*\n______\n*Hey! I'm a bot! You can use **-lyrics [song name]** to search for the lyrics of a song.*`);
	} catch (err) {
		if (err) {console.error(err)
		}
	} 
})}});
