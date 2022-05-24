declare module '*.png' {
    const value: any;
    export = value;
}

declare namespace Mapty {
    export type coords = [number, number]; /* [lat, lng] */

    export interface IApp {
        #map: L.Map | undefined;
        #mapEvent: L.LeafletMouseEvent | undefined;
        #form: JQuery<HTMLElement>;
        #workouts: Array<IWorkout>;
        #inputType: JQuery<HTMLElement>;
        #inputDistance: JQuery<HTMLElement>;
        #inputDuration: JQuery<HTMLElement>;
        #inputCadence: JQuery<HTMLElement>;
        #inputElevation: JQuery<HTMLElement>;
        _getPosition: () => void;
        _loadMap: (position: GeolocationPosition) => void;
        _showForm: (e: L.LeafletMouseEvent) => void;
        _toggleElevationField: () => void;
        _newWorkout: (
            e: JQuery.SubmitEvent<
                HTMLElement,
                undefined,
                HTMLElement,
                HTMLElement
            >
        ) => void;
    }

    export interface IWorkout {
        coords: coords;
        duration: number;
        distance: number;
    }
}
