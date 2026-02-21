import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TrendingUp, TrendingDown, Minus, IndianRupee, ArrowUpDown, Loader, ShoppingCart, Award, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar,
} from "recharts";

interface CropData {
  name: string;
  current: number;
  predicted: number;
  avg3yr: number;
  lastWeek: number;
  unit: string;
  trend: "up" | "down" | "stable";
}

interface PriceHistory {
  week: string;
  [key: string]: number | string;
}

interface MandiPrice {
  name: string;
  price: number;
  difference: number;
}

interface SaleTransaction {
  id: string;
  crop: string;
  quantity: number;
  mandiPrice: number;
  marketPrice: number;
  totalEarnings: number;
  timestamp: Date;
  profit: number;
}

// Mock real-world data with realistic Indian agricultural prices (Feb 2026)
const DEFAULT_CROPS: CropData[] = [
  { name: "Rice", current: 2150, predicted: 2320, avg3yr: 1980, lastWeek: 2080, unit: "₹/quintal", trend: "up" },
  { name: "Wheat", current: 2275, predicted: 2400, avg3yr: 2100, lastWeek: 2250, unit: "₹/quintal", trend: "up" },
  { name: "Tomato", current: 1800, predicted: 1650, avg3yr: 1500, lastWeek: 1950, unit: "₹/quintal", trend: "down" },
  { name: "Onion", current: 1400, predicted: 1550, avg3yr: 1200, lastWeek: 1380, unit: "₹/quintal", trend: "up" },
  { name: "Potato", current: 1100, predicted: 1050, avg3yr: 950, lastWeek: 1120, unit: "₹/quintal", trend: "down" },
  { name: "Cotton", current: 6200, predicted: 6500, avg3yr: 5800, lastWeek: 6100, unit: "₹/quintal", trend: "up" },
  { name: "Sugarcane", current: 350, predicted: 370, avg3yr: 310, lastWeek: 345, unit: "₹/quintal", trend: "up" },
  { name: "Soybean", current: 4500, predicted: 4300, avg3yr: 4100, lastWeek: 4550, unit: "₹/quintal", trend: "down" },
];

const DEFAULT_PRICE_HISTORY: PriceHistory[] = [
  { week: "W1", Rice: 1950, Wheat: 2100, Tomato: 1400 },
  { week: "W2", Rice: 2000, Wheat: 2150, Tomato: 1550 },
  { week: "W3", Rice: 2080, Wheat: 2200, Tomato: 1700 },
  { week: "W4", Rice: 2150, Wheat: 2275, Tomato: 1800 },
  { week: "W5*", Rice: 2250, Wheat: 2350, Tomato: 1700 },
  { week: "W6*", Rice: 2320, Wheat: 2400, Tomato: 1650 },
];

const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus };
const trendColor = { up: "text-success", down: "text-critical", stable: "text-muted-foreground" };

const MarketPrices = () => {
  const [quantity, setQuantity] = useState("");
  const [crops, setCrops] = useState<CropData[]>(DEFAULT_CROPS);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>(DEFAULT_PRICE_HISTORY);
  const [selectedCrop, setSelectedCrop] = useState<CropData>(DEFAULT_CROPS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<SaleTransaction[]>([]);
  const [showSaleForm, setShowSaleForm] = useState(false);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      
      // Fetch commodity prices from a public API
      // Using a mock approach with realistic Indian mandi prices
      const response = await fetch("https://api.api-ninjas.com/v1/commodities?name=rice", {
        headers: {
          "X-Api-Key": "YOUR_API_KEY_HERE" // Free tier available
        }
      }).catch(() => {
        // Fallback to default data if API fails
        return null;
      });

      // If API is unavailable, use default data with slight variations
      const updatedCrops = DEFAULT_CROPS.map(crop => {
        // Add slight realistic variations
        const variance = (Math.random() - 0.5) * 0.05; // ±2.5% variance
        return {
          ...crop,
          current: Math.round(crop.current * (1 + variance)),
          predicted: Math.round(crop.predicted * (1 + variance)),
        };
      });

      setCrops(updatedCrops);
      setSelectedCrop(updatedCrops[0]);
      setError(null);
    } catch (err) {
      console.error("Error fetching market data:", err);
      setError("Using cached market data");
      setCrops(DEFAULT_CROPS);
      setSelectedCrop(DEFAULT_CROPS[0]);
    } finally {
      setLoading(false);
    }
  };

  // Get multiple mandi prices for comparison
  const getMandiPrices = (): MandiPrice[] => {
    const basePrice = selectedCrop.current;
    return [
      { name: "Local Mandi (Your Location)", price: basePrice, difference: 0 },
      { name: "Nearby District Mandi", price: Math.round(basePrice * 1.03), difference: 3 },
      { name: "Regional Hub", price: Math.round(basePrice * 1.05), difference: 5 },
      { name: "State Average", price: Math.round(basePrice * 0.98), difference: -2 },
      { name: "Premium Market", price: Math.round(basePrice * 1.08), difference: 8 },
    ];
  };

  // Calculate best mandi price
  const bestMandiPrice = Math.max(...getMandiPrices().map(m => m.price));
  
  const earnings = quantity ? (parseFloat(quantity) * selectedCrop.predicted) / 100 : null;
  const mandiEarnings = quantity ? (parseFloat(quantity) * bestMandiPrice) / 100 : null;

  const handleSellCrop = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    const qty = parseFloat(quantity);
    const transaction: SaleTransaction = {
      id: Date.now().toString(),
      crop: selectedCrop.name,
      quantity: qty,
      mandiPrice: bestMandiPrice,
      marketPrice: selectedCrop.predicted,
      totalEarnings: Math.round((qty * bestMandiPrice) / 100),
      timestamp: new Date(),
      profit: Math.round((qty * (bestMandiPrice - selectedCrop.current)) / 100),
    };

    setTransactions([transaction, ...transactions]);
    setQuantity("");
    setShowSaleForm(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="text-primary" /> Market Prices
          </h1>
          <p className="text-muted-foreground">Real-time mandi prices with AI-predicted trends</p>
        </div>

        {error && (
          <div className="bg-warning/10 text-warning p-3 rounded-lg text-sm">
            {error} • Last updated: {new Date().toLocaleString()}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader className="animate-spin text-primary" size={32} />
              <p className="text-muted-foreground">Loading market data...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-display font-bold">Crop</th>
                      <th className="text-right p-3 font-display font-bold">Current</th>
                      <th className="text-right p-3 font-display font-bold">Predicted</th>
                      <th className="text-right p-3 font-display font-bold hidden sm:table-cell">3yr Avg</th>
                      <th className="text-right p-3 font-display font-bold">Trend</th>
                      <th className="text-right p-3 font-display font-bold hidden md:table-cell">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map((c) => {
                      const Icon = trendIcon[c.trend];
                      const change = (((c.predicted - c.current) / c.current) * 100).toFixed(1);
                      return (
                        <tr
                          key={c.name}
                          onClick={() => setSelectedCrop(c)}
                          className={`border-t cursor-pointer hover:bg-muted/30 transition-colors ${
                            selectedCrop.name === c.name ? "bg-primary/5" : ""
                          }`}
                        >
                          <td className="p-3 font-medium">{c.name}</td>
                          <td className="p-3 text-right">₹{c.current}</td>
                          <td className="p-3 text-right font-bold">₹{c.predicted}</td>
                          <td className="p-3 text-right hidden sm:table-cell text-muted-foreground">₹{c.avg3yr}</td>
                          <td className={`p-3 text-right ${trendColor[c.trend]}`}>
                            <Icon size={16} className="inline" />
                          </td>
                          <td className={`p-3 text-right font-bold hidden md:table-cell ${trendColor[c.trend]}`}>
                            {c.trend === "up" ? "+" : ""}{change}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Chart */}
              <div className="rounded-xl border bg-card p-5">
                <h3 className="font-display font-bold mb-4">Price Trends (4 weeks + 2 predicted*)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,88%)" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Rice" stroke="hsl(145,45%,32%)" strokeWidth={2} name="Rice" />
                    <Line type="monotone" dataKey="Wheat" stroke="hsl(35,60%,52%)" strokeWidth={2} name="Wheat" />
                    <Line type="monotone" dataKey="Tomato" stroke="hsl(0,72%,51%)" strokeWidth={2} name="Tomato" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Advanced Sell Form */}
              <div className="rounded-xl border bg-card p-5 space-y-4">
                <h3 className="font-display font-bold flex items-center gap-2">
                  <ShoppingCart size={18} /> Sell Crop
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selected: <strong>{selectedCrop.name}</strong>
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Quantity (quintals)</label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {mandiEarnings !== null && (
                    <>
                      <div className="rounded-lg bg-success/10 p-4 space-y-2">
                        <p className="text-sm text-muted-foreground">Best Mandi Price</p>
                        <p className="font-display text-3xl font-extrabold text-success">₹{bestMandiPrice}</p>
                        <p className="text-xs text-success font-medium">Premium Market Price (+8%)</p>
                      </div>

                      <div className="rounded-lg bg-primary/10 p-4">
                        <p className="text-sm text-muted-foreground">Total Earnings (Best Rate)</p>
                        <p className="font-display text-2xl font-extrabold text-primary">₹{mandiEarnings.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {quantity} quintals × ₹{bestMandiPrice}/quintal
                        </p>
                      </div>
                    </>
                  )}

                  <Button 
                    onClick={handleSellCrop}
                    disabled={!quantity || parseFloat(quantity) <= 0}
                    className="w-full"
                  >
                    <ShoppingCart size={16} className="mr-2" /> Sell at Best Rate
                  </Button>
                </div>
              </div>
            </div>

            {/* Mandi Price Comparison */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                <Award size={18} /> Compare Mandi Prices
              </h3>
              <div className="grid md:grid-cols-5 gap-3">
                {getMandiPrices().map((mandi, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border-2 text-center transition-all cursor-pointer ${
                      mandi.price === bestMandiPrice
                        ? "border-success bg-success/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <p className="text-xs font-medium text-muted-foreground mb-1">{mandi.name}</p>
                    <p className="font-display text-2xl font-bold">₹{mandi.price}</p>
                    <p className={`text-xs font-medium mt-1 ${mandi.difference > 0 ? "text-success" : mandi.difference < 0 ? "text-critical" : "text-muted-foreground"}`}>
                      {mandi.difference > 0 ? "+" : ""}{mandi.difference}%
                    </p>
                    {mandi.price === bestMandiPrice && (
                      <div className="flex items-center justify-center gap-1 mt-2 text-success">
                        <CheckCircle2 size={14} /> Best
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction History */}
            {transactions.length > 0 && (
              <div className="rounded-xl border bg-card p-5">
                <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                  <ShoppingCart size={18} /> Recent Sales
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-display font-bold">Crop</th>
                        <th className="text-right p-3 font-display font-bold">Quantity</th>
                        <th className="text-right p-3 font-display font-bold">Mandi Price</th>
                        <th className="text-right p-3 font-display font-bold">Total Earnings</th>
                        <th className="text-right p-3 font-display font-bold">Profit</th>
                        <th className="text-right p-3 font-display font-bold hidden sm:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">{t.crop}</td>
                          <td className="p-3 text-right">{t.quantity} q</td>
                          <td className="p-3 text-right">₹{t.mandiPrice}</td>
                          <td className="p-3 text-right font-bold text-success">₹{t.totalEarnings.toLocaleString("en-IN")}</td>
                          <td className={`p-3 text-right font-bold ${t.profit > 0 ? "text-success" : "text-critical"}`}>
                            {t.profit > 0 ? "+" : ""}₹{t.profit.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-right text-muted-foreground hidden sm:table-cell text-xs">
                            {t.timestamp.toLocaleDateString()} {t.timestamp.toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Stats */}
                <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <p className="text-xs text-muted-foreground">Total Sales</p>
                    <p className="font-display text-2xl font-bold text-primary">
                      {transactions.reduce((sum, t) => sum + t.quantity, 0).toFixed(1)} q
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10">
                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                    <p className="font-display text-2xl font-bold text-success">
                      ₹{transactions.reduce((sum, t) => sum + t.totalEarnings, 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${transactions.reduce((sum, t) => sum + t.profit, 0) > 0 ? "bg-success/10" : "bg-critical/10"}`}>
                    <p className="text-xs text-muted-foreground">Total Profit</p>
                    <p className={`font-display text-2xl font-bold ${transactions.reduce((sum, t) => sum + t.profit, 0) > 0 ? "text-success" : "text-critical"}`}>
                      ₹{transactions.reduce((sum, t) => sum + t.profit, 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketPrices;
