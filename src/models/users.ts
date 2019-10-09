import * as mongoose from "mongoose";

const Schema = mongoose.Schema;
//me 577925429
const UsersSchema = new Schema({
    telegramId: Number,
    firstName: String,
    lastName: String,
    isActiveFilter: Boolean,
});

export default mongoose.model('Users', UsersSchema)



