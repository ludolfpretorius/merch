const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const nodemon = require('nodemon')

const url = 'https://www.amazon.com/s?k=google+home+mini&ref=nb_sb_noss';

(async() => {
	let browser = await puppeteer.launch({
		headless: true,
		//args: ['--proxy-server=socks5://127.0.0.1:9050']
	})
	let page = await browser.newPage()
	await page.goto(url, {waitUntil: 'load'}); //networkidle2 to wait a little longer

   	const html = await page.content()
	let content = []
	const $ = await cheerio.load(html);
	$('.s-result-list > div').each(function() {
 		content.push({
 			thumb: $(this).find('.s-image').attr('src'),
    		title: $(this).find('.a-link-normal > .a-text-normal').text(),
    		price: $(this).find('.a-offscreen').text(),
    		shipping: $(this).find('.a-spacing-top-micro span.a-size-small').text(),
    		rating: $(this).find('.a-icon-star-small').text(),
    		link: 'https://amazon.com' + $(this).find('.a-link-normal').attr('href')
  		});
	});
	console.log(content)
	await browser.close()

})().catch(e => {
	console.log(e)
});


