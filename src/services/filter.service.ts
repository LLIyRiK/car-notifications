import * as request from "request";
import Filter from "../models/filters";
import Cars from "../models/cars";
import {rejects} from "assert";


export const addNew = (filter) => {
    return new Promise((resolve,rejects) => {
        new Filter(filter).save((err, f: any) => {
            if (err) {
                rejects(err);
            } else {
                console.log("inserted filter: ", f);
                resolve(f);
            }
        });
    });
};

export const deleteFilter = (filterId) => {
    return new Promise((resolve,rejects) => {
        Filter.findByIdAndDelete(filterId, (err, f) => {
            if (err) {
                rejects(err);
            } else {
                console.log("filter deleted ");
                resolve();
            }
        });
    });

};
export const getUserFilters = (telegramId) => {
    return new Promise((resolve,rejects) => {
        Filter.find({telegramId}, (err, f) => {
            if (err) {
                rejects(err);
            } else {
                resolve(f);
            }
        });
    });

};

export const getFilterCars = (filters) => {
    return new Promise((resolve,rejects) => {
        let carIds = [23123,34234,456356];

        filters = filters.map((f: any) => {
            return {
                $and: {
                    manufacturerName: f.manufacture,
                    model: f.model,
                    year: {$gte: (f.yearFrom || null), $lte: (f.yearTo || null)},
                    odometerState: f.odometerState
                }
            }
        });

        let filter = {
            $and: [
                {$not: {$in: carIds}},
                {$or: filters}
            ]
        };

        Cars.find(filter, (err, f: any) => {
            if (err) {
                rejects(err);
            } else {
                resolve(f);
            }
        });
    });
};




