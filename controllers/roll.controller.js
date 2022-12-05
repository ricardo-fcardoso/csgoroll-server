const axios = require('axios');
const { ROLL_URL, ROLL_BASE_URL, sleep } = require('../utils/utils.js');
const db = require('../model');
const Item = db.roll;
const BuffItem = db.item;

let pageInfo = {
    hasNextPage: false,
    endCursor: ""
}

// fetch full items list from api.csgoroll.com
exports.getItems = async (req, res) => {
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
        handleSuccessResponse(response, res);
        counter++;

        var iterator = response.data.data.trades.edges.values();
        for (let elements of iterator) {
            data.items.push(elements);
        }

        res.status(200).send({
            result: 'First request made with success. Server update will start soon.',
        })
    } else {
        res.status(400).send({
            result: 'An error occurred',
            error: response.data
        })
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

    findUnderpricedItems(data);
}

async function findUnderpricedItems(data) {
    const docs = await BuffItem.find({});

    for (const rollItem of data.items) {
        for (const tradeItem of rollItem.node.tradeItems) {
            for (const buffItem of docs) {
                if (tradeItem.marketName === buffItem.market_hash_name) {
                    let rollName = tradeItem.marketName
                    let rollTotalValue = tradeItem.value
                    let rollBaseValue = tradeItem.itemVariant.value
                    let rollMarkup = tradeItem.markupPercent
                    let buffName = buffItem.market_hash_name
                    let buffPrice = buffItem.sell_min_price

                    let buffPriceInCoins = (buffPrice * 0.1423949) / 0.66

                    let priceDiff = (buffPriceInCoins / rollTotalValue)

                    if (priceDiff > 1) {
                        let underpricedPerc = (priceDiff - 1) * 100
                        console.log(`- ${rollName} -> ROLL: ${rollTotalValue} (${rollBaseValue} +${rollMarkup}%) BUFF: ${buffPriceInCoins.toFixed(2)} (UNDERPRICED ${underpricedPerc.toFixed(2)}%)`);
                    } else {
                        let overpricedPerc = (1 - priceDiff) * 100
                        console.log(`- ${rollName} -> ROLL: ${rollTotalValue} (${rollBaseValue} +${rollMarkup}%) BUFF: ${buffPriceInCoins.toFixed(2)} (OVERPRICED ${overpricedPerc.toFixed(2)}%)`);
                    }
                }
            }
        }
    }
}

function handleSuccessResponse(response) {
    let responseData = response.data.data

    pageInfo = {
        hasNextPage: responseData.trades.pageInfo.hasNextPage,
        endCursor: responseData.trades.pageInfo.endCursor
    }
}