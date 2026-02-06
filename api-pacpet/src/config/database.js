import mongoose from "mongoose";

class Database {
    constructor() {
        if (!Database.instance) {
            this._connect();
            Database.instance = this;
        }
        return Database.instance;
    }

    _connect() {
        mongoose.connect(process.env.MONGO_URI)
            .then(() => console.log("MongoDB conectado"))
            .catch(err => console.error("Erro MongoDB", err));
    }
}

const instance = new Database();
Object.freeze(instance);

export default instance;