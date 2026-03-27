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
                tyreAge : 0,

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
            userCarState.tyreAge = 0;
            userCarState.pitCount++;
            userCarState.totalTime+=getRandomIntInclusive(13,17);
            userCarState.energy+=getRandomIntInclusive(10,15);
            if(userCarState.energy>100)userCarState.energy=100;
             
            console.log("command operated");
        }
        if(commands.mode){//user car action mode
            userCarState.mode = commands.mode;
        }
        
        cars.forEach((carId)=>{// tyrewear foreach car
            const car = raceState.carStates[carId];
            
            car.tyreAge++;
            car.tyreWear += getRandomIntInclusive(8,16);
            const ed =   
            car.energy-=getRandomIntInclusive
            if(car.tyreWear>100)car.tyreWear=100;
        })
        
        const trackId = raceData.race.trackId;
        console.log(trackId);
        console.log(Tracks[trackId]);
        const baseLapTime = Tracks[trackId].baseLapTime;
        cars.forEach((carId)=>{
            let lapTime = baseLapTime;
            const carState = raceState.carStates[carId];

            if(carState.tyre == TYRE_TYRES.SOFT)lapTime *=(getRandomIntInclusive(94,98)/100);
            if(carState.tyre == TYRE_TYRES.HARD)lapTime *=(getRandomIntInclusive(103,107)/100);

            lapTime += carState.tyreWear * getRandomIntInclusive(3,7)/100;

            const modeTime = getRandomIntInclusive(95,105)/100;
            lapTime += carState.mode == MODES.AGGRESIVE ? (-1*(modeTime)) : (carState.mode == MODES.CONSERVE ? modeTime : 0);
            

            const randomness = getRandomIntInclusive(90, 110) /100 ;
            lapTime *= randomness;
            carState.lastLapTime = lapTime;
            carState.totalTime += lapTime;
            carState.tyreAge+=1;
            
        })

        raceState.currentLap++;//increasae lap

        const carArr = Object.values(raceState.carStates);
        raceState.positions = carArr.sort((a,b)=>{
            return (a.totalTime - b.totalTime);
        })
        .map((car)=>car.carID);
        
        cars.forEach((carId)=>{
            const car = raceState.carStates[carId];
            if(carId != userCar){
                if(car.tyreAge >= 4){
                    automatedCar(car);
                }
                if(car.tyreAge == 6){
                    pitCar(car);
                }
                if(car.tyreWear>75){
                    pitCar(car);
                }

                const md = getRandomIntInclusive(1,4);
                car.mode = (car.energy < 40) ? (md<3 ? MODES.CONSERVE : MODES.NORMAL) : (md>1 ? MODES.AGGRESIVE : (md<4 ? MODES.CONSERVE : MODES.NORMAL));
            }
        });
          
        return raceState;

    } catch (error) {
        throw error;
    }
}

function automatedCar(car){
    const decider = (getRandomIntInclusive(1,10)%2==0);
    
    if(decider){
        pitCar(car);
    }
}

function pitCar(car){
    car.tyreAge = 0;
    car.tyreWear = 0;
    const td = getRandomIntInclusive(1,9);
    car.tyre = td <= 4 ? TYRE_TYRES.SOFT : (td > 7 ? TYRE_TYRES.HARD : TYRE_TYRES.MEDIUM);    
    car.pitCount++;
    car.totalTime+=getRandomIntInclusive(13,17);
    car.energy+=getRandomIntInclusive(10,15);
    if(car.energy>100)car.energy=100;

}

function getRandomIntInclusive(min, max) {
  // Use Math.ceil to ensure the min is handled correctly even if a float is passed
  min = Math.ceil(min); 
  max = Math.floor(max); 
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}


module.exports={
    createRace,
    runLap
}