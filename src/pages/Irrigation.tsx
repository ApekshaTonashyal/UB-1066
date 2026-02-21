import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Droplets, Clock, Sprout, IndianRupee, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const cropOptions = [
  { name: "Rice (Paddy)", waterReq: 1200, fertDose: "120 kg/acre Urea", stage: "Vegetative" },
  { name: "Wheat", waterReq: 450, fertDose: "80 kg/acre DAP", stage: "Tillering" },
  { name: "Tomato", waterReq: 600, fertDose: "100 kg/acre NPK", stage: "Flowering" },
  { name: "Cotton", waterReq: 700, fertDose: "90 kg/acre Urea", stage: "Boll Formation" },
  { name: "Sugarcane", waterReq: 1500, fertDose: "150 kg/acre Urea", stage: "Grand Growth" },
];

const schedule = [
  { time: "6:00 AM", duration: "30 min", zone: "Zone A — Paddy", status: "completed" },
  { time: "10:00 AM", duration: "20 min", zone: "Zone B — Wheat", status: "upcoming" },
  { time: "4:00 PM", duration: "25 min", zone: "Zone C — Tomato", status: "upcoming" },
];

const Irrigation = () => {
  const [selectedCrop, setSelectedCrop] = useState(cropOptions[0]);
  const [pumpOn, setPumpOn] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Droplets className="text-primary" /> Irrigation Management
          </h1>
          <p className="text-muted-foreground">Smart watering based on soil, crop, and weather data</p>
        </div>

        {/* Pump Control */}
        <div className="rounded-xl border bg-card p-6 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg">Irrigation Pump</h3>
            <p className="text-sm text-muted-foreground">
              {pumpOn ? "Pump is running — Zone A" : "Pump is off"}
            </p>
          </div>
          <button
            onClick={() => setPumpOn(!pumpOn)}
            className="text-primary transition-transform hover:scale-110"
          >
            {pumpOn ? <ToggleRight size={48} /> : <ToggleLeft size={48} className="text-muted-foreground" />}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Crop Selection */}
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h3 className="font-display font-bold">Crop Requirements</h3>
            <Select
              value={selectedCrop.name}
              onValueChange={(v) => setSelectedCrop(cropOptions.find((c) => c.name === v)!)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cropOptions.map((c) => (
                  <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Water Requirement</p>
                <p className="font-display font-bold text-lg flex items-center gap-1">
                  <Droplets size={16} className="text-primary" /> {selectedCrop.waterReq} L/acre
                </p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Crop Stage</p>
                <p className="font-display font-bold text-lg flex items-center gap-1">
                  <Sprout size={16} className="text-primary" /> {selectedCrop.stage}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-3 col-span-2">
                <p className="text-xs text-muted-foreground">Fertilizer Dosage</p>
                <p className="font-display font-bold">{selectedCrop.fertDose}</p>
              </div>
            </div>

            <div className="rounded-lg bg-success/10 p-3 text-sm">
              <p className="font-bold text-success flex items-center gap-1">
                <IndianRupee size={14} /> Estimated Savings
              </p>
              <p className="text-muted-foreground">₹2,400/month vs traditional irrigation (≈30% reduction)</p>
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h3 className="font-display font-bold">Today's Schedule</h3>
            <div className="space-y-3">
              {schedule.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-lg p-3 border ${
                    s.status === "completed" ? "bg-success/5 border-success/20" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{s.zone}</p>
                      <p className="text-xs text-muted-foreground">{s.time} • {s.duration}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      s.status === "completed" ? "status-optimal" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.status === "completed" ? "Done" : "Upcoming"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Irrigation;
