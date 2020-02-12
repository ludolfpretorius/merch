// add filter = '&_sop='
// price low = '15'
// price high = '16'
// new = '10'

const handleEbay = async(puppeteer, cheerio, keywords, sort) => {
	
	if (sort === 'price-low') {
        sort = '15'
    } else if (sort === 'price-high') {
        sort = '16'
    } else if (sort === 'newest') {
        sort = '10'
    } else {
        sort = ''
    }
	const url = `https://www.ebay.com/sch/i.html?_nkw=${keywords}&_sop=${sort}`;

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