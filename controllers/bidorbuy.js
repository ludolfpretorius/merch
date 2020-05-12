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

async function trimTitle(arr) {
    await arr.forEach(obj => {
        if (obj.title.length > 61) {
            obj.titleshort = obj.title.slice(0, 61).trim() + '...'
        } else {
            obj.titleshort = obj.title
        }
    })
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
        let getPrice = listItem.find('meta[itemprop=price]').attr('content') //listItem.find('.tradelist-item-price > span > span').eq(0).text() + listItem.find('.tradelist-item-price > span > span').eq(1).text();
        return Number(getPrice)
    }
	$('.tradelist-item-container-grid').each(function() {
        if (content.length <= 9) {
            content.push({
                thumb: $(this).find('.tradelist-item-thumbnail img').attr('src'),
                title: $(this).find('.tradelist-item-title').text().replace(/(?:\r\n|\r|\n)/g, '').trim().replace(/\s\s+/g, ' '),
                price: fixPrice($(this)),
                shipping: $(this).find('.tradelist-item-price time').text(),
                rating: $(this).find('.user-verified') ? 'Verified user' : 'User not verified',
                link: $(this).find('.tradelist-grid-item-link').attr('href'),
                site: 'bidorbuy'
            });
        }
    });

	await browser.close();
    await trimTitle(content)
    return content
}

module.exports = {
	handleBidorbuy: handleBidorbuy
}