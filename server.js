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

app.get('/bidorbuy', (req, res) => {
	res.sendFile(__dirname + '/public/bidorbuy.html')

});
app.post('/bidorbuy', (req, res) => {
	(async() => {
		const content = await bidorbuy.handleBidorbuy(puppeteer, cheerio);
		await res.json(content);
	})()
});



app.listen(3000, () => {
	console.log('Listening on port 3000')
})
