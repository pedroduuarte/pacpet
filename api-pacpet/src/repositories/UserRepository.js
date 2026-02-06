import User from "../models/User.js";

class UserRepository {

    async findByEmail(email, options = {}) {
        const query = User.findOne({ email });

        if (options.withPassword) {
        query.select("+password");
        }

        return await query;
    }

    async create(data) {
        return await User.create(data);
    }
}

export default new UserRepository();
