const {TYRE_TYRES,races,Tracks,MODES,RACESTATUS,cars} = require("../storage/races")


function createRace(input){
    try {
        
        console.log("reached services");
        const raceId = Date.now().toString();

        const race ={
            id : raceId,
            trackId : input.trackId,
            teamId : input.teamId,
            carId : input.teamId,
            totalLaps : 10,
            raceStatus : "PAUSED",
        };

        const raceState = {
            currentLap : 0,
            carStates : {},
            positions : [],
            events : [],
            pitStops : [],
            
        }

        cars.forEach((carId)=>{
            raceState.carStates[carId]={
                carID : carId,
                tyre : input.startingTyre || TYRE_TYRES.MEDIUM,
                tyreWear : 0,
                totalTime : 0,
                lastLapTime : 0,
                pitCount : 0,
                energy : 100,
                mode : MODES.NORMAL,

            };
            raceState.positions.push(carId);
        });

        races.set(raceId,{
            race,
            raceState,

        });

        return {
            raceId,
            race,
            raceState
        };
    } catch (error) {``
        
    }
}

function runLap(commands, raceId){
    try {
        console.log("inside service")
        console.log(raceId);
        const raceData = races.get(raceId);
        const raceState = raceData.raceState;
        const userCar = raceData.race.carId;
        const userCarState = raceState.carStates[userCar];

        if(commands.tyre){//user car action tyre
            userCarState.tyre = commands.tyre;
            userCarState.tyreWear = 0;
            userCarState.pitCount++;
            userCarState.totalTime+=20;
            userCarState.energy+=10;
            if(userCarState.energy>100)userCarState.energy=100;
             
            console.log("command operated");
        }
        if(commands.mode){//user car action mode
            userCarState.mode = commands.mode;
        }
        
        cars.forEach((carId)=>{// tyrewear foreach car
            const car = raceState.carStates[carId];
            
            car.tyreWear += 10;
            if(car.tyreWear>100)car.tyreWear=100;
        })
        
        const trackId = raceData.race.trackId;
        console.log(trackId);
        console.log(Tracks[trackId]);
        const baseLapTime = Tracks[trackId].baseLapTime;
        cars.forEach((carId)=>{
            let lapTime = baseLapTime;
            const carState = raceState.carStates[carId];

            if(carState.tyre == TYRE_TYRES.SOFT)lapTime *=0.97;
            if(carState.tyre == TYRE_TYRES.HARD)lapTime *=1.03;

            lapTime += carState.tyreWear * 0.05;

            lapTime += carState.mode == MODES.AGGRESIVE ? -1 : (carState.mode == MODES.CONSERVE ? 1 : 0);
            
            const randomness = getRandomIntInclusive(90, 110) /100 ;
            lapTime *= randomness;
            carState.lastLapTime = lapTime;
            carState.totalTime += lapTime;
            
        })

        raceState.currentLap++;//increasae lap

        const carArr = Object.values(raceState.carStates);
        raceState.positions = carArr.sort((a,b)=>{
            return (a.totalTime - b.totalTime);
            }).map((car)=>car.carID);
        

        return raceState;

    } catch (error) {
        throw error;
    }
}

function getRandomIntInclusive(min, max) {
  // Use Math.ceil to ensure the min is handled correctly even if a float is passed
  min = Math.ceil(min); 
  // Use Math.floor to ensure the max is handled correctly even if a float is passed
  max = Math.floor(max); 
  // The core formula: scales Math.random() to the desired range size (+1 to be inclusive) and shifts it by the min value.
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}


module.exports={
    createRace,
    runLap
}