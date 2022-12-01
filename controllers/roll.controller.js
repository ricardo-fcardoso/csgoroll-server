const axios = require('axios');
const { ROLL_URL, ROLL_BASE_URL, sleep } = require('../utils/utils.js');

let pageInfo = {
    hasNextPage: false,
    endCursor: ""
}

// fetch full items list from api.csgoroll.com
exports.getItems = async (req, res) => {
    let counter = 0;

    var data = { items: [] }

    console.log(`Initializing CSGOROLL items update. This operation may take a few minutes.`);

    console.log(`Request ${counter} to ${ROLL_URL}\n`);

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

        console.log(`Request ${counter} to ${url}\n`);

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
            res.status(400).send({
                result: 'An error occurred',
                error: response.data
            })
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

    const jsonData = JSON.stringify(data);
    const fs = require('fs');

    // write JSON string to a file
    fs.writeFile('items.json', jsonData, err => {
        if (err) {
            throw err
        }
        console.log('JSON data is saved.')
    })
}

function handleSuccessResponse(response) {
    let responseData = response.data.data

    pageInfo = {
        hasNextPage: responseData.trades.pageInfo.hasNextPage,
        endCursor: responseData.trades.pageInfo.endCursor
    }
}