const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamification.controller');

// Get full gamification profile
router.get('/profile', gamificationController.getProfile);

// Get user stats
router.get('/stats', gamificationController.getStats);

// Get badges
router.get('/badges', gamificationController.getBadges);

// Get challenges
router.get('/challenges', gamificationController.getChallenges);

// Join a challenge
router.post('/challenges/:challengeId/join', gamificationController.joinChallenge);

// Log activity
router.post('/activity', gamificationController.logActivity);

// Get leaderboard
router.get('/leaderboard', gamificationController.getLeaderboard);

// Get user rank
router.get('/rank', gamificationController.getUserRank);

// Admin routes
router.post('/init-badges', gamificationController.initializeBadges);
router.post('/create-daily-challenges', gamificationController.createDailyChallenges);

module.exports = router;
