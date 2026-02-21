import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CloudSun, Cloud, CloudRain, Sun, Wind, Droplets, Snowflake, AlertTriangle, MapPin, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  location: string;
  latitude: number | null;
  longitude: number | null;
}

interface WeatherData {
  day: string;
  icon: React.ComponentType<any>;
  temp: number;
  low: number;
  humidity: number;
  wind: number;
  condition: string;
  rain: number;
}

interface CurrentWeather {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  rain: number;
  icon: React.ComponentType<any>;
}

const getWeatherIcon = (code: number): React.ComponentType<any> => {
  if (code === 0 || code === 1) return Sun;
  if (code === 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code === 45 || code === 48) return Cloud;
  if (code === 51 || code === 53 || code === 55 || code === 61 || code === 63 || code === 65 || code === 71 || code === 73 || code === 75 || code === 77 || code === 80 || code === 81 || code === 82 || code === 85 || code === 86) return CloudRain;
  return CloudSun;
};

const getWeatherCondition = (code: number): string => {
  const conditions: { [key: number]: string } = {
    0: "Clear Sky",
    1: "Mostly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Heavy Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
  };
  return conditions[code] || "Unknown";
};

const Weather = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [globalForecast, setGlobalForecast] = useState<WeatherData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("location, latitude, longitude")
      .eq("user_id", user!.id)
      .single();

    if (data) {
      setProfile({
        location: data.location || "Your Location",
        latitude: data.latitude,
        longitude: data.longitude,
      });
      
      // Fetch real weather if coordinates exist
      if (data.latitude && data.longitude) {
        fetchWeatherData(data.latitude, data.longitude);
      } else if (data.location) {
        // Try to geocode location
        geocodeLocation(data.location);
      }
    }
    setLoading(false);
  };

  const geocodeLocation = async (location: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        fetchWeatherData(parseFloat(data[0].lat), parseFloat(data[0].lon));
      }
    } catch (err) {
      setError("Could not fetch weather data");
    }
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      // Fetch user location weather
      const userRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`
      );
      const userData = await userRes.json();
      
      // Fetch global comparison weather (different location - e.g., central area)
      const globalRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat + 2}&longitude=${lon + 2}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`
      );
      const globalData = await globalRes.json();

      // Process user weather
      const current = userData.current;
      const days = ["Today", "Tomorrow", "Mon", "Tue", "Wed", "Thu", "Fri"];
      
      const userForecast: WeatherData[] = userData.daily.time.map((date: string, i: number) => ({
        day: days[i] || `Day ${i + 1}`,
        icon: getWeatherIcon(userData.daily.weather_code[i]),
        temp: Math.round(userData.daily.temperature_2m_max[i]),
        low: Math.round(userData.daily.temperature_2m_min[i]),
        humidity: userData.daily.precipitation_probability_max[i],
        wind: Math.round(userData.daily.wind_speed_10m_max[i]),
        condition: getWeatherCondition(userData.daily.weather_code[i]),
        rain: userData.daily.precipitation_probability_max[i],
      }));

      const globalForecastData: WeatherData[] = globalData.daily.time.map((date: string, i: number) => ({
        day: days[i] || `Day ${i + 1}`,
        icon: getWeatherIcon(globalData.daily.weather_code[i]),
        temp: Math.round(globalData.daily.temperature_2m_max[i]),
        low: Math.round(globalData.daily.temperature_2m_min[i]),
        humidity: globalData.daily.precipitation_probability_max[i],
        wind: Math.round(globalData.daily.wind_speed_10m_max[i]),
        condition: getWeatherCondition(globalData.daily.weather_code[i]),
        rain: globalData.daily.precipitation_probability_max[i],
      }));

      setCurrentWeather({
        temp: Math.round(current.temperature_2m),
        condition: getWeatherCondition(current.weather_code),
        humidity: current.relative_humidity_2m,
        wind: Math.round(current.wind_speed_10m),
        rain: current.precipitation || 0,
        icon: getWeatherIcon(current.weather_code),
      });

      setForecast(userForecast);
      setGlobalForecast(globalForecastData);
    } catch (err) {
      setError("Could not fetch weather data");
      console.error(err);
    }
  };

  const userLocation = profile?.location || "Your Location";
  const smartAlerts = [
    { type: "warning", text: "High humidity — watch for fungal diseases" },
    { type: "success", text: "Ideal conditions for pesticide application today" },
    { type: "info", text: "Monitor forecast for rain before irrigation" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader className="animate-spin text-primary" size={32} />
            <p className="text-muted-foreground">Loading weather data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <CloudSun className="text-primary" /> Weather Forecast
          </h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <MapPin size={16} />
            {userLocation} • {profile?.latitude && profile?.longitude ? "Real-time GPS Location" : "Profile Location"}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Smart Alerts */}
        <div className="space-y-2">
          {smartAlerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg p-3 text-sm font-medium ${
                a.type === "warning"
                  ? "bg-warning/10 text-warning"
                  : a.type === "success"
                  ? "bg-success/10 text-success"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {a.type === "warning" ? <AlertTriangle size={16} /> : <CloudSun size={16} />}
              {a.text}
            </div>
          ))}
        </div>

        {/* Today highlight */}
        {currentWeather && (
          <div className="rounded-xl gradient-hero p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Today</p>
                <p className="font-display text-5xl font-extrabold">{currentWeather.temp}°C</p>
                <p className="text-lg mt-1">{currentWeather.condition}</p>
              </div>
              <currentWeather.icon size={64} className="opacity-80" />
            </div>
            <div className="flex gap-6 mt-4 text-sm">
              <span className="flex items-center gap-1"><Droplets size={14} /> {currentWeather.humidity}%</span>
              <span className="flex items-center gap-1"><Wind size={14} /> {currentWeather.wind} km/h</span>
              <span className="flex items-center gap-1"><CloudRain size={14} /> {currentWeather.rain}mm</span>
            </div>
          </div>
        )}

        {/* 7-day for Your Location */}
        {forecast.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-bold mb-3">📍 {userLocation} - 7 Day Forecast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {forecast.map((d) => (
                <div key={d.day} className="rounded-xl border bg-card p-4 text-center hover:shadow-md transition-all">
                  <p className="text-xs font-bold text-muted-foreground uppercase">{d.day}</p>
                  <d.icon size={28} className="mx-auto my-2 text-primary" />
                  <p className="font-display font-bold text-lg">{d.temp}°</p>
                  <p className="text-xs text-muted-foreground">{d.low}°</p>
                  <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
                    <p>💧 {d.humidity}%</p>
                    <p>🌧 {d.rain}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Comparison */}
        {globalForecast.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-bold mb-3">🌍 Regional Comparison - 7 Day Forecast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {globalForecast.map((d) => (
                <div key={d.day} className="rounded-xl border bg-card/50 p-4 text-center hover:shadow-md transition-all opacity-75">
                  <p className="text-xs font-bold text-muted-foreground uppercase">{d.day}</p>
                  <d.icon size={28} className="mx-auto my-2 text-muted-foreground" />
                  <p className="font-display font-bold text-lg">{d.temp}°</p>
                  <p className="text-xs text-muted-foreground">{d.low}°</p>
                  <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
                    <p>💧 {d.humidity}%</p>
                    <p>🌧 {d.rain}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Farming Tips */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-display font-bold mb-3">🌾 Best Days This Week</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-success/10">
              <p className="font-bold text-success">Sowing</p>
              <p className="text-muted-foreground">Check forecast for rain</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10">
              <p className="font-bold text-warning">Spraying</p>
              <p className="text-muted-foreground">Avoid during rain/high humidity</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <p className="font-bold text-primary">Harvesting</p>
              <p className="text-muted-foreground">Choose dry & sunny days</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Weather;
