const raceService = require("../services/race-service");

function createRace(req,res){
    try {
        console.log("reached controller");
        const obj = { 
            startingTyre : req.body.startingTyre,
            trackId : req.body.trackId,
            teamId : req.body.teamId,
        }
        const raceId = raceService.createRace(obj);
        res.json(raceId);
    } catch (error) {
        
    }
}

function runLap(req,res){
    try {
        console.log("inside controller")
        const raceState = raceService.runLap({
            tyre : req.body.tyre,
            mode : req.body.mode,

        },req.params.id);

        res.json(raceState);
    } catch (error) {
          console.log(error);
          res.json("error found");
    }
}

module.exports = {
    createRace,
    runLap,

}