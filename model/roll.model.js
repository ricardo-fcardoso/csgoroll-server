module.exports = mongoose => {
    const Category = mongoose.Schema({
        id: String,
        name: String,
        __typename: String
    })

    const ItemVariant = mongoose.Schema({
        id: String,
        itemId: String,
        name: String,
        brand: String,
        iconUrl: String,
        value: Number,
        currency: String,
        displayValue: Number,
        exchangeRate: Number,
        shippingCost: Number,
        usable: Boolean,
        obtainable: Boolean,
        withdrawable: Boolean,
        depositable: Boolean,
        externalId: String,
        type: String,
        category: Category,
        color: String,
        size: Number,
        rarity: String,
        availableAssets: [String],
        purchasable: String,
        totalRequested: Number,
        totalAvailable: Number,
        totalFulfilled: Number,
        totalUnfulfilled: Number,
        createdAt: String,
        __typename: String
    })

    const TradeItems = mongoose.Schema({
        id: String,
        marketName: String,
        value: Number,
        customValue: Boolean,
        itemVariant: ItemVariant,
        markupPercent: Number,
        __typename: String
    })

    const Node = mongoose.Schema({
        id: String,
        status: String,
        steamAppName: String,
        cancelReason: String,
        canJoinAfter: String,
        markupPercent: Number,
        createdAt: String,
        depositor: String,
        promoCode: String,
        expiresAt: String,
        withdrawerSteamTradeUrl: String,
        customValue: Boolean,
        withdrawer: String,
        totalValue: Number,
        updatedAt: String,
        tradeItems: [TradeItems],
        trackingType: String,
        suspectedTraderCanJoinAfter: String,
        joinedAt: String,
        __typename: String
    });

    const schema = mongoose.Schema(
        {
            node: Node
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Item = mongoose.model("roll-item", schema);
    return Item;
}