// add filters = '&sort=pr&order='
// newest is the default query
// price low = 'asc'
// price high = 'dec'

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

const handleGumtree = async(puppeteer, cheerio, keywords, sort) => {

    if (sort === 'price-low') {
        sort = '&sort=pr&order=asc'
    } else if (sort === 'price-high') {
        sort = '&sort=pr&order=dec'
    } else if (sort === 'newest') {
        sort = ''
    } else {
        sort = ''
    }
    const url = `https://www.gumtree.co.za/s-all-the-ads/v1b0p1?q=${keywords}${sort}`;

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
	$('.related-content > .related-item').each(function() {
        while(content.length <= 10) {
            content.push({
                thumb: $(this).find('.img-container img').attr('data-src'),
                title: $(this).find('.title > a > span').text(),
                price: $(this).find('.ad-price').text().replace(/\s/g,''),
                shipping: $(this).find('.location-date > span').eq(0).text() + '• ' + $(this).find('.location-date > span').eq(1).text(),
                //rating: $(this).find('.a-icon-star-small').text(),
                link: 'https://www.gumtree.co.za' + $(this).find('.title > a').attr('href')
            });
        }
    });

	//console.log(content)
	await browser.close();
    return content
}

module.exports = {
	handleGumtree: handleGumtree
}