const url = 'https://www.amazon.com/s?k=google+home+mini&ref=nb_sb_noss';

const autoScroll = async(page) => {
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

const handleAmazon = async(puppeteer, cheerio) => {
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
	$('.s-result-list > div').each(function() {
 		content.push({
 			thumb: $(this).find('.s-image').attr('src'),
    		title: $(this).find('.a-link-normal > .a-text-normal').text(),
    		price: $(this).find('.a-offscreen').text(),
    		shipping: $(this).find('.shipping-information > div > span > strong').text(),
    		rating: $(this).find('.a-icon-star-small').text(),
    		link: 'https://amazon.com' + $(this).find('.a-link-normal').attr('href')
  		});
	});
	content.pop()
	console.log(content)
	await browser.close()

}

module.exports = {
    handleAmazon: handleAmazon
}

