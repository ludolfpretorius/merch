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

async function trimTitle(arr) {
    await arr.forEach(obj => {
        if (obj.title.length > 61) {
            obj.titleshort = obj.title.slice(0, 61).trim() + '...'
        } else {
            obj.titleshort = obj.title
        }
    })
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
    await page.setDefaultNavigationTimeout(0);
	await page.goto(url, {waitUntil: 'load'}); //networkidle2 to wait a little longer

    await page.setViewport({
        width: 1200,
        height: 800
    });

    await autoScroll(page);

    const html = await page.content()
	let content = []
	const $ = await cheerio.load(html);
    function fixPrice(listItem) {//
        let getPrice = listItem.find('.ad-price').text();
        return Number(getPrice.replace(/([R]|\s|[,])/g, ''))
    }
	$('.related-content > .related-item').each(function() {
        if (content.length <= 9) {
            content.push({
                thumb: $(this).find('.img-container img').attr('data-src'),
                title: $(this).find('.title > a > span').text(),
                price: fixPrice($(this)),
                shipping: $(this).find('.location-date > span').eq(0).text() + '• ' + $(this).find('.location-date > span').eq(1).text(),
                rating: 'N/A', //$(this).find('.a-icon-star-small').text(),
                link: 'https://www.gumtree.co.za' + $(this).find('.title > a').attr('href'),
                site: 'gumtree'
            });
        }
    });

	await browser.close()
    await trimTitle(content)
    return content
}

module.exports = {
	handleGumtree: handleGumtree
}