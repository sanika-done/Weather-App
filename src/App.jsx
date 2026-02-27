import { FaSearch, FaSun, FaWind } from "react-icons/fa";
import {
  TiWeatherCloudy,
  TiWeatherStormy,
  TiWeatherPartlySunny,
  TiWeatherShower,
} from "react-icons/ti";
import { BsFillCloudDrizzleFill } from "react-icons/bs";
import { FaSnowman } from "react-icons/fa6";
import { LuCloudFog, LuGlassWater } from "react-icons/lu";
import { CiDroplet } from "react-icons/ci";
import "./App.css";
import { useState } from "react";

// Dynamic backgrounds based on weather
const weatherBackgrounds = {
  Clear: "linear-gradient(135deg, #f6d365 0%, #fda085 50%, #f093fb 100%)",
  Rain: "linear-gradient(135deg, #2c3e50 0%, #4a6fa5 50%, #89a4c7 100%)",
  Drizzle: "linear-gradient(135deg, #373b44 0%, #4286f4 50%, #a8c0d6 100%)",
  Clouds: "linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)",
  Snow: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 50%, #a8c0f0 100%)",
  Thunderstorm: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  Fog: "linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)",
  default: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
};

// Open-Meteo WMO weather codes → condition
const getWeatherInfo = (code) => {
  if (code === 0 || code === 1) return { label: "Clear", condition: "Clear" };
  if (code === 2 || code === 3) return { label: "Cloudy", condition: "Clouds" };
  if ([45, 48].includes(code)) return { label: "Foggy", condition: "Fog" };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Drizzle", condition: "Drizzle" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: "Rain", condition: "Rain" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Snow", condition: "Snow" };
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", condition: "Thunderstorm" };
  return { label: "Clear", condition: "Clear" };
};

// All major cities in India
const popularCities = [
  "Agartala", "Agra", "Ahmedabad", "Aizawl", "Ajmer", "Akola", "Aligarh",
  "Allahabad", "Alwar", "Ambala", "Amravati", "Amritsar", "Anand", "Aurangabad",
  "Bagalkot", "Bahraich", "Ballari", "Bareilly", "Belgaum", "Bengaluru", "Bhavnagar",
  "Bhilai", "Bhiwandi", "Bhopal", "Bhubaneswar", "Bikaner", "Bilaspur", "Bokaro",
  "Chandigarh", "Chennai", "Coimbatore", "Cuttack", "Davanagere", "Dehradun",
  "Delhi", "Dhanbad", "Dharwad", "Dibrugarh", "Durgapur", "Erode", "Faridabad",
  "Firozabad", "Gandhinagar", "Gaya", "Ghaziabad", "Gorakhpur", "Gulbarga",
  "Guntur", "Gurgaon", "Guwahati", "Gwalior", "Hapur", "Haridwar", "Hubli",
  "Hyderabad", "Imphal", "Indore", "Itanagar", "Jabalpur", "Jaipur", "Jalandhar",
  "Jammu", "Jamnagar", "Jamshedpur", "Jhansi", "Jodhpur", "Junagadh", "Kakinada",
  "Kalyan", "Kanpur", "Karimnagar", "Karnal", "Kharagpur", "Kochi", "Kohima",
  "Kolhapur", "Kolkata", "Kota", "Kozhikode", "Kurnool", "Latur", "Leh",
  "Lucknow", "Ludhiana", "Madurai", "Mangalore", "Mathura", "Meerut", "Moradabad",
  "Mumbai", "Mysore", "Nagpur", "Nanded", "Nashik", "Navi Mumbai", "Nellore",
  "Noida", "Panaji", "Patiala", "Patna", "Pondicherry", "Pune", "Raipur",
  "Rajkot", "Rajahmundry", "Ranchi", "Rohtak", "Rourkela", "Salem", "Sangli",
  "Shimla", "Shillong", "Siliguri", "Solapur", "Srinagar", "Surat", "Thane",
  "Thiruvananthapuram", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tirupati",
  "Udaipur", "Ujjain", "Vadodara", "Varanasi", "Vasai", "Vijayawada", "Visakhapatnam",
  "Warangal", "Yamunanagar",
];

function App() {
  const [suggestions, setSuggestions] = useState([]);
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentBg = weatherData
    ? weatherBackgrounds[weatherData.condition] || weatherBackgrounds.default
    : weatherBackgrounds.default;

  const handleSearch = (e) => {
    const value = e.target.value;
    setCity(value);
    setError("");
    if (value.length > 0) {
      const matches = popularCities
        .filter((c) => c.toLowerCase().startsWith(value.toLowerCase()))
        .slice(0, 8);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const getWeatherData = async (cityName = city) => {
    if (!cityName.trim()) return;
    setLoading(true);
    setError("");
    setSuggestions([]);

    try {
      // Get coordinates from city name
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName.trim())}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found. Please try another name.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country_code, timezone } = geoData.results[0];

      // Get weather using coordinates
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure` +
        `&timezone=${timezone}`
      );
      const data = await weatherRes.json();
      const current = data.current;
      const info = getWeatherInfo(current.weather_code);

      setWeatherData({
        name,
        country: country_code,
        temp: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        wind: current.wind_speed_10m,
        pressure: Math.round(current.surface_pressure),
        condition: info.condition,
        label: info.label,
      });

      setCity(name);
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "Clear": return <FaSun />;
      case "Rain": return <TiWeatherShower />;
      case "Drizzle": return <BsFillCloudDrizzleFill />;
      case "Clouds": return <TiWeatherCloudy />;
      case "Snow": return <FaSnowman />;
      case "Thunderstorm": return <TiWeatherStormy />;
      case "Fog": return <LuCloudFog />;
      default: return <TiWeatherPartlySunny />;
    }
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: currentBg,
          transition: "background 1.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-md">

          {/* Title */}
          <h1 className="text-3xl font-bold text-white tracking-wide drop-shadow-lg">
            🌤 Weather Now
          </h1>

          {/* Search */}
          <div className="relative w-full">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur border-2 border-white/20 rounded-2xl px-2 py-1">
              <input
                type="text"
                value={city}
                onChange={handleSearch}
                onKeyDown={(e) => e.key === "Enter" && getWeatherData()}
                placeholder="Enter City Name"
                className="border-none text-white placeholder-white bg-transparent px-4 py-2 focus:outline-none w-full"
              />
              <button
                onClick={() => getWeatherData()}
                disabled={loading}
                className="p-3 cursor-pointer text-white disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaSearch />
                )}
              </button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur text-black rounded-xl shadow-xl overflow-hidden z-10">
                {suggestions.map((s, index) => (
                  <li
                    key={index}
                    onClick={() => { setCity(s); getWeatherData(s); }}
                    className="px-4 py-2 hover:bg-blue-400 hover:text-white cursor-pointer transition-colors font-medium"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="w-full bg-red-500/30 border border-red-400/50 text-white rounded-xl px-4 py-3 text-sm text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Weather Display */}
          <div className="text-6xl font-bold text-white drop-shadow-lg">
            {weatherData ? weatherData.temp : "--"}
            <span className="text-3xl">°C</span>
          </div>

          <p className="text-xl text-white font-semibold">
            {weatherData ? `${weatherData.name}, ${weatherData.country}` : "--"}
          </p>

          <p className="text-white/80 text-lg flex items-center gap-2">
            {weatherData ? weatherData.label : "--"}
            <span className="text-2xl">
              {weatherData ? getWeatherIcon(weatherData.condition) : getWeatherIcon("Clear")}
            </span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <WeatherBox
              icon={<CiDroplet className="text-2xl" />}
              title="Humidity"
              value={weatherData ? `${weatherData.humidity}%` : "40%"}
            />
            <WeatherBox
              icon={<LuGlassWater className="text-2xl" />}
              title="Pressure"
              value={weatherData ? `${weatherData.pressure} hPa` : "1013 hPa"}
            />
            <WeatherBox
              icon={<FaWind className="text-2xl" />}
              title="Wind Speed"
              value={weatherData ? `${weatherData.wind} km/h` : "10 km/h"}
            />
            <WeatherBox
              icon={<FaSun className="text-2xl" />}
              title="Feels Like"
              value={weatherData ? `${weatherData.feelsLike}°C` : "27°C"}
            />
          </div>

        </div>
      </div>
    </>
  );
}

const WeatherBox = ({ title, icon, value }) => {
  return (
    <div className="flex flex-col items-center bg-white/20 rounded-2xl p-4 gap-1">
      <div className="text-white">{icon}</div>
      <p className="text-white/60 text-xs uppercase tracking-wider">{title}</p>
      <p className="text-white font-bold text-sm">{value}</p>
    </div>
  );
};

export default App;