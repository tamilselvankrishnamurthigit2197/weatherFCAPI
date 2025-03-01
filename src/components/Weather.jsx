import React, { useEffect, useRef, useState } from 'react';
import './Weather.css';

// Import icons
import search_icon from '../assets/search.png';
import clear_icon from '../assets/clear.png';
import cloud_icon from '../assets/cloud_icon.png';
import drizzle_icon from '../assets/drizzle_icon.png';
import rain_icon from '../assets/rain_icon.png';
import snow_icon from '../assets/snow_icon.png';
import wind_icon from '../assets/wind_icon.png';
import humidity_icon from '../assets/humidity_icon.png';

// Weather Icons Mapping
const allIcons = {
    "01d": clear_icon, "01n": clear_icon,
    "02d": cloud_icon, "02n": cloud_icon,
    "03d": cloud_icon, "03n": cloud_icon,
    "04d": drizzle_icon, "04n": drizzle_icon,
    "09d": rain_icon, "09n": rain_icon,
    "10d": rain_icon, "10n": rain_icon,
    "13d": snow_icon, "13n": snow_icon,
};

const Weather = () => {
    const inputRef = useRef();
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState([]);

    // Fetch Forecast Data
    const fetchForecast = async (city) => {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${import.meta.env.VITE_APP_ID}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                console.error('Forecast API error:', data.message);
                return [];
            }

            return processForecastData(data.list);
        } catch (error) {
            console.error('Error fetching forecast data:', error);
            return [];
        }
    };

    // Process Forecast Data (Extract 4-day forecast)
    const processForecastData = (list) => {
        const dailyData = {};

        list.forEach((item) => {
            const date = item.dt_txt.split(' ')[0];

            if (!dailyData[date]) {
                dailyData[date] = [];
            }
            dailyData[date].push(item);
        });

        return Object.entries(dailyData).slice(1, 5).map(([date, entries]) => {
            const temperatures = entries.map((entry) => entry.main.temp);
            const avgTemp = (temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length).toFixed(1);
            const weatherIcon = entries[0].weather[0].icon;

            return {
                date,
                avgTemp,
                icon: allIcons[weatherIcon] || clear_icon,
            };
        });
    };

    // Fetch Current Weather Data
    const search = async (city) => {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            const icon = allIcons[data.weather[0].icon] || clear_icon;

            setWeatherData({
                temperature: Math.floor(data.main.temp),
                location: data.name,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                icon: icon,
            });

            const forecast = await fetchForecast(city);
            setForecastData(forecast);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    };

    // Load Default City Weather on Mount
    useEffect(() => {
        search('London');
    }, []);

    return (
        <div className='weather'>
            {/* Search Bar */}
            <div className='search-bar'>
                <input type="text" ref={inputRef} placeholder='Search City' />
                <img src={search_icon} alt="Search" onClick={() => search(inputRef.current.value)} />
            </div>

            {/* Weather Information */}
            {weatherData && (
                <>
                    <img src={weatherData.icon} className='weather_icon' alt="Weather" />
                    <p className='temperature'>{weatherData.temperature} °C</p>
                    <p className='location'>{weatherData.location}</p>

                    <div className='weather_data'>
                        <div className='col'>
                            <img src={humidity_icon} alt="Humidity" />
                            <div>
                                <p>{weatherData.humidity}%</p>
                                <span>Humidity</span>
                            </div>
                        </div>

                        <div className='col'>
                            <img src={wind_icon} alt="Wind Speed" />
                            <div>
                                <p>{weatherData.windSpeed} Km/h</p>
                                <span>Wind Speed</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* 4-Day Forecast */}
            <div className='forecast'>
                <h3>4-Day Forecast</h3>
                <div className='forecast-container'>
                    {forecastData.map((day, index) => (
                        <div key={index} className='forecast-day'>
                            <p className='date'>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                            <img src={day.icon} alt="Forecast Icon" className='weather_icon' />
                            <p>{day.avgTemp}°C</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Weather;
