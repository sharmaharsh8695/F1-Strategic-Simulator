const express = require("express");
const raceRoutes = require("./race-routes");

const router = express.Router();

router.use('/race',raceRoutes);

module.exports = router;