const url = 'https://www.bidorbuy.co.za/jsp/tradesearch/TradeSearch.jsp?mode=execute&isInteractive=true&sellerSearchUrl=https%3A%2F%2Fwww.bidorbuy.co.za%2Fjsp%2Fusersearch%2FUserNameSearch.jsp%3FUserNameChars%3D&IncludedKeywords=google+mini&CategoryId=-1';

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

const handleBidorbuy = async(puppeteer, cheerio) => {
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
        content.push({
            thumb: $(this).find('.tradelist-item-thumbnail img').attr('src'),
            title: $(this).find('.tradelist-item-title').text().replace(/\s/g, ''),
            price: $(this).find('.tradelist-item-price > span > span').eq(0).text() + $(this).find('.tradelist-item-price > span > span').eq(1).text(),
            //shipping: $(this).find('.location-date > span').eq(0).text() + '• ' + $(this).find('.location-date > span').eq(1).text(),
            //rating: $(this).find('.a-icon-star-small').text(),
            link: $(this).find('.tradelist-grid-item-link').attr('href')
        });
    });

	//console.log(content);
	await browser.close();
    return content
}

module.exports = {
	handleBidorbuy: handleBidorbuy
}