import ship_icon from "./assets/boat_svg.svg";
import target from "./assets/target1.svg";
import mapboxgl from "mapbox-gl";

class Utils{
    static setShipIcon(){
        let shipIcon = document.createElement('div');
        shipIcon.className = "marker";
        shipIcon.style.background = "url("+ship_icon+")";

        return shipIcon;
    }

    static setTargetIcon(){
        let destinationTargetIcon = document.createElement('div');
        destinationTargetIcon.className = "marker";
        destinationTargetIcon.style.background = "url("+target+")";

        return destinationTargetIcon;
    }

    static getDistance(coordinateX, coordinateY, destinationCoordinateX, destinationCoordinateY){
        if(destinationCoordinateX==0.00 && destinationCoordinateY==0.00) return 0;

        const ship_point = new mapboxgl.LngLat(coordinateY, coordinateY);
        const destination_point = new mapboxgl.LngLat(destinationCoordinateX, destinationCoordinateY);
        return Math.round(ship_point.distanceTo(destination_point)/1000);
    }

    static styleGeoJson(map, geojson){
        //draw track and destination line attributes
        map.current.addSource('line', {
            'type': 'geojson',
            'data': geojson
        });

        map.current.addLayer({
            'id': 'line-animation',
            'type': 'line',
            'source': 'line',
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': 'rgb(127, 76, 221)',
                'line-width': 5,
                'line-opacity': 0.8
            }

        });

        //draw border along monitoring area
        map.current.addSource('maine', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [
                        [
                            [10.09094, 63.3989],
                            [10.67047, 63.3989],
                            [10.67047, 63.58645],
                            [10.09094, 63.58645],
                            [10.09094, 63.3989]
                        ]
                    ]
                }
            }
        });

        map.current.addLayer({
            'id': 'maine',
            'type': 'fill',
            'source': 'maine',
            'layout': {},
            'paint': {
                'fill-color': '#0080ff',
                'fill-opacity': 0.1
            }
        });

        map.current.addLayer({
            'id': 'outline',
            'type': 'line',
            'source': 'maine',
            'layout': {},
            'paint': {
                'line-color': '#000',
                'line-width': 3,
                'line-opacity': 0.3
            }
        });
    }


}

export default Utils;