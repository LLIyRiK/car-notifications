import * as request from "request";
import Cars, {onlinerMapper} from "../models/cars";

export const loadOnlinerCars = (pageNumber = 1) => {

    return new Promise((resolve) => {
        console.log("pageNumber", pageNumber);
        request.post({
            url: 'https://ab.onliner.by/search', form: {
                page: pageNumber,
                "sort[]": "creation_date"
            }
        }, (err, httpResponse, body) => {
            if (!err) {
                const advertisements = (JSON.parse(body).result || {}).advertisements || {};
                const newAdv = Object.keys(advertisements)
                    .filter((key) => advertisements[key].creationDate.date == advertisements[key].lastTimeUp.date)
                    .map((key) => onlinerMapper(advertisements[key]));

                let d = new Date();
                d.setDate(d.getDate() - 3);
                console.log("current date: ", d);
                // @ts-ignore
                console.log("last of cars date: ", new Date((newAdv[newAdv.length - 1] || {}).creationDate));

                let continueFetch = newAdv.every((ad: any) => new Date(ad.creationDate) > d);
                console.log("init continueFetch ", continueFetch);
                let carsPromise = newAdv.map( (adv: any) => {
                    return new Promise((resol) => {
                        Cars.findOne({carId: adv.carId}, (err, car: any) => {
                            let findCar = (car || {});
                            console.log("find car", findCar ? findCar.carId + " " + adv.creationDate + " " + adv.lastTimeUp : findCar);
                            if (!car) {
                                new Cars(adv).save((err, c: any) => {
                                    console.log("inserted car: ", c.carId);
                                    resol();
                                });
                            } else  {
                                continueFetch = false;
                                resol();

                            }
                        });
                    });
                });

                Promise.all(carsPromise).then((values) => {
                    console.log("continueFetch", continueFetch);
                    if (continueFetch) {
                        loadOnlinerCars(pageNumber + 1).then(resolve);
                    } else{
                        resolve();
                    }
                });

            } else {
                console.log("error", err);
                resolve();
            }

        });
    });
};

export const carsByFiltres = (filters): Promise<any[]> => {
    return new Promise((resolve,rejects) => {

        filters = filters.map((f: any) => {
            return {
                $and: {
                    manufacturerName: f.manufacture,
                    model: f.model,
                    year: {$gte: (f.yearFrom || null), $lte: (f.yearTo || null)},
                    odometerState: f.odometerState,
                    isShown: false
                }
            }
        });

        Cars.find({$or: filters}, (err, f: any) => {
            if (err) {
                rejects(err);
            } else {
                resolve(f);
            }
        });
    });
};

export const markAsShown = (carIds): Promise<any[]> => {
    return new Promise((resolve,rejects) => {

        Cars.updateMany({carId: {$in: carIds}}, {isShown: true},(err, f: any) => {
            if (err) {
                rejects(err);
            } else {
                resolve(f);
            }
        });
    });
};





