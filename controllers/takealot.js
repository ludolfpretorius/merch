// add filter = 'sort='
// price low = 'Price%20Ascending'
// price high = 'Price%20Descending'
// newest = 'ReleaseDate%20Descending'

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

const handleTakealot = async(puppeteer, cheerio, keywords, sort) => {

    if (sort === 'price-low') {
        sort = 'sort=Price%20Ascending&'
    } else if (sort === 'price-high') {
        sort = 'sort=Price%20Descending&'
    } else if (sort === 'newest') {
        sort = 'sort=ReleaseDate%20Descending&'
    } else {
        sort = ''
    }
    const url = `https://www.takealot.com/all?${sort}qsearch=${keywords}`;

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
        while(content.length <= 10) {
     		content.push({
     			thumb: $(this).find('.p-thumb img').attr('src'),
                title: $(this).find('.p-data a').text(),
                price: $(this).find('.price .currency').text() + $(this).find('.price .amount').text(),
                shipping: $(this).find('.shipping-information > div > span > strong').text(),
                rating: $(this).find('.product-rating > span').attr('title'),
                link: 'https://takealot.com' + $(this).find('.p-thumb > a').attr('href')
      		});
        }
	});

	//console.log(content)
	await browser.close();
    return content
}

module.exports = {
	handleTakealot: handleTakealot
}