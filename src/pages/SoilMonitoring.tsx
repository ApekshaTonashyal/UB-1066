import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { Droplets, Thermometer, FlaskRound, Gauge, Wind, CloudRain } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

const npkData = [
  { nutrient: "Nitrogen", value: 72, ideal: 80 },
  { nutrient: "Phosphorus", value: 55, ideal: 60 },
  { nutrient: "Potassium", value: 85, ideal: 70 },
  { nutrient: "Calcium", value: 40, ideal: 50 },
  { nutrient: "Magnesium", value: 30, ideal: 35 },
  { nutrient: "Sulfur", value: 45, ideal: 40 },
];

const radarData = npkData.map((d) => ({
  subject: d.nutrient.slice(0, 3),
  current: d.value,
  ideal: d.ideal,
}));

const moistureHistory = [
  { time: "6 AM", value: 72 },
  { time: "9 AM", value: 68 },
  { time: "12 PM", value: 58 },
  { time: "3 PM", value: 52 },
  { time: "6 PM", value: 60 },
  { time: "9 PM", value: 66 },
];

const SoilMonitoring = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Gauge className="text-primary" /> Soil & Weather Monitoring
          </h1>
          <p className="text-muted-foreground">Real-time sensor data from your farm</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <MetricCard title="Soil Moisture" value={65} unit="%" icon={Droplets} status="optimal" subtitle="Sensor A1" />
          <MetricCard title="Soil Temp" value={26} unit="°C" icon={Thermometer} status="optimal" />
          <MetricCard title="Soil pH" value={6.5} icon={FlaskRound} status="optimal" subtitle="Slightly acidic" />
          <MetricCard title="NPK Index" value={72} unit="/100" icon={Gauge} status="warning" subtitle="Low phosphorus" />
          <MetricCard title="Air Temp" value={31} unit="°C" icon={Thermometer} status="warning" />
          <MetricCard title="Humidity" value={74} unit="%" icon={Wind} status="optimal" />
          <MetricCard title="Rainfall" value={8} unit="mm" icon={CloudRain} subtitle="Today" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-display font-bold mb-4">Soil Moisture — Today</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={moistureHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,88%)" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(145,45%,32%)" radius={[4, 4, 0, 0]} name="Moisture %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-display font-bold mb-4">NPK Levels vs Ideal</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(140,15%,88%)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Current" dataKey="current" stroke="hsl(145,45%,32%)" fill="hsl(145,45%,32%)" fillOpacity={0.3} />
                <Radar name="Ideal" dataKey="ideal" stroke="hsl(35,60%,52%)" fill="hsl(35,60%,52%)" fillOpacity={0.1} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SoilMonitoring;
