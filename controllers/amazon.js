// search params = '&s='
// newest = 'date-desc-rank'
// price low-high = 'price-asc-rank'
// price high-low = 'price-desc-rank'


async function trimTitle(arr) {
    await arr.forEach(obj => {
        if (obj.title.length > 61) {
            obj.titleshort = obj.title.slice(0, 61).trim() + '...'
        } else {
            obj.titleshort = obj.title
        }
    })
}

const handleAmazon = async(puppeteer, cheerio, keywords, sort, axios) => {
	
	// axios.defaults.headers.post['Content-Type'] ='application/x-www-form-urlencoded';
	const currencyRate = new Promise((resolve, reject) => {
	    axios({
	    	url: 'https://free.currconv.com/api/v7/convert?q=USD_ZAR,ZAR_USD&compact=ultra&apiKey=244f8034de6966bb8bd9',
	    })
		.then(res => resolve(res.data.USD_ZAR))
		.catch(e => console.log(e.response.data))
	});
	
	if (sort === 'price-low') {
        sort = 'price-asc-rank'
    } else if (sort === 'price-high') {
        sort = 'price-desc-rank'
    } else if (sort === 'newest') {
        sort = 'date-desc-rank'
    } else {
        sort = ''
    }
	const url = `https://www.amazon.com/s?k=${keywords}&s=${sort}`

	let browser = await puppeteer.launch({
		headless: true,
		//args: ['--proxy-server=socks5://127.0.0.1:9050']
	})
	let page = await browser.newPage()
	await page.setDefaultNavigationTimeout(0);
	await page.goto(url, {waitUntil: 'load'}); //networkidle2 to wait a little longer

	const convertDollars = await currencyRate; //USD_ZAR	

    const html = await page.content()
	let content = []
	const $ = await cheerio.load(html);
	function fixPrice(listItem) {
		if (listItem.find('.a-offscreen').text()) {
			const getPrice = listItem.find('.a-price-whole').text().replace(/\r\n|\r|\n|[,]/g, '') + listItem.find('.a-price-fraction').text().replace(/(?:\r\n|\r|\n)/g, '');
			const convertedPrice = Number(getPrice) * convertDollars;
			return Math.round((convertedPrice + Number.EPSILON) * 100) / 100;
		} else {
			return 0;
		}
	}
	function fixRating(rating) {
		return rating.length ? Number(rating.split(' ')[0]) : null
	}
	$('.s-result-list > div').each(function() {
		if (content.length <= 10) {
	        content.push({
	            thumb: $(this).find('.s-image').attr('src'),
	            title: $(this).find('.a-link-normal > .a-text-normal').text(),
	            price: fixPrice($(this)),
	            meta: $(this).find('.a-spacing-top-micro span.a-size-small').text() ? [$(this).find('.a-spacing-top-micro span.a-size-small').text()] : ['N/A'],
	            rating: fixRating($(this).find('.a-icon-star-small').text()),
	            link: 'https://amazon.com' + $(this).find('.a-link-normal').attr('href'),
	            site: 'amazon'
	        });
		}
    });
	await browser.close();
	content.pop()
	await trimTitle(content)
	return content;
}

module.exports = {
    handleAmazon: handleAmazon
}

