module.exports = class UnderpricedItem {
    constructor(id, marketName, imageUrl, rollTotalPrice, rollBasePrice, rollMarkup, buffPrice, isUnderpriced, underpricedPerc) {
        this.id = id;
        this.marketName = marketName;
        this.imageUrl = imageUrl;
        this.rollTotalPrice = rollTotalPrice;
        this.rollBasePrice = rollBasePrice;
        this.rollMarkup = rollMarkup;
        this.buffPrice = buffPrice;
        this.isUnderpriced = isUnderpriced;
        this.underpricedPerc = underpricedPerc;
    }

    showUnderpricedMessage() {
        console.log(`- ${this.marketName} -> roll_price: ${this.rollTotalPrice} (${this.rollBasePrice} +${this.rollMarkup}%); buff_price: ${this.buffPrice.toFixed(3)} ----> ${this.underpricedPerc.toFixed(3)}%`)
    }
}