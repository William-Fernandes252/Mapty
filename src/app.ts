import icon from './assets/img/icon.png';
import logo from './assets/img/logo.png';
import * as models from './models';
import L from 'leaflet';
import $ from 'jquery';

export default class App implements Mapty.IApp {
    #map: L.Map | undefined;
    #mapEvent: L.LeafletMouseEvent | undefined;
    #workouts: Array<Mapty.IWorkout> = [];
    #workoutsConteiner: JQuery<HTMLUListElement> = $('ul.workouts');
    #form: JQuery<HTMLElement> = $('.form');
    #inputType: JQuery<HTMLElement> = $('#workout-type');
    #inputDistance: JQuery<HTMLElement> = $('#workout-distance');
    #inputDuration: JQuery<HTMLElement> = $('#workout-duration');
    #inputCadence: JQuery<HTMLElement> = $('#workout-cadence');
    #inputElevation: JQuery<HTMLElement> = $('#workout-elevation');

    constructor() {
        this._getPosition();
        this.#form.on({
            submit: this._newWorkout.bind(this),
        });
        this.#inputType.on({
            change: this._toggleElevationField.bind(this),
        });
    }

    _getPosition() {
        if (!navigator.geolocation) {
            alert('Your navigator does not support Mapty yet.');
            return;
        }

        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
            alert('Could not get current position.')
        );
    }

    _loadMap(position: GeolocationPosition) {
        const { latitude, longitude } = position.coords;
        this.#map = L.map('map').setView([latitude, longitude], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);

        this.#map.on({
            click: this._showForm.bind(this),
        });
    }

    _showForm(e: L.LeafletMouseEvent) {
        this.#mapEvent = e;
        this.#form.removeClass('hidden');
        this.#inputDistance.trigger('focus');
    }

    _toggleElevationField() {
        this.#inputElevation
            .closest('.form__row')
            .toggleClass('form__row--hidden');
        this.#inputCadence
            .closest('.form__row')
            .toggleClass('form__row--hidden');
    }

    _newWorkout(
        e: JQuery.SubmitEvent<HTMLElement, undefined, HTMLElement, HTMLElement>
    ) {
        const validateNumeberInputs = (...inputs: number[]): boolean =>
            inputs.every(input => Number.isFinite(input));
        const validatePositiveNumbers = (...numbers: number[]): boolean =>
            numbers.every(number => number > 0);

        e.preventDefault();

        // Check that the map was loaded and a event was triggered
        if (!this.#mapEvent || !this.#map) {
            alert(
                'An error occured in the map plugin. Please reload the page.'
            );
            return;
        }

        // Get data from form
        const type = this.#inputType.val();
        const { lat, lng } = this.#mapEvent.latlng;
        const distance = Number(this.#inputDistance.val());
        const duration = Number(this.#inputDuration.val());
        let workout: Mapty.IWorkout | undefined = undefined;

        // Create workout
        if (type === 'running') {
            const cadence = Number(this.#inputCadence.val());
            // Validate data
            if (
                !validateNumeberInputs(duration, distance, cadence) ||
                !validatePositiveNumbers(duration, distance, cadence)
            )
                return alert('Inputs have to be positive numbers!');
            workout = new models.Running(
                [lat, lng],
                distance,
                duration,
                cadence
            );
        } else if (type === 'cycling') {
            const elevation = Number(this.#inputElevation.val());
            // Validate data
            if (
                !validateNumeberInputs(duration, distance, elevation) ||
                !validatePositiveNumbers(duration, distance)
            )
                return alert('Inputs have to be positive numbers!');
            workout = new models.Cycling(
                [lat, lng],
                distance,
                duration,
                elevation
            );
        }

        // Store workout
        if (!workout) return;
        this.#workouts.push(workout);

        // Render workout on map as marker
        this._renderWorkoutMarker([lat, lng], workout);

        // Clean input fields and hide form
        this._clearForm();
    }

    _renderWorkoutMarker(
        coords: L.LatLngExpression,
        workout: Mapty.IWorkout,
        options?: L.MarkerOptions | undefined
    ) {
        if (this.#map) {
            L.marker(coords, options)
                .addTo(this.#map)
                .bindPopup(
                    L.popup({
                        maxWidth: 250,
                        minWidth: 100,
                        autoClose: false,
                        closeOnClick: false,
                        className: `${workout.type}-popup`,
                    })
                )
                .setPopupContent('Workout')
                .openPopup();
        }
    }

    _renderWorkout(workout: Mapty.IWorkout) {
        const workoutListItem = this.#workoutsConteiner.append();
    }

    _clearForm() {
        this.#inputCadence.val('');
        this.#inputDistance.val('');
        this.#inputDuration.val('');
        this.#inputType.val('');
        this.#inputElevation.val('');
        this.#form.addClass('hidden');
    }
}

// Insert application icon
const iconLink = document.createElement('link');
iconLink.rel = 'shortcut icon';
iconLink.type = 'image/png';
iconLink.href = icon;
document.head.appendChild(iconLink);

// Insert application logo
const logoImg = new Image();
logoImg.src = logo;
logoImg.classList.add('logo');
document.querySelector('.sidebar')?.prepend(logoImg);
