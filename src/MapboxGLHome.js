import React, {useRef, useEffect, useState} from 'react'
import mapboxgl from 'mapbox-gl';
import './assets/App.css';
import Weather from "./Weather";
import Utils from "./Utils";

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

mapboxgl.accessToken = "pk.eyJ1IjoiYnlrb3NkZXZvcyIsImEiOiJja3dqNDIxOWkxZWptMnBuczIwZTFzZWlhIn0.anq_k7AEiJI540UCLuKyig";

const MapboxGLHome = () => {
    const mapContainerRef = useRef(null);
    const [lng, setLng] = useState(10.380705);
    const [lat, setLat] = useState(63.492375);
    const [zoom, setZoom] = useState(10);
    const map = useRef(null);


    function setVesselDataFunc(){
        let requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        fetch("http://34.118.67.174/api/vessels/data", requestOptions)
            .then(response => response.json())
            .then(result => {
                result.forEach(data => {
                    const divElement = document.createElement('div');
                    divElement.innerHTML ='<h3> Ship name: '+data.shipName+ '</h3>' +
                        '<p> Ship country: <span>' + data.country + '</span></p>'+
                        '<p> Destination name: <span>' +data.destination + '</span></p>'+
                        '<p> Distance to destination: <span>' + Utils.getDistance(data.coordinateX, data.coordinateY,
                            data.destinationCoordinateX, data.destinationCoordinateY)+' km</span> </p>'+
                        '<p> Call sign: <span>' +data.callSign+ '</span></p>' +
                        '<p> Estimated time of arrival: <span>' + data.eta +'</span></p>'+
                        '<p> Draught of vessel: <span>'+data.draught+' m</span></p>'+
                        '<p> Is survey: <span> ' + data.survey+ '</span> </p>' +
                        '<p> IMO (International Maritime Organization): <span> ' + data.imo+ '</span> </p>' +
                        '<p> Maritime Mobile Service Identity: <span> ' + data.mmsi+ '</span> </p>' +
                        '<a href="https://api.vtexplorer.com/docs/ref-aistypes.html" target="_blank"> Ship type number: <span> ' + data.shipType + '</span> </a>'+
                        '<p> Last ship data updated: <span>' + data.lastUpdate + '</span> </p>';


                    const showShipTrace = document.createElement('button');
                    showShipTrace.innerText="Show ship trace";
                    divElement.appendChild(showShipTrace);

                    showShipTrace.addEventListener('click', (e) => {
                        cleanLine();
                        for(let i=0; i<= data.coordinatesX.length-1; i++){
                            geojson.features[0].geometry.coordinates.push([data.coordinatesX[i], data.coordinatesY[i]]);
                            map.current.getSource('line').setData(geojson);
                        }
                    });

                    //dont append to popup showDestinationButton if destination doesn't exists
                    if(!(data.destinationCoordinateX==0.00 && data.destinationCoordinateY==0.00)){

                        const showDestinationPoint = document.createElement('button');
                        showDestinationPoint.innerText ="Show destination point";
                        divElement.appendChild(showDestinationPoint);

                        showDestinationPoint.addEventListener('click', (e) => {

                            cleanLine();

                            if(!data.marker){
                                geojson.features[0].geometry.coordinates.push([data.coordinateX, data.coordinateY]);
                                geojson.features[0].geometry.coordinates.push([data.destinationCoordinateX, data.destinationCoordinateY]);
                                map.current.getSource('line').setData(geojson);

                                const popupDivContainer = document.createElement('div');
                                popupDivContainer.innerHTML = '<h3>Destination: '+data.destination+'</h3>'+
                                    '<p> Estimated time of arrival: <span>' + data.eta +'</span></p>'+
                                    '<p> Coordinate x: <span>' +data.destinationCoordinateX+ '</span></p>'+
                                    '<p> Coordinate y: <span>' +data.destinationCoordinateY+ '</span></p>';

                                const hideDestinationPointButton = document.createElement('button');
                                hideDestinationPointButton.innerText = "Hide this point";
                                popupDivContainer.appendChild(hideDestinationPointButton);

                                hideDestinationPointButton.addEventListener('click', (e) =>{
                                    cleanLine();
                                    data.marker.remove();
                                    data.marker = null;
                                })

                                let popupDestinationPoint = new mapboxgl.Popup({offset: 25}).setDOMContent(popupDivContainer);

                                let destinationMarker = new mapboxgl.Marker(Utils.setTargetIcon())
                                    .setLngLat([data.destinationCoordinateX, data.destinationCoordinateY])
                                    .setPopup(popupDestinationPoint)
                                    .addTo(map.current);
                                data.marker = destinationMarker;
                            }else{
                                data.marker.remove();
                                data.marker = null;
                            }
                            showDestinationPoint.innerText = (!data.marker)? "Show destination point": "Hide destination point";
                        });
                    }

                    let popup = new mapboxgl.Popup({ offset: 25 })
                        .setDOMContent(divElement);

                    new mapboxgl.Marker(Utils.setShipIcon()).setLngLat([data.coordinateX, data.coordinateY])
                        .setPopup(popup).addTo(map.current);
                });
            })
            .catch(error => console.log('error', error));
    }

    useEffect(() =>{
        //initialize mapboxgl
        map.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/bykosdevos/ckwj4tu4w2w5v15nv3xq6u7ys",
            center: [lng, lat],
            zoom: zoom,
            attributionControl: false,
        });

        map.current.on('load', () => {
            Utils.styleGeoJson(map, geojson);
        });

        setVesselDataFunc();
    }, []);

    const geojson = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': []
                }
            }
        ]
    };

    function cleanLine(){
        geojson.features[0].geometry.coordinates = [];
        map.current.getSource('line').setData(geojson);
    }

    useEffect(() => {
        if (!map.current) return; // wait for map to initialize
        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
        });
    }, []);

    return(<section >
        <div className="sidebar">Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}</div>
        <Weather />
        <div ref={mapContainerRef} className="map_container"></div>
    </section>);

};

export default MapboxGLHome;