const transportLogService = require("./transportLog.service");
const { responseFormatter } = require("../../utils/responseFormatter");

async function createTransportLogController(req, res) {
    try {
        const { transportType, fromLocation, toLocation, fare, journeyDate, notes } = req.body;
        const userId = req.user._id;

        const logData = {
            userId,
            transportType,
            fromLocation,
            toLocation,
            fare,
            journeyDate,
            notes,
        };

        const log = await transportLogService.createTransportLog(logData);
        return res.status(201).json(responseFormatter(true, "Transport log created", log, 201));
    } catch (error) {
        console.error("Error creating transport log:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

async function getMyLogsController(req, res) {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await transportLogService.getUserTransportLogs(userId, page, limit);
        return res.status(200).json(responseFormatter(true, "Transport logs fetched", result, 200));
    } catch (error) {
        console.error("Error fetching logs:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

async function updateLogController(req, res) {
    try {
        const { logId } = req.params;
        const userId = req.user._id;
        const updateData = req.body;

        const log = await transportLogService.getLogById(logId);
        if (!log) {
            return res.status(404).json(responseFormatter(false, "Log not found", null, 404));
        }

        if (log.userId.toString() !== userId.toString()) {
            return res.status(403).json(responseFormatter(false, "Not authorized", null, 403));
        }

        delete updateData.userId;
        const updatedLog = await transportLogService.updateTransportLog(logId, updateData);
        return res.status(200).json(responseFormatter(true, "Log updated", updatedLog, 200));
    } catch (error) {
        console.error("Error updating log:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

async function deleteLogController(req, res) {
    try {
        const { logId } = req.params;
        const userId = req.user._id;

        const log = await transportLogService.getLogById(logId);
        if (!log) {
            return res.status(404).json(responseFormatter(false, "Log not found", null, 404));
        }

        if (log.userId.toString() !== userId.toString()) {
            return res.status(403).json(responseFormatter(false, "Not authorized", null, 403));
        }

        await transportLogService.deleteTransportLog(logId);
        return res.status(200).json(responseFormatter(true, "Log deleted", null, 200));
    } catch (error) {
        console.error("Error deleting log:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

module.exports = {
    createTransportLogController,
    getMyLogsController,
    updateLogController,
    deleteLogController,
};
