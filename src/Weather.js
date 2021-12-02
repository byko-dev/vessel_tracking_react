import React, {useEffect, useState} from 'react';
import './assets/App.css';

const Home = () => {
    const [weatherData, setWeatherData] = useState('');

    useEffect(()=> {
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        fetch("http://34.118.67.174/api/local/weather", requestOptions)
            .then(response => response.json())
            .then(result => {
                setWeatherData(result);
            })
            .catch(error => console.log('error', error));
    }, [])

    return(<div className="weather-sidebar">
        <h3>Weather in local countryside Trolla, Norway</h3>
        <div className="weather_box">
            <img src={weatherData.weather_icon_url} alt="weather_icon"></img>
            <p>Weather: <span>{weatherData.weather_descriptions}</span></p>
        </div>

        <p>Temperature: <span> {weatherData.temperature}</span></p>
        <p>Time of date: <span> {weatherData.is_day==="no"? "Night": "Day"}</span></p>
        <p>Wind direction: <span> {weatherData.wind_dir}</span></p>
        <p>Wind speed: <span> {weatherData.wind_speed}</span></p>
        <p>Wind degree: <span> {weatherData.wind_degree}</span></p>
        <p>Weather last update: <span > {weatherData.time}</span></p>
    </div>);
};

export default Home;