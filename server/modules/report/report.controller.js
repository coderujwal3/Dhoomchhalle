const reportService = require("./report.service");
const { responseFormatter } = require("../../utils/responseFormatter");

async function createReportController(req, res) {
    try {
        const { entityType, entityId, category, description } = req.body;
        const userId = req.user._id;

        const reportData = {
            userId,
            entityType,
            entityId,
            category,
            description,
        };

        const report = await reportService.createReport(reportData);
        return res.status(201).json(responseFormatter(true, "Report submitted successfully", report, 201));
    } catch (error) {
        console.error("Error creating report:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

async function getMyReportsController(req, res) {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await reportService.getUserReports(userId, page, limit);
        return res.status(200).json(responseFormatter(true, "User reports fetched", result, 200));
    } catch (error) {
        console.error("Error fetching user reports:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

async function getAllReportsController(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json(responseFormatter(false, "Not authorized", null, 403));
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await reportService.getAllReports(page, limit);
        return res.status(200).json(responseFormatter(true, "All reports fetched", result, 200));
    } catch (error) {
        console.error("Error fetching reports:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

async function updateReportStatusController(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json(responseFormatter(false, "Not authorized", null, 403));
        }

        const { reportId } = req.params;
        const { status, adminNotes } = req.body;

        const report = await reportService.updateReportStatus(reportId, status, adminNotes, req.user._id);
        return res.status(200).json(responseFormatter(true, "Report updated successfully", report, 200));
    } catch (error) {
        console.error("Error updating report:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

module.exports = {
    createReportController,
    getMyReportsController,
    getAllReportsController,
    updateReportStatusController,
};
