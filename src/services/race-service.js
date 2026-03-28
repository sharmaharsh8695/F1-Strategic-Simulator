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
            events : {},
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

        const eventLap = getRandomIntInclusive(1,race.totalLaps-2);
        const eventLength = getRandomIntInclusive(1,2);

        const eventProb = getRandomIntInclusive(1,100);
        if(eventProb<5)raceState.events={
            eventLap,
            eventLength : 1,
            currEventLap : 0,
            eventType : "Crash",
            done : false,

        };
        if(eventProb > 96){
            raceState.events={
            eventLap,
            eventLength,
            currEventLap : 0,
            eventType : "Rain",
            done : false,

        };
        }

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

        // POST LAP EFFECTS        
        cars.forEach((carId)=>{// tyrewear foreach car
            const car = raceState.carStates[carId];
            
            car.tyreAge++;
            car.tyreWear += getRandomIntInclusive(8,16);
            const ed = car.mode == MODES.AGGRESIVE ? 95 : (car.mode == MODES.CONSERVE ? 107 : 99);
            car.energy-=getRandomIntInclusive(9,15);
            car.energy *= ed/100;
            if(car.energy < 0){
                car.energy = 0
            }
            if(car.tyreWear>100)car.tyreWear=100;
        })
        
        //USER CAR
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
            if(userCarState.energy<20 && userCarState.mode==MODES.AGGRESIVE)userCarState.mode = MODES.NORMAL;
        }

        //NEXT_LAP PREPARATION
        const event = raceState.events;
       

        // AUTOMATED CAR
        cars.forEach((carId)=>{
            const car = raceState.carStates[carId];
            if(carId != userCar){
                if(car.tyreAge >= 4){
                    automatedCar(car);
                }
                if(car.tyreAge == 6){
                    pitCar(car,false);
                }
                if(car.tyreWear>75){
                    pitCar(car,false);
                }
                if(event && !(event.done) && event.eventType=="Rain" && car.tyre != TYRE_TYRES.INTERMEDIATE ){
                    pitCar(car,true);
                }

                const md = getRandomIntInclusive(1,4);
                car.mode = (car.energy < 30) ? (md<3 ? MODES.CONSERVE : MODES.NORMAL) : (md>1 ? MODES.AGGRESIVE : (md<4 ? MODES.CONSERVE : MODES.NORMAL));
            }
        });

        let crashed = false;
        if(event){
            if(event.eventLap === raceState.currentLap || event.eventLength > event.currEventLap){
                if(event.eventType == "Rain"){
                    const willCrash = (getRandomIntInclusive(1,100)<9);
                    if(willCrash){
                        crash(raceState);
                        crashed = true;

                    }
                }
                if(event.eventType == "Crash"){
                    crash(raceState);
                    crashed = true;
                }
                event.currEventLap++;
                if(event.currEventLap == event.eventLength)event.done=true
            }
        }
          

        //LAPTIME 
        const trackId = raceData.race.trackId;
        console.log(trackId);
        console.log(Tracks[trackId]);
        const baseLapTime = Tracks[trackId].baseLapTime;
        cars.forEach((carId)=>{
            let lapTime = baseLapTime;
            const carState = raceState.carStates[carId];
            
            if(!crashed){
                if(!event){
                    if(carState.tyre == TYRE_TYRES.SOFT)lapTime *=(getRandomIntInclusive(94,98)/100);
                    if(carState.tyre == TYRE_TYRES.HARD)lapTime *=(getRandomIntInclusive(103,107)/100);
                    if(carState.tyre == TYRE_TYRES.INTERMEDIATE)lapTime *=(getRandomIntInclusive(110,115)/100);
                }
                else{
                    if(carState.tyre == TYRE_TYRES.SOFT)lapTime *=(getRandomIntInclusive(103,106)/100);
                    if(carState.tyre == TYRE_TYRES.HARD)lapTime *=(getRandomIntInclusive(107,113)/100);
                    if(carState.tyre == TYRE_TYRES.INTERMEDIATE)lapTime *=(getRandomIntInclusive(102,108)/100);
                }

                lapTime += carState.tyreWear * getRandomIntInclusive(3,7)/100;

                const modeTime = getRandomIntInclusive(95,105)/100;
                lapTime += carState.mode == MODES.AGGRESIVE ? (-1*(modeTime)) : (carState.mode == MODES.CONSERVE ? modeTime : 0);
            
            }
            else{
                lapTime += getRandomIntInclusive(15,25);
                lapTime += carState.tyreWear * getRandomIntInclusive(3,7)/100;
            }

            const randomness = getRandomIntInclusive(90, 110) /100 ;
            lapTime *= randomness;
            carState.lastLapTime = lapTime;
            carState.totalTime += lapTime;
            
        })
        //POST LAP EFFECT
        raceState.currentLap++;//increasae lap
        
        // SETTING LEADER-BOARD
        const carArr = Object.values(raceState.carStates);
        raceState.positions = carArr.sort((a,b)=>{
            return (a.totalTime - b.totalTime);
        })
        .map((car)=>car.carID);
        
        return raceState;

    } catch (error) {
        throw error;
    }
}

function crash(raceState){
    const carState=raceState.carStates;
    let crashingCar = null;
    cars.forEach((carId)=>{
        const car=raceState.carStates[carId];
        let tyreparam = 20;
        if(car.tyre == TYRE_TYRES.MEDIUM)tyreparam=15;
        if(car.tyre == TYRE_TYRES.HARD)tyreparam=10;
        if(car.tyre == TYRE_TYRES.INTERMEDIATE)tyreparam=5;
        let modeparam = 20;
        if(car.mode==MODES.NORMAL)modeparam=10;
        if(car.mode==MODES.CONSERVE)modeparam=3;
        const param = tyreparam + modeparam;
        if(!crashingCar){
            crashingCar={
                carId,
                param : param,
            }
        }
        else{
            if(crashingCar.param < param){
                crashingCar.carId=carId;
                crashingCar.param=param;
            }
        }
    });
    const car = carState[crashingCar.carId];
    car.energy -= getRandomIntInclusive(18,23);
    car.totalTime += getRandomIntInclusive(13,25);
    car.tyreWear += getRandomIntInclusive(15,23);
    car.mode = MODES.CONSERVE;
    car.tyreAge++;
}

function automatedCar(car){
    const decider = (getRandomIntInclusive(1,10)%2==0);
    
    if(decider){
        pitCar(car);
    }
}

function pitCar(car,ifRain){
    car.tyreAge = 0;
    car.tyreWear = 0;
    const td = getRandomIntInclusive(1,9);
    car.tyre = td <= 4 ? TYRE_TYRES.SOFT : (td > 7 ? TYRE_TYRES.HARD : TYRE_TYRES.MEDIUM);    
    if(ifRain){
        car.tyre = TYRE_TYRES.INTERMEDIATE;
    }
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