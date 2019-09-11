import * as Hapi from '@hapi/hapi';
import * as Inert from '@hapi/inert';
import * as Mongoose from "mongoose";
import {loadOnlinerCars} from "./services/cars.service";
import {Connection} from "mongoose";

const telegramToken = "911768197:AAEfAPonKJgqXQgHkEmuScn8wYF6EewFqoc"; // Use this token to access the HTTP API https://core.telegram.org/bots/api

// https://github.com/yagop/node-telegram-bot-api/blob/master/examples/webhook/heroku.js


export default class Server {
    private static app: Hapi.Server;
    public static db: Mongoose.Connection;

    static  async start() {
        Server.app =  Hapi.server({
            host: process.env.HOST || '0.0.0.0',
            port: process.env.PORT || 4000
        });

        await Server.app.register(Inert);

        await Mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/advertisementsCars', { useNewUrlParser: true });
        Server.db = Mongoose.connection;
        Server.db.on('error', (err) => console.error('connection error:', err));
        Server.db.once('open', () => {
            console.log('Connection with database succeeded.');
        });

        Server.app.route({
            method: 'GET',
            path: '/',
            handler: {
                file: './web/dist/index.html'
            }
        });



        Server.app.start().then(() => {
            console.log(`Server running at: ${Server.app.info.uri}`);
            loadOnlinerCars();
            setInterval(loadOnlinerCars, 3 * 60 * 1000)
        });


    }
}
