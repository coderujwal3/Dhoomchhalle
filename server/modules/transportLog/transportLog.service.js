const transportLogModel = require("./transportLog.model");

async function createTransportLog(logData) {
    try {
        const log = await transportLogModel.create(logData);
        return log;
    } catch (error) {
        throw new Error(`Error creating transport log: ${error.message}`);
    }
}

async function getUserTransportLogs(userId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const logs = await transportLogModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await transportLogModel.countDocuments({ userId });

        return {
            logs,
            pagination: { total, page, pages: Math.ceil(total / limit) },
        };
    } catch (error) {
        throw new Error(`Error fetching user transport logs: ${error.message}`);
    }
}

async function getLogById(logId) {
    try {
        const log = await transportLogModel.findById(logId);
        return log;
    } catch (error) {
        throw new Error(`Error fetching log: ${error.message}`);
    }
}

async function updateTransportLog(logId, updateData) {
    try {
        const log = await transportLogModel.findByIdAndUpdate(logId, {updateData: {$eq: updateData}}, {
            new: true,
            runValidators: true,
        });

        if (!log) throw new Error("Transport log not found");
        return log;
    } catch (error) {
        throw new Error(`Error updating log: ${error.message}`);
    }
}

async function deleteTransportLog(logId) {
    try {
        const result = await transportLogModel.findByIdAndDelete(logId);
        if (!result) throw new Error("Transport log not found");
        return result;
    } catch (error) {
        throw new Error(`Error deleting log: ${error.message}`);
    }
}

module.exports = {
    createTransportLog,
    getUserTransportLogs,
    getLogById,
    updateTransportLog,
    deleteTransportLog,
};
