import Feeding from "../models/Feeding.js"

class FeedingRepository {
    async create(data) {
        return await Feeding.create(data);
    }

    async findAll() {
        return await Feeding.find().sort({ createdAt: -1 });
    }

    async findByCommandId(commandId) {
        return await Feeding.findOne({ commandId });
    }

    async deleteById(id) {
        return await Feeding.findByIdAndDelete(id);
    }

    async updatedByCommandId(commandId, data) {
        return Feeding.findOneAndUpdate(
            { commandId },
            data,
            { new: true }
        );
    }
}

export default new FeedingRepository();