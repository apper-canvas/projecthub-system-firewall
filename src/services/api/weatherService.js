// Mock weather service for demonstration
class WeatherService {
  constructor() {
    this.mockWeatherData = [
      {
        date: new Date().toISOString().split("T")[0],
        day: "Today",
        high: 78,
        low: 52,
        condition: "Sunny",
        icon: "Sun",
        precipitation: 0,
        humidity: 45,
        windSpeed: 8
      },
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        day: "Tomorrow",
        high: 75,
        low: 48,
        condition: "Partly Cloudy",
        icon: "CloudSun",
        precipitation: 10,
        humidity: 52,
        windSpeed: 12
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        day: "Thursday",
        high: 72,
        low: 45,
        condition: "Cloudy",
        icon: "Cloud",
        precipitation: 30,
        humidity: 68,
        windSpeed: 15
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        day: "Friday",
        high: 69,
        low: 42,
        condition: "Light Rain",
        icon: "CloudRain",
        precipitation: 70,
        humidity: 82,
        windSpeed: 18
      },
      {
        date: new Date(Date.now() + 345600000).toISOString().split("T")[0],
        day: "Saturday",
        high: 73,
        low: 46,
        condition: "Showers",
        icon: "CloudRain",
        precipitation: 85,
        humidity: 78,
        windSpeed: 14
      },
      {
        date: new Date(Date.now() + 432000000).toISOString().split("T")[0],
        day: "Sunday",
        high: 76,
        low: 49,
        condition: "Partly Cloudy",
        icon: "CloudSun",
        precipitation: 20,
        humidity: 58,
        windSpeed: 10
      },
      {
        date: new Date(Date.now() + 518400000).toISOString().split("T")[0],
        day: "Monday",
        high: 79,
        low: 53,
        condition: "Sunny",
        icon: "Sun",
        precipitation: 5,
        humidity: 42,
        windSpeed: 7
      }
    ];
  }

  async getWeatherForecast() {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...this.mockWeatherData];
  }

  async getCurrentWeather() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { ...this.mockWeatherData[0] };
  }

  async getWeatherAlerts() {
    await new Promise(resolve => setTimeout(resolve, 150));
    return [
      {
        id: 1,
        type: "frost",
        severity: "warning",
        title: "Frost Warning",
        message: "Temperatures may drop below 32°F Thursday night. Protect sensitive crops.",
        startDate: new Date(Date.now() + 259200000).toISOString(),
        endDate: new Date(Date.now() + 272800000).toISOString()
      }
    ];
  }
}

export default new WeatherService();