import icon from './assets/img/icon.png';
import logo from './assets/img/logo.png';
import * as models from './models';
import L from 'leaflet';
import $ from 'jquery';

export default class App implements Mapty.IApp {
    #map: L.Map | undefined;
    #mapEvent: L.LeafletMouseEvent | undefined;
    #mapZoomLevel: number = 13;
    #workouts: Array<Mapty.IWorkout> = [];
    #workoutsConteiner: JQuery<HTMLUListElement> = $('ul.workouts');
    #form: JQuery<HTMLElement> = $('.form');
    #inputType: JQuery<HTMLElement> = $('#workout-type');
    #inputDistance: JQuery<HTMLElement> = $('#workout-distance');
    #inputDuration: JQuery<HTMLElement> = $('#workout-duration');
    #inputCadence: JQuery<HTMLElement> = $('#workout-cadence');
    #inputElevation: JQuery<HTMLElement> = $('#workout-elevation');

    constructor() {
        // Get logged workouts from local storage
        this._getLocalStorage();

        // Get user position
        this._getPosition();

        // Attach event handlers
        this.#form.on({
            submit: this._newWorkout.bind(this),
        });
        this.#inputType.on({
            change: this._toggleElevationField.bind(this),
        });
        this.#workoutsConteiner.on({
            click: this._movetoWorkoutPopup.bind(this),
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

        // Render markers of stored workouts
        this.#workouts.forEach(workout =>
            this._renderWorkoutMarker(workout.coords, workout)
        );

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
            return alert(
                'An error occured in the map plugin. Please reload the page.'
            );
        }

        // Get data from form
        const type = this.#inputType.val();
        const { lat, lng } = this.#mapEvent.latlng;
        const distance = Number(this.#inputDistance.val());
        const duration = Number(this.#inputDuration.val());
        let workout: Mapty.IWorkout | undefined;

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

        // Render workout on list
        this._renderWorkout(workout);

        // Clean input fields and hide form
        this._clearForm();

        // Set local storage to all workouts
        this._setLocalStorage();
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
                .setPopupContent(this._getWorkoutPopupContent(workout))
                .openPopup();
        }
    }

    _renderWorkout(workout: Mapty.IWorkout) {
        let html = `<li class="workout workout--${workout.type}" data-id="${
            workout.id
        }">
            <h2 class="workout__title">${this._getWorkoutDescription(
                workout
            )}</h2>
            <div class="workout__details">
                <span class="workout__icon">${this._getWorkoutIcon(
                    workout
                )}</span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">min</span>
            </div>
            `;
        if (workout.type === 'running') {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏻</span>
                    <span class="workout__value">${workout.pace?.toFixed(
                        1
                    )}</span>
                    <span class="workout__unit">spm</span>
                </div>
            </li>`;
        } else if (workout.type === 'cycling') {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed?.toFixed(
                        1
                    )}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.elevationGain}</span>
                    <span class="workout__unit">m</span>
                </div>
            </li>`;
        }
        this.#workoutsConteiner.append(html);
    }

    _clearForm() {
        this.#inputCadence.val('');
        this.#inputDistance.val('');
        this.#inputDuration.val('');
        this.#inputType.val('');
        this.#inputElevation.val('');
        this.#form.css('display', 'none');
        this.#form.addClass('hidden');
        setTimeout(() => this.#form.css('display', 'grid'), 1000);
    }

    _getWorkoutDescription(workout: Mapty.IWorkout): string {
        return `${
            workout.type[0].toUpperCase() + workout.type.slice(1)
        } on ${Intl.DateTimeFormat(navigator.language, {
            month: 'long',
            day: 'numeric',
        }).format(workout.date)}`;
    }

    _getWorkoutIcon(workout: Mapty.IWorkout): string {
        return workout.type === 'running' ? '🏃🏻‍♂️' : '🚴🏻‍♀️';
    }

    _getWorkoutPopupContent(workout: Mapty.IWorkout): string {
        return `${this._getWorkoutIcon(workout)} ${this._getWorkoutDescription(
            workout
        )}`;
    }

    _movetoWorkoutPopup(e: JQuery.ClickEvent): void {
        const workoutEl = e.target.closest('.workout');
        if (!workoutEl) return;

        const workout = this.#workouts.find(
            workout => workout.id === workoutEl.data('id')
        );
        if (!workout) return;

        this.#map?.setView(workout?.coords, this.#mapZoomLevel, {
            animate: true,
            duration: 1,
        });
    }

    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    _getLocalStorage() {
        const workoutsJson = localStorage.getItem('workouts');
        if (!workoutsJson) return;

        const workoutsData = JSON.parse(workoutsJson);

        workoutsData.forEach((workout: any) => {
            if (workout._type === 'running' && workout._cadence) {
                this.#workouts.push(
                    new models.Running(
                        workout._coords,
                        workout._distance,
                        workout._duration,
                        workout._cadence
                    )
                );
            } else if (workout._type === 'cycling' && workout._elevationGain) {
                this.#workouts.push(
                    new models.Running(
                        workout._coords,
                        workout._distance,
                        workout._duration,
                        workout._elevationGain
                    )
                );
            }
        });

        this.#workouts.forEach((workout: Mapty.IWorkout) => {
            this._renderWorkout(workout);
        });
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
