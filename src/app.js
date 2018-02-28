const mapboxgl = require('mapbox-gl');
const config = require('./config');
const turfBBox = require('@turf/bbox').default; // no idea why the default is needed really, but it is
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2VvaGFja2VyIiwiYSI6ImFIN0hENW8ifQ.GGpH9gLyEg0PZf3NPQ7Vrg';

const padMap = window.padMap = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/geohacker/cj6hcmopz48qw2rpgjidmby7k', //stylesheet location
    center: [72.828002, 18.963406],
    hash: true,
    zoom: 16 // starting zoom
});

padMap.on('load', () => {
	fetchGeoJSON()
		.then(geojson => {
			const lineString = makeLineString(geojson);
			const bbox = turfBBox(lineString);
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
            padMap.addSource('current', {
                type: 'geojson',
                data: geojson.features[0]
            });
            padMap.addLayer({
                id: 'current-layer',
                source: 'current',
                type: 'symbol',
                layout: {
                    'icon-image': 'car',
                    'icon-size': 0.3
                }
            });

            padMap.on('mouseenter', 'current-layer', () => {
                console.log('entered current-layer');
            });

			const $video = document.getElementById('video');
			$video.src = config.videoUrl;
			$video.addEventListener('loadedmetadata', () => {
				console.log('loaded event metadata');
			});
			$video.addEventListener('timeupdate', () => {
				const time = $video.currentTime;
				const point = getPointFromTime(time, geojson);
                padMap.getSource('current').setData(point);
			});
			console.log('geojson', geojson);
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

function getPointFromTime(time, geojson) {
	console.log('time', time);
	const frameNo = Math.floor(time * 25);
	return geojson.features[frameNo];
}