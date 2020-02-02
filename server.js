const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const nodemon = require('nodemon')

const url = 'https://www.takealot.com/all?_sb=1&_r=1&_si=3a9fcd87be31780b28a1bd97ce88c785&qsearch=casio+gshock';

(async() => {
	let browser = await puppeteer.launch({
		headless: true,
		//args: ['--proxy-server=socks5://127.0.0.1:9050']
	})
	let page = await browser.newPage()
	await page.goto(url, {waitUntil: 'load'}); //networkidle2 to wait a little longer

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
    		price: $(this).find('.price .currency').text() + $(this).find('.price .amount').text(),
    		shipping: $(this).find('.shipping-information > div > span > strong').text(),
            rating: $(this).find('.product-rating > span').attr('title'),
            link: 'https://takealot.com' + $(this).find('.p-thumb > a').attr('href')
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
