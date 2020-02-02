const cheerio = require('cheerio')
const axios = require('axios')
const puppeteer = require('puppeteer')
const nodemon = require('nodemon')

const url = 'https://www.takealot.com/all?_sb=1&_r=1&_si=3a9fcd87be31780b28a1bd97ce88c785&qsearch=casio+gshock';

(async() => {
	let browser = await puppeteer.launch({
		headless: false,
		//args: ['--proxy-server=socks5://127.0.0.1:9050']
	})
	let page = await browser.newPage()
	await page.goto(url, {waitUntil: 'load'}); //networkidle2 to wait a little longer
	
	let footer;
	await page.evaluate(() => {
		footer = document.querySelector('.footer')
		footer.scrollIntoView({behavior: "smooth"})
	});

    await page.setViewport({
        width: 1200,
        height: 800
    });

    await autoScroll(page);

    const html = await page.content()
	let content = []
	const $ = await cheerio.load(html);
	$('.product-list > li').each(function() {
 		content.push({
 			thumb: $(this).find('.p-thumb img').attr('src'),
    		title: $(this).find('.p-data a').text(),
    		price: $(this).find('.price .currency').text() + $(this).find('.price .amount').text()
  		});
	});

	console.log(content)
	await browser.close()

})().catch(e => {
	console.log(e)
});

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 30);
        });
    });
}
















// html.querySelectorAll('.product-list > li').forEach(i => {
			// 	content.push({
		 // 			thumb: i.querySelector('.p-thumb img').src,
		 //    		title: i.querySelector('.p-data a').innerText(),
		 //    		price: i.querySelector('.price .currency').innerText() + i.querySelector('.price .amount').innerText()
		 //  		});
			// })


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