import './assets/style/main.scss';
import 'leaflet_css';
import App from './app';
import L from 'leaflet';

/* This code is needed to properly load the images in the Leaflet CSS */
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet_marker_2x'),
    iconUrl: require('leaflet_marker'),
    shadowUrl: require('leaflet_marker_shadow'),
});

const mapty = new App();
