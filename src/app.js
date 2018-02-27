const mapboxgl = require('mapbox-gl');
const config = require('./config');
const turf = require('@turf/turf');

mapboxgl.accessToken = 'pk.eyJ1Ijoic2FuamF5YiIsImEiOiJjaWcwcHc1dGIwZXBudHJrd2t5YjI3Z3VyIn0.j_6dWw8HvH5RtZrMBqbP1Q';

const padMap = window.padMap = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v8', //stylesheet location
    center: [72.828002, 18.963406],
    hash: true,
    zoom: 16 // starting zoom
});

padMap.on('load', () => {
	fetchGeoJSON()
		.then(geojson => {
			const $video = document.getElementById('video');
			$video.src = config.videoUrl;
			$video.addEventListener('loadedmetadata', () => {
				console.log('loaded event metadata');
			});
			console.log('geojson', geojson);
			const lineString = makeLineString(geojson);
			const bbox = turf.bbox(lineString);
			padMap.fitBounds(bbox);
			padMap.addSource('roadline', {
				type: 'geojson',
				data: lineString
			});
			padMap.addLayer({
				id: 'roadline-layer',
				type: 'line',
				source: 'roadline',
				paint: {
					'line-color': '#f00',
					'line-width': 5
				}
			});
		});
});


function fetchGeoJSON() {
	const url = config.geojsonUrl;
	return fetch(url)
		.then(response => response.json());
}

function makeLineString(fc) {
	return {
		type: 'Feature',
		geometry: {
			type: 'LineString',
			coordinates: fc.features.map(feature => feature.geometry.coordinates)
		}
	};
}