import Users from "../models/users";
import Server from "../server";

export const getActiveUsers = () : Promise<any[]> => {
    return new Promise((resolve,rejects) => {
        Users.find({isActiveFilter: true}, (err, u: any[]) => {
            if (err) {
                rejects(err);
            } else {
                resolve(u);
            }
        });
    });
};



export const notifiUser = (cars, telegramId) => {
    return new Promise((resolve,rejects) => {
        cars.forEach((car) => {
            Server.bot.sendMessage(telegramId, `[${car.title}](${car.advertisementLink})`, "Markdown");
            resolve();
        })
    });
};






