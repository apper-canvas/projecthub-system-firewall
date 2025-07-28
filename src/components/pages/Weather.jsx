import React, { useState, useEffect } from "react";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import weatherService from "@/services/api/weatherService";

const Weather = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError("");

      const [forecast, weatherAlerts] = await Promise.all([
        weatherService.getWeatherForecast(),
        weatherService.getWeatherAlerts()
      ]);

      setWeatherData(forecast);
      setAlerts(weatherAlerts);
    } catch (err) {
      setError("Failed to load weather data. Please try again.");
      console.error("Weather loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

  const getWeatherIcon = (iconName) => {
    const iconMap = {
      "Sun": "Sun",
      "CloudSun": "CloudSun",
      "Cloud": "Cloud", 
      "CloudRain": "CloudRain",
      "CloudSnow": "CloudSnow"
    };
    return iconMap[iconName] || "Sun";
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 80) return "text-red-500";
    if (temp >= 70) return "text-orange-500";
    if (temp >= 60) return "text-yellow-500";
    if (temp >= 50) return "text-blue-500";
    return "text-blue-700";
  };

  const getPrecipitationColor = (precipitation) => {
    if (precipitation >= 70) return "text-blue-600";
    if (precipitation >= 30) return "text-blue-400";
    if (precipitation >= 10) return "text-blue-300";
    return "text-gray-400";
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadWeatherData} />;

  const currentWeather = weatherData[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Weather Forecast</h1>
        <p className="text-gray-600">7-day weather outlook for farm planning</p>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <ApperIcon name="AlertTriangle" size={20} className="text-red-500" />
            <span>Weather Alerts</span>
          </h2>
          
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ApperIcon name="AlertTriangle" size={20} className="text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-800">{alert.title}</h3>
                  <p className="text-red-700 mt-1">{alert.message}</p>
                  <p className="text-sm text-red-600 mt-2">
                    Active until {new Date(alert.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Weather Highlight */}
      {currentWeather && (
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Today's Weather</h2>
              <p className="text-primary-100 text-lg mb-4">{currentWeather.condition}</p>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-primary-200 text-sm">Temperature Range</p>
                  <p className="text-2xl font-bold">
                    {currentWeather.high}°F / {currentWeather.low}°F
                  </p>
                </div>
                <div>
                  <p className="text-primary-200 text-sm">Precipitation</p>
                  <p className="text-2xl font-bold">{currentWeather.precipitation}%</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <ApperIcon 
                name={getWeatherIcon(currentWeather.icon)} 
                size={80} 
                className="text-white mb-4" 
              />
              <div className="text-6xl font-bold">{currentWeather.high}°</div>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">7-Day Forecast</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {weatherData.map((day, index) => (
            <div key={day.date} className={`card ${index === 0 ? 'ring-2 ring-primary-500' : ''}`}>
              <div className="text-center">
                <h3 className="font-medium text-gray-900 mb-2">
                  {day.day}
                </h3>
                
                <div className="mb-4">
                  <ApperIcon 
                    name={getWeatherIcon(day.icon)} 
                    size={48} 
                    className="mx-auto text-primary-500 mb-2" 
                  />
                  <p className="text-sm text-gray-600">{day.condition}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Temperature</p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className={`text-lg font-bold ${getTemperatureColor(day.high)}`}>
                        {day.high}°
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">{day.low}°</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Precipitation</p>
                    <div className="flex items-center justify-center space-x-1">
                      <ApperIcon 
                        name="Droplets" 
                        size={12} 
                        className={getPrecipitationColor(day.precipitation)} 
                      />
                      <span className={`text-sm font-medium ${getPrecipitationColor(day.precipitation)}`}>
                        {day.precipitation}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Humidity</p>
                      <p className="font-medium">{day.humidity}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Wind</p>
                      <p className="font-medium">{day.windSpeed} mph</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agricultural Insights */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
        <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center space-x-2">
          <ApperIcon name="Lightbulb" size={20} className="text-primary-600" />
          <span>Farm Weather Insights</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-primary-800">This Week's Recommendations:</h3>
            <ul className="space-y-2 text-sm text-primary-700">
              {weatherData.some(day => day.precipitation > 70) && (
                <li className="flex items-start space-x-2">
                  <ApperIcon name="CloudRain" size={16} className="text-blue-500 mt-0.5" />
                  <span>Heavy rain expected - ensure proper drainage and postpone outdoor activities</span>
                </li>
              )}
              {weatherData.some(day => day.high > 85) && (
                <li className="flex items-start space-x-2">
                  <ApperIcon name="Sun" size={16} className="text-orange-500 mt-0.5" />
                  <span>High temperatures ahead - increase irrigation and provide shade for sensitive crops</span>
                </li>
              )}
              {weatherData.some(day => day.low < 45) && (
                <li className="flex items-start space-x-2">
                  <ApperIcon name="Snowflake" size={16} className="text-blue-600 mt-0.5" />
                  <span>Cool nights expected - protect frost-sensitive plants</span>
                </li>
              )}
              {weatherData.filter(day => day.precipitation < 20).length >= 5 && (
                <li className="flex items-start space-x-2">
                  <ApperIcon name="Sun" size={16} className="text-yellow-500 mt-0.5" />
                  <span>Dry period ahead - perfect for harvesting and field work</span>
                </li>
              )}
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-primary-800">Optimal Activities:</h3>
            <div className="space-y-2 text-sm">
              {weatherData.slice(0, 3).map((day, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                  <span className="text-primary-700">{day.day}</span>
                  <span className="text-primary-600 font-medium">
                    {day.precipitation < 20 ? "Ideal for fieldwork" : 
                     day.precipitation < 50 ? "Light tasks only" : 
                     "Indoor planning day"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;