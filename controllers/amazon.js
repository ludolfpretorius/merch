const url = 'https://www.amazon.com/s?k=google+home+mini&ref=nb_sb_noss';

const handleAmazon = async(puppeteer, cheerio) => {
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
			while(content.length <= 10) {
		        content.push({
		            thumb: $(this).find('.s-image').attr('src'),
		            title: $(this).find('.a-link-normal > .a-text-normal').text(),
		            price: $(this).find('.a-offscreen').text(),
		            shipping: $(this).find('.a-spacing-top-micro span.a-size-small').text(),
		            rating: $(this).find('.a-icon-star-small').text(),
		            link: 'https://amazon.com' + $(this).find('.a-link-normal').attr('href')
		        });
			}
	    });
	content.pop()
	//console.log(content)
	await browser.close();
	return content;
}

module.exports = {
    handleAmazon: handleAmazon
}

