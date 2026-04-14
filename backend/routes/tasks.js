const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasksController");
const { authMiddleware } = require("../middleware/authMiddleware");

// 日历和统计（必须放在带参数的路由之前）
router.get("/calendar", authMiddleware, tasksController.getMonthCalendar);
router.get("/calendar/month", authMiddleware, tasksController.getMonthCalendar);
router.get("/stats", authMiddleware, tasksController.getStats);

// 任务 CRUD
router.post("/", authMiddleware, tasksController.createTask);
router.get("/", authMiddleware, tasksController.getTasks);
router.get("/:id", authMiddleware, tasksController.getTaskById);
router.put("/:id", authMiddleware, tasksController.updateTask);
router.delete("/:id", authMiddleware, tasksController.deleteTask);
router.post("/:id/complete", authMiddleware, tasksController.completeTask);

module.exports = router;