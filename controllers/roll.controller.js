const axios = require('axios');
const { ROLL_URL, ROLL_BASE_URL, sleep } = require('../utils/utils.js');
const db = require('../model');
const Item = db.roll;
const BuffItem = db.item;
const UnderpricedItem = require('../model/underpriced.model');
const fs = require('fs');
const underpricedJson = require('../underpriced.json');
const cron = require('node-cron');

let pageInfo = {
    hasNextPage: false,
    endCursor: ""
}

let CNY_USD_RATE = 0.1423949

// Runs everyday at 9 am
cron.schedule("0 9 * * *", () => {
    CNY_USD_RATE = updateExchangeRate()
});

exports.getUnderpricedItems = async (req, res) => {
    res.json(underpricedJson);
}

exports.forceUpdate = async (req, res) => {
    updateItems();
}

cron.schedule("*/15 * * * *", () => {
    updateItems();
})

async function updateItems() {
    let counter = 0;

    var data = { items: [] }

    console.log(`\nInitializing CSGOROLL items update. This operation may take a few minutes.`);

    console.log(`\nRequest ${counter} to ${ROLL_URL}`);

    const response = await axios.get(ROLL_URL, {
        headers: {
            'Accept-Encoding': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
        }
    });

    if (response.status == 200) {
        handleSuccessResponse(response);
        counter++;

        var iterator = response.data.data.trades.edges.values();
        for (let elements of iterator) {
            data.items.push(elements);
        }
    }

    do {
        var variables = {
            first: 250,
            orderBy: "TOTAL_VALUE_DESC",
            status: "LISTED",
            steamAppName: "CSGO",
            after: pageInfo.endCursor,
        }

        var url = ROLL_BASE_URL.replace('{variables}', JSON.stringify(variables));

        console.log(`\nRequest ${counter} to ${url}`);

        const response = await axios.get(url, {
            headers: {
                'Accept-Encoding': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
            }
        });

        if (response.status == 200) {
            handleSuccessResponse(response);
            counter++;

            var iterator = response.data.data.trades.edges.values();
            for (let elements of iterator) {
                data.items.push(elements);
            }
        } else {
            console.log(response);
            return;
        }

        if (counter % 5 == 0) {
            await sleep(30000);
        } else if (counter % 20 == 0) {
            await sleep(40000);
        } else if (counter % 50 == 0) {
            await sleep(60000);
        } else if (counter % 100 == 0) {
            await sleep(1200000);
        } else {
            continue;
        }

    } while (pageInfo.hasNextPage);

    console.log('\nRequests finished, adding items to database.\n');

    Item.deleteMany({})
        .catch(err => {
            console.log(`Some error occurred while removing the previous items.${err.message}`);
        });

    Item.insertMany(data.items)
        .catch(err => {
            console.log(`Some error occurred while inserting the new list of items.${err.message}`);
        });

    await findUnderpricedItems();
}

async function findUnderpricedItems() {
    const docs = await BuffItem.find({});
    console.log('Buff items fetched with success');
    const data = await Item.find({});
    console.log('Roll items fetched with success');
    const underpricedItems = []

    console.log('Starting underpriced items analysis');

    for (const rollItem of data) {
        for (const tradeItem of rollItem.node.tradeItems) {
            for (const buffItem of docs) {
                if (tradeItem.marketName === buffItem.market_hash_name) {
                    let id = tradeItem.id + buffItem._id
                    let rollName = tradeItem.marketName
                    let imageUrl = buffItem.goods_info.icon_url
                    let rollTotalValue = tradeItem.value
                    let rollBaseValue = tradeItem.itemVariant.value
                    let rollMarkup = tradeItem.markupPercent
                    let buffPrice = buffItem.sell_min_price

                    let buffPriceInCoins = (buffPrice * CNY_USD_RATE) / 0.66

                    let priceDiff = (buffPriceInCoins / rollTotalValue)

                    underpricedItems.push(new UnderpricedItem(id, rollName, imageUrl, rollTotalValue, rollBaseValue, rollMarkup, buffPriceInCoins, priceDiff > 1, priceDiff));
                }
            }
        }
    }

    var json = JSON.stringify(underpricedItems);
    fs.writeFile('underpriced.json', json, 'utf8', function (err) {
        if (err) throw err;
        console.log("File has been created");
    });
}

function handleSuccessResponse(response) {
    let responseData = response.data.data

    pageInfo = {
        hasNextPage: responseData.trades.pageInfo.hasNextPage,
        endCursor: responseData.trades.pageInfo.endCursor
    }
}

function updateExchangeRate() {
    var config = {
        method: 'get',
        url: 'https://api.apilayer.com/exchangerates_data/convert?amount=1&to=USD&from=CNY',
        headers: {
            'apiKey': 'ZMY0vGoTRPC09PQM2p4OCQui0DNioBPC'
        }
    };

    axios(config)
        .then(function (response) {
            CNY_USD_RATE = response.data.info.rate
        })

    console.log(`CNY/USD rate updated to ${CNY_USD_RATE}`);
}