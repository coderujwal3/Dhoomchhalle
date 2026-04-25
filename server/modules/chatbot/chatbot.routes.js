const express = require("express");
const rateLimit = require("express-rate-limit");
const { body, param } = require("express-validator");
const {
  handleChat,
  handleChatStream,
  handleClearMemory,
  handlePinMessage,
  handleFeedback,
} = require("./chatbot.controller");

const router = express.Router();

const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: {
      code: "CHATBOT_RATE_LIMITED",
      message: "Too many chatbot requests. Please wait a moment and try again.",
    },
  },
});

const chatValidation = [
  body("message")
    .isString()
    .withMessage("message must be text")
    .trim()
    .isLength({ min: 1, max: 1200 })
    .withMessage("message must be between 1 and 1200 characters"),
  body("sessionId")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("sessionId is too long"),
  body("lang")
    .optional()
    .isIn(["auto", "en", "hi"])
    .withMessage("lang must be auto, en, or hi"),
  body("location")
    .optional({ nullable: true })
    .isObject()
    .withMessage("location must be an object"),
  body("location.lat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("location.lat must be a valid latitude"),
  body("location.lon")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("location.lon must be a valid longitude"),
  body("history")
    .optional()
    .isArray({ max: 12 })
    .withMessage("history can include at most 12 messages"),
  body("history.*.role")
    .optional()
    .isIn(["user", "assistant"])
    .withMessage("history role must be user or assistant"),
  body("history.*.content")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("history content is too long"),
];

const feedbackValidation = [
  body("sessionId").optional().isString().trim().isLength({ max: 100 }),
  body("messageId")
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("messageId is required"),
  body("rating")
    .isIn(["up", "down"])
    .withMessage("rating must be up or down"),
  body("correction")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("correction is too long"),
];

router.post("/", chatbotLimiter, chatValidation, handleChat);
router.post("/stream", chatbotLimiter, chatValidation, handleChatStream);
router.post("/feedback", chatbotLimiter, feedbackValidation, handleFeedback);
router.post("/pin", chatbotLimiter, handlePinMessage);
router.delete("/memory", chatbotLimiter, handleClearMemory);
router.delete(
  "/memory/:sessionId",
  chatbotLimiter,
  param("sessionId").isString().trim().isLength({ max: 100 }),
  handleClearMemory
);
router.post("/memory/clear", chatbotLimiter, handleClearMemory);

module.exports = router;
