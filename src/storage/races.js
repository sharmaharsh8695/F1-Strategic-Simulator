let races = new Map();

const TYRE_TYOES={
    SOFT : "SOFT",
    MEDIUM : "MEDIUM",
    HARD : "HARD",
    INTERMEDIATE : "INTERMEDIATE",

}

const RACESTATUS = {
    PAUSEDD : "PAUSED",
    FINISHED : "FINISHED",
    NOTSTARTED : "NOTSTARTED",

}

const cars = ["Ferrari","Mclaren","Mercedes","Cadillac","RedBull"];

const MODES = {
    AGGRESIVE : "AGGRESIVE",
    NORMAL : "NORMAL",
    CONSERVE : "CONSERVE",
}

const Tracks = {
    track1:{
        id: "track1",
        name: "Austraia",
        BaseLapTime : 70
    },
    track2:{
        id: "track2",
        name: "Monaco",
        BaseLapTime : 80
    }
}

module.exports = {
    races,
    MODES,
    TYRE_TYOES,
    Tracks,
    RACESTATUS,
    cars,

};
