import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import {
  Leaf,
  CloudSun,
  Droplets,
  TrendingUp,
  Thermometer,
  Wind,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const soilData = [
  { day: "Mon", moisture: 65, temp: 28 },
  { day: "Tue", moisture: 60, temp: 30 },
  { day: "Wed", moisture: 72, temp: 26 },
  { day: "Thu", moisture: 68, temp: 27 },
  { day: "Fri", moisture: 55, temp: 31 },
  { day: "Sat", moisture: 70, temp: 29 },
  { day: "Sun", moisture: 74, temp: 25 },
];

const alerts = [
  { type: "warning", text: "Heavy rain expected tomorrow — delay irrigation", icon: AlertTriangle },
  { type: "success", text: "Soil moisture optimal for rice paddies", icon: CheckCircle },
  { type: "warning", text: "Wheat prices rising — consider selling this week", icon: TrendingUp },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Farmer! Here's your farm overview.</p>
        </div>

        {/* Alerts */}
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg p-3 text-sm font-medium animate-fade-in ${
                a.type === "warning"
                  ? "bg-warning/10 text-warning"
                  : "bg-success/10 text-success"
              }`}
            >
              <a.icon size={18} />
              {a.text}
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Soil Moisture" value={68} unit="%" icon={Droplets} status="optimal" />
          <MetricCard title="Temperature" value={29} unit="°C" icon={Thermometer} status="optimal" />
          <MetricCard title="Humidity" value={72} unit="%" icon={Wind} status="warning" />
          <MetricCard title="Rainfall" value={12} unit="mm" icon={CloudSun} subtitle="Last 24h" />
        </div>

        {/* Chart */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-display font-bold mb-4">Soil Conditions — This Week</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={soilData}>
              <defs>
                <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(145,45%,32%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(145,45%,32%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,88%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="moisture" stroke="hsl(145,45%,32%)" fill="url(#moistureGrad)" name="Moisture %" />
              <Area type="monotone" dataKey="temp" stroke="hsl(35,60%,52%)" fill="hsl(35,60%,52%)" fillOpacity={0.1} name="Temp °C" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Leaf, title: "Scan Crop", desc: "Detect diseases instantly", link: "/disease" },
            { icon: CloudSun, title: "Weather", desc: "7-day forecast", link: "/weather" },
            { icon: TrendingUp, title: "Prices", desc: "Check mandi rates", link: "/market" },
          ].map((q) => (
            <a
              key={q.title}
              href={q.link}
              className="rounded-xl border bg-card p-5 flex items-center gap-4 hover:shadow-md transition-all group"
            >
              <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                <q.icon size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="font-display font-bold">{q.title}</h4>
                <p className="text-sm text-muted-foreground">{q.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
