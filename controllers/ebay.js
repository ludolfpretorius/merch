// add filter = '&_sop='
// price low = '15'
// price high = '16'
// new = '10'

async function trimTitle(arr) {
    await arr.forEach(obj => {
        if (obj.title.length > 61) {
            obj.titleshort = obj.title.slice(0, 61).trim() + '...'
        } else {
            obj.titleshort = obj.title
        }
    })
}

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
	let page = await browser.newPage();
	await page.setDefaultNavigationTimeout(0);
	await page.goto(url, {waitUntil: 'load'}); //networkidle2 to wait a little longer

   	const html = await page.content()
	let content = []
	const $ = await cheerio.load(html);
	function fixPrice(listItem) {//
        let getPrice = listItem.find('.s-item__price').text() + listItem.find('.price .amount').text();
        return Number(getPrice.replace(/([ZAR]|\s|[,])/g, ''))
    }
	$('.srp-results > li').each(function() {
		if (content.length <= 9) {
	 		content.push({
	 			thumb: $(this).find('.s-item__image-wrapper > img').attr('src'),
	    		title: $(this).find('.s-item__title').text(),
	    		price: fixPrice($(this)),
	    		shipping: $(this).find('.s-item__shipping > span') ? $(this).find('.s-item__shipping > span').text() : $(this).find('.s-item__shipping').text(),
	            rating: $(this).find('.b-starrating > .clipped').text(),
	            link: $(this).find('.s-item__link').attr('href'),
	            site: 'ebay'
	  		});
	 	}
	});
	//console.log(content)
	await browser.close()
	await trimTitle(content)
	return content
}

module.exports = {
	handleEbay: handleEbay
}