const express = require("express");
const router = express.Router();
const socialController = require("../controllers/socialController");
const { authMiddleware } = require("../middleware/authMiddleware");

// P0 好友体系
router.get("/users/search", authMiddleware, socialController.searchUsers);
router.post("/friend-requests/send", authMiddleware, socialController.sendFriendRequest);
router.get("/friend-requests/incoming", authMiddleware, socialController.getIncomingRequests);
router.post("/friend-requests/respond", authMiddleware, socialController.respondFriendRequest);
router.get("/friends", authMiddleware, socialController.getFriends);
router.get("/visibility", authMiddleware, socialController.getVisibility);
router.post("/visibility/set", authMiddleware, socialController.setVisibility);

// P1 学习圈/搭子
router.get("/circles", authMiddleware, socialController.getCircles);
router.post("/circles/join", authMiddleware, socialController.joinCircle);
router.get("/team-posts", authMiddleware, socialController.getTeamPosts);
router.post("/team-posts", authMiddleware, socialController.createTeamPost);

// P2 推荐
router.get("/friends/recommend", authMiddleware, socialController.recommendFriends);

module.exports = router;