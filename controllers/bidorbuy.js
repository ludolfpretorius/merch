// add sort = '&tradeListFormSubmited=true&LogQuery=false&pageNo=1&CustomFilter=None&tradeListFilteredFields=&OrderBy='
// default = 'Default'
// Price low-high = 'Price'
// Price high-low = 'HigherPrice'
// Newest = 'Opening'

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

const handleBidorbuy = async(puppeteer, cheerio, keywords, sort) => {

    if (sort === 'price-low') {
        sort = 'Price'
    } else if (sort === 'price-high') {
        sort = 'HigherPrice'
    } else if (sort === 'newest') {
        sort = 'Opening'
    } else {
        sort = 'Default'
    }
    const url = `https://www.bidorbuy.co.za/jsp/tradesearch/TradeSearch.jsp?mode=execute&isInteractive=true&sellerSearchUrl=https%3A%2F%2Fwww.bidorbuy.co.za%2Fjsp%2Fusersearch%2FUserNameSearch.jsp%3FUserNameChars%3D&IncludedKeywords=${keywords}&CategoryId=-1&tradeListFormSubmited=true&LogQuery=false&pageNo=1&CustomFilter=None&tradeListFilteredFields=&OrderBy=${sort}`;

	let browser = await puppeteer.launch({
		headless: true,
		//args: ['--proxy-server=socks5://127.0.0.1:9050']
	});
	let page = await browser.newPage();
	await page.goto(url, {waitUntil: 'load'}); //networkidle2 to wait a little longer

    await page.setViewport({
        width: 1200,
        height: 800
    });

    await autoScroll(page);

    const html = await page.content()
	let content = []
	const $ = await cheerio.load(html);
	$('.tradelist-item-container-grid').each(function() {
        while(content.length <= 10) {
            content.push({
                thumb: $(this).find('.tradelist-item-thumbnail img').attr('src'),
                title: $(this).find('.tradelist-item-title').text().replace(/\s/g, ''),
                price: $(this).find('.tradelist-item-price > span > span').eq(0).text() + $(this).find('.tradelist-item-price > span > span').eq(1).text(),
                //shipping: $(this).find('.location-date > span').eq(0).text() + '• ' + $(this).find('.location-date > span').eq(1).text(),
                //rating: $(this).find('.a-icon-star-small').text(),
                link: $(this).find('.tradelist-grid-item-link').attr('href')
            });
        }
    });

	//console.log(content);
	await browser.close();
    return content
}

module.exports = {
	handleBidorbuy: handleBidorbuy
}