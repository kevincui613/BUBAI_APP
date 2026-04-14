const express = require("express");
const router = express.Router();
const goalsController = require("../controllers/goalsController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, goalsController.createGoal);
router.get("/", authMiddleware, goalsController.getGoals);
router.get("/:id", authMiddleware, goalsController.getGoalById);

module.exports = router;