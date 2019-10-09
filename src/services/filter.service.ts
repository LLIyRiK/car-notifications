import Filter from "../models/filters";


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
                resolve(f);
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






