let ROLL_BASE_URL = `https://api.csgorolltr.com/graphql?operationName=TradeList&variables={variables}&extensions={"persistedQuery":{"version":1,"sha256Hash":"d7fc14483c28e5d48c91d1e4f1c93a0ed9781ff79dff64bfc5bf57da912a43a1"}}`
let ROLL_URL = `https://api.csgorolltr.com/graphql?operationName=TradeList&variables={"first":250,"orderBy":"TOTAL_VALUE_DESC","status":"LISTED","steamAppName":"CSGO"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"d7fc14483c28e5d48c91d1e4f1c93a0ed9781ff79dff64bfc5bf57da912a43a1"}}`

function sleep(ms) {
    console.log(`\nWaiting ${ms/1000} seconds to avoid overloading the server.`);
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { ROLL_URL, ROLL_BASE_URL, sleep }
