import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const CarsSchema = new Schema({
    carId: Number,
    manufacturerName: String,
    model: String,
    engineCapacity: Number,
    odometerState: Number,
    year: Number,
    price: Number,
    creationDate: Date,
    lastTimeUp: Date,
    title: String,
    domain: String,
    advertisementLink: String,
    isShown: { type: Boolean, default: false }
});

export default mongoose.model('Cars', CarsSchema)

export const onlinerMapper = (adv) => {
    return {
        carId: adv.id,
        manufacturerName: adv.car.manufacturerName,
        model: adv.car.name,
        engineCapacity: adv.car.engineCapacity,
        odometerState: adv.car.odometerState,
        year: adv.car.year,
        price: parseInt(adv.price.usd) || 0,
        creationDate: adv.creationDate.date.replace(" ", "Z"),
        lastTimeUp: adv.lastTimeUp.date.replace(" ", "Z"),
        title: adv.title,
        domain: "https://ab.onliner.by/",
        advertisementLink: "https://ab.onliner.by/car/" + adv.id
    }
};
