const url = 'https://www.ebay.com/sch/i.html?_from=R40&_trksid=m570.l1313&_nkw=google+mini&_sacat=0';

const handleEbay = async(puppeteer, cheerio) => {
	let browser = await puppeteer.launch({
		headless: true,
		//args: ['--proxy-server=socks5://127.0.0.1:9050']
	})
	let page = await browser.newPage()
	await page.goto(url, {waitUntil: 'load'}); //networkidle2 to wait a little longer

   	const html = await page.content()
	let content = []
	const $ = await cheerio.load(html);
	$('.srp-results > li').each(function() {
		while(content.length <= 10) {
	 		content.push({
	 			thumb: $(this).find('.s-item__image-wrapper > img').attr('src'),
	    		title: $(this).find('.s-item__title').text(),
	    		price: $(this).find('.s-item__price').text() + $(this).find('.price .amount').text(),
	    		shipping: $(this).find('.s-item__shipping').text(),
	            rating: $(this).find('.b-starrating > .clipped').text(),
	            link: $(this).find('.s-item__link').attr('href')
	  		});
	 	}
	});
	//console.log(content)
	await browser.close();
	return content
}

module.exports = {
	handleEbay: handleEbay
}