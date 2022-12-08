module.exports = mongoose => {
    const schema = mongoose.Schema(
        {
            id: String,
            marketName: String,
            imageUrl: String,
            rollTotalPrice: Number,
            rollBasePrice: Number,
            rollMarkup: Number,
            buffPrice: Number,
            isUnderpriced: Boolean,
            underpricedPerc: Number,
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Underpriced = mongoose.model("underpriced-item", schema);
    return Underpriced;
}