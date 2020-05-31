'use strict'

require('make-promises-safe');
const cheerio = require('cheerio');
const axios = require('axios');
const puppeteer = require('puppeteer');
const nodemon = require('nodemon');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const amazon = require('./controllers/amazon');
const bidorbuy = require('./controllers/bidorbuy');
const ebay = require('./controllers/ebay');
const gumtree = require('./controllers/gumtree');
const takealot = require('./controllers/takealot');

const app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html')
})


app.get('/search/:search', (req, res) => {
	console.time('searched')
	const { search } = req.params
	let searchParams = search.replace(/[?]/g, '=').split('=')
	let keywords;
	let sort;
	if (searchParams[0] === 'keywords') {
		keywords = searchParams[1]
	} else if (searchParams[2] === 'sort') {
		sort = searchParams[3]
	}

	const url1 = amazon.handleAmazon(puppeteer, cheerio, keywords, sort, axios);
	const url2 = bidorbuy.handleBidorbuy(puppeteer, cheerio, keywords, sort);
	const url3 = ebay.handleEbay(puppeteer, cheerio, keywords, sort);
	const url4 = gumtree.handleGumtree(puppeteer, cheerio, keywords, sort);
	const url5 = takealot.handleTakealot(puppeteer, cheerio, keywords, sort);
	function handleRejection(prom) {
		return prom.catch(err => console.log(err)) //({error: err})
	}
	async function resolveAll(arr) {
		return await Promise.all([url1, url2, url3, url4, url5].map(handleRejection));
	}
	resolveAll()
	.then(data => {
		function compare( a, b ) {
			if ( a.price < b.price ){
				return -1;
			} else if ( a.price > b.price ){
				return 1;
			}
			return 0;
		}
		let merged = [].concat.apply([], data).sort(compare);
		const contentReady = merged.filter(a => {
			return a.thumb
		})
		contentReady.forEach((a, i) => {
			a.id = Math.random().toString().slice(2)
			a.wished = false
			contentReady.forEach(b => {
				if (i !== contentReady.indexOf(b) && a.id === b.id) {
					a.id = Math.random().toString().slice(2)
				}
			}) 
		})
		return contentReady
	})
	.then(results => res.json(results)).then(() => {res.end(); console.timeEnd('searched')})

});



app.listen(3000, () => {
	console.log('Listening on port 3000')
})
