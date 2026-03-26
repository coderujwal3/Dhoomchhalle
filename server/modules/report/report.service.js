const reportModel = require("./report.model");

async function createReport(reportData) {
    try {
        const report = await reportModel.create(reportData);
        return await report.populate("userId", "name email");
    } catch (error) {
        throw new Error(`Error creating report: ${error.message}`);
    }
}

async function getUserReports(userId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const reports = await reportModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await reportModel.countDocuments({ userId });

        return {
            reports,
            pagination: { total, page, pages: Math.ceil(total / limit) },
        };
    } catch (error) {
        throw new Error(`Error fetching user reports: ${error.message}`);
    }
}

async function getReportById(reportId) {
    try {
        const report = await reportModel
            .findById(reportId)
            .populate("userId", "name email")
            .populate("resolvedBy", "name email");
        return report;
    } catch (error) {
        throw new Error(`Error fetching report: ${error.message}`);
    }
}

async function getAllReports(page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const reports = await reportModel
            .find()
            .populate("userId", "name email")
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await reportModel.countDocuments();

        return {
            reports,
            pagination: { total, page, pages: Math.ceil(total / limit) },
        };
    } catch (error) {
        throw new Error(`Error fetching reports: ${error.message}`);
    }
}

async function updateReportStatus(reportId, status, adminNotes, resolvedBy) {
    try {
        const updateData = {
            status,
            adminNotes,
            ...(status === "resolved" && {
                resolvedAt: new Date(),
                resolvedBy,
            }),
        };

        const report = await reportModel.findByIdAndUpdate(reportId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!report) throw new Error("Report not found");
        return report;
    } catch (error) {
        throw new Error(`Error updating report: ${error.message}`);
    }
}

module.exports = {
    createReport,
    getUserReports,
    getReportById,
    getAllReports,
    updateReportStatus,
};
