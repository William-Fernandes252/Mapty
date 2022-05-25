import { v4 as uuidv4 } from 'uuid';

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

abstract class Workout implements Mapty.IWorkout {
    abstract _type: string;
    _id: string = uuidv4();
    _date: Date = new Date();
    _coords: Mapty.coords;
    _distance: number;
    _duration: number;

    constructor(coords: Mapty.coords, distance: number, duration: number) {
        this._coords = coords;
        this._distance = distance; // in km
        this._duration = duration; // in min
    }

    get coords(): Mapty.coords {
        return this._coords;
    }
    get distance(): number {
        return this._distance;
    }
    get duration(): number {
        return this._duration;
    }
    get type(): string {
        return this._type;
    }
    get id(): string {
        return this._id;
    }
    get date(): Date {
        return this._date;
    }
}

export class Running extends Workout implements Mapty.IWorkout {
    _type: string = 'running';
    _cadence: number;
    _pace: number;

    constructor(
        coords: Mapty.coords,
        distance: number,
        duration: number,
        cadence: number
    ) {
        super(coords, distance, duration);
        this._cadence = cadence;
        this._pace = this._duration / this._distance;
    }

    get cadence(): number {
        return this._cadence;
    }
    get pace(): number {
        // min/km
        return this._pace;
    }
}

export class Cycling extends Workout implements Mapty.IWorkout {
    _type: string = 'cycling';
    _elevationGain: number;
    _speed: number;

    constructor(
        coords: Mapty.coords,
        distance: number,
        duration: number,
        elevationGain: number
    ) {
        super(coords, distance, duration);
        this._elevationGain = elevationGain;
        this._speed = this._distance / this._duration / 60;
    }

    get elevationGain(): number {
        return this._elevationGain;
    }
    get speed(): number {
        // km/h
        return this._speed;
    }
}
