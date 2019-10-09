import * as Hapi from '@hapi/hapi';
import * as Joi from '@hapi/joi';
import * as Inert from '@hapi/inert';
import * as Mongoose from "mongoose";
import * as TelegramBot from "node-telegram-bot-api";
import {carsByFiltres, loadOnlinerCars, markAsShown} from "./services/cars.service";
import {getActiveUsers, notifiUser} from "./services/user.service";
import {addNew, deleteFilter, getUserFilters} from "./services/filter.service";

// https://github.com/yagop/node-telegram-bot-api/blob/master/examples/webhook/heroku.js
const TOKEN = process.env.TELEGRAM_TOKEN ;


export default class Server {
    private static app: Hapi.Server;
    public static db: Mongoose.Connection;
    public static bot: any;

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

        Server.app.route({
            method: 'GET',
            path: '/filters/{telegramId*}',
            config: {
                validate: {
                    params: {
                        telegramId: Joi.number().required()
                    }
                },
                handler: async (request, reply) => {
                    const filters = await getUserFilters(request.params.telegramId);
                    return reply(filters);
                }
            }
        });

        Server.app.route({
            method: 'POST',
            path: '/filters',
            config: {
                validate: {
                    payload: {
                        telegramId: Joi.number().required(),
                        manufacture: Joi.string().required(),
                        model: Joi.string().required(),
                        yearFrom: Joi.number().optional(),
                        yearTo: Joi.number().optional(),
                        odometerState: Joi.number().optional()
                    }
                },
                handler: async (request, reply) => {
                    const filter = await addNew(request.payload);
                    return reply(filter);
                }
            }
        });

        Server.app.route({
            method: 'DELETE',
            path: '/filters/{id*}',
            config: {
                validate: {
                    params: {
                        id: Joi.number().required()
                    }
                },
                handler: async (request, reply) => {
                    const resp = await deleteFilter(request.params.id);
                    return reply(resp);
                }
            }
        });


        Server.app.start().then(() => {
            console.log(`Server running at: ${Server.app.info.uri}`);
            loadOnlinerCars();
            setInterval(loadOnlinerCars, 3 * 60 * 1000);

            setInterval(async () => {
                let newNotifierCars = new Set();
                const users = await getActiveUsers();
                users.forEach(async (user) => {
                    const filters = await getUserFilters(user.telegramId);
                    const cars = await carsByFiltres(filters);
                    await notifiUser(cars, user.telegramId);
                    cars.forEach(car => newNotifierCars.add(car.id))
                });

                markAsShown(Array.from(newNotifierCars));
            }, 60 * 1000);
        });

        const options = {
            webHook: {
                // Port to which you should bind is assigned to $PORT variable
                // See: https://devcenter.heroku.com/articles/dynos#local-environment-variables
                port: process.env.PORT
            }
        };

        const url = process.env.APP_URL || 'https://car-notification.herokuapp.com/';
        Server.bot = new TelegramBot(TOKEN, options);


        // This informs the Telegram servers of the new webhook.
        // Note: we do not need to pass in the cert, as it already provided
        Server.bot.setWebHook(`${url}/bot${TOKEN}`);


        // Just to ping!
        Server.bot.on('message', function onMessage(msg) {
            console.log(msg);
            Server.bot.sendMessage(msg.chat.id, 'I am alive on Heroku!');
        });



    }
}
