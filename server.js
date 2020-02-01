const cheerio = require('cheerio')
const axios = require('axios')
const puppeteer = require('puppeteer')
const nodemon = require('nodemon')

const url = 'https://www.takealot.com/all?_sb=1&_r=1&_si=3a9fcd87be31780b28a1bd97ce88c785&qsearch=casio+gshock';

(async() => {
	let browser = await puppeteer.launch({headless: false})
	let page = await browser.newPage()
	await page.goto(url, {waitUntil: 'networkidle2'});
	await page.evaluate(() => {
		const footer = document.querySelector('.footer')
		footer.scrollIntoView({behavior: "smooth"})
	})
	setTimeout(() => {
		(async () => {
			const html = await page.content()
			let content = []
			const $ =  cheerio.load(html);
			 $('.product-list > li').each(function() {
		 		content.push({
		 			thumb: $(this).find('.p-thumb img').attr('src'),
		    		title: $(this).find('.p-data a').text(),
		    		price: $(this).find('.price .currency').text() + $(this).find('.price .amount').text()
		  		});
			});
			console.log(content)
			// await browser.close()
		})().catch(e => {
			console.log(e)
		})
	}, 1000)
})().catch(e => {
	console.log(e)
})














// const browserInstance = puppeteer.launch({headless: false});
// browserInstance.then(browser => browser.newPage())
// .then(page => {
// 	return page.goto(url, {waitUntil: 'networkidle2'}).then(function() {
// 		//page.evaluate(() => {
// 		  //const footer = document.querySelector('.footer')
// 		  //footer.scrollIntoView({behavior: "smooth"})
// 		  //window.scrollBy(0, document.body.scrollHeight);
		  
// 		//});
// 		return page.content();
// 	});

// })
// .then(html => {
// 	const $ = cheerio.load(html);
// 	let content = [];
// 	$('.product-list > li').each(function() {
//  		content.push({
//  			thumb: $(this).find('.p-thumb img').attr('src'),
//     		title: $(this).find('.p-data a').text(),
//     		price: $(this).find('.price .currency').text() + $(this).find('.price .amount').text()
//   		});
// 	});
// 	console.log(content);
// })