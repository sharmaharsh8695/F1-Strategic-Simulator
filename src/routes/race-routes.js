const express = require("express");
const raceController = require("../controllers/race-cotroller");

const router = express.Router();

router.post('/start',raceController.createRace);
router.post('/:id/runlap',raceController.runLap);

module.exports=router;