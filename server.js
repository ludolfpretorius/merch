const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const nodemon = require('nodemon')
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const amazon = require('./controllers/amazon');
const bidorbuy = require('./controllers/bidorbuy');
const ebay = require('./controllers/ebay');
const gumtree = require('./controllers/gumtree');
const takealot = require('./controllers/takealot');

const app = express();
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html')
})

app.get('/search', (req, res) => {
	res.sendFile(__dirname + '/public/bidorbuy.html')

});
app.post('/search', (req, res) => {
	(async() => {
		const url1 = await amazon.handleAmazon(puppeteer, cheerio);
		const url2 = await bidorbuy.handleBidorbuy(puppeteer, cheerio);
		const url3 = await ebay.handleEbay(puppeteer, cheerio);
		const url4 = await gumtree.handleGumtree(puppeteer, cheerio);
		const url5 = await takealot.handleTakealot(puppeteer, cheerio);

		const content = await [...url1, ...url2, ...url3, ...url4, ...url5]
		await res.json(content);
		await console.log(content);
	})()
});


app.listen(3000, () => {
	console.log('Listening on port 3000')
})
