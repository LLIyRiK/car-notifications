import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const FiltersSchema = new Schema({
    telegramId: Number,
    manufacture: String,
    model: String,
    yearFrom: Number,
    yearTo: Number,
    odometerState: Number
});

export default mongoose.model('Filters', FiltersSchema)

