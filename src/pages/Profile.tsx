import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { User, MapPin, Sprout, Ruler, Edit, Save, X, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  full_name: string;
  location: string;
  land_size: string;
  crops_grown: string[];
  farming_since: number | null;
  latitude: number | null;
  longitude: number | null;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [cropsInput, setCropsInput] = useState("");
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    location: "",
    land_size: "",
    crops_grown: [],
    farming_since: null,
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user!.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        location: data.location || "",
        land_size: data.land_size || "",
        crops_grown: data.crops_grown || [],
        farming_since: data.farming_since,
        latitude: data.latitude,
        longitude: data.longitude,
      });
      setCropsInput((data.crops_grown || []).join(", "));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const crops = cropsInput.split(",").map((c) => c.trim()).filter(Boolean);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        location: profile.location,
        land_size: profile.land_size,
        crops_grown: crops,
        farming_since: profile.farming_since,
        latitude: profile.latitude,
        longitude: profile.longitude,
      })
      .eq("user_id", user!.id);

    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } else {
      setProfile((p) => ({ ...p, crops_grown: crops }));
      toast({ title: "Profile saved!" });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setProfile((p) => ({ ...p, latitude: lat, longitude: lng }));

        // Reverse geocode
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const loc =
            data.address?.county || data.address?.city || data.address?.state || data.display_name;
          if (loc) setProfile((p) => ({ ...p, location: loc }));
        } catch {}
        setLocating(false);
      },
      () => {
        toast({ title: "Could not get location", variant: "destructive" });
        setLocating(false);
      }
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-40 bg-muted rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
                <User className="text-primary" /> Farmer Profile
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Keep your profile up to date  location improves weather and market suggestions.</p>
            </div>
            <div>
              {!editing ? (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Edit size={14} className="mr-2" /> Edit Profile
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-8 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shadow-sm">
                <User size={32} className="text-primary" />
              </div>
              <div className="flex-1">
                {editing ? (
                  <Input
                    value={profile.full_name}
                    onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                    placeholder="Your name"
                    className="font-display text-xl font-bold"
                  />
                ) : (
                  <h2 className="font-display text-xl font-bold">{profile.full_name || "Set your name"}</h2>
                )}
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="text-sm text-muted-foreground mt-2 flex items-center gap-3">
                  <MapPin size={14} />
                  <span className="font-medium">{profile.location || "Location not set"}</span>
                  {profile.latitude && profile.longitude && (
                    <span className="ml-auto text-xs text-muted-foreground">{profile.latitude.toFixed(3)}, {profile.longitude.toFixed(3)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="border-t border-muted/10 pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Profile Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Location */}
                <div className="rounded-lg bg-muted p-4">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin size={12} /> Location
                  </Label>
                  {editing ? (
                    <div className="space-y-2 mt-1">
                      <Input
                        value={profile.location}
                        onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                        placeholder="Your district/city"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGetLocation}
                        disabled={locating}
                      >
                        <Navigation size={14} className="mr-1" />
                        {locating ? "Detecting..." : "Use Current Location"}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <p className="font-display font-bold">{profile.location || "Not set"}</p>
                      {profile.latitude && profile.longitude && (
                        <p className="text-xs text-muted-foreground mt-1">Coordinates: {profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Land Size */}
                <div className="rounded-lg bg-muted p-4">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Ruler size={12} /> Land Size
                  </Label>
                  {editing ? (
                    <Input value={profile.land_size} onChange={(e) => setProfile((p) => ({ ...p, land_size: e.target.value }))} placeholder="e.g. 5.5 Acres" className="mt-1" />
                  ) : (
                    <p className="font-display font-bold">{profile.land_size || "Not set"}</p>
                  )}
                </div>

                {/* Farming Since */}
                <div className="rounded-lg bg-muted p-4">
                  <Label className="text-xs text-muted-foreground">Farming Since</Label>
                  {editing ? (
                    <Input type="number" value={profile.farming_since ?? ""} onChange={(e) => setProfile((p) => ({ ...p, farming_since: e.target.value ? Number(e.target.value) : null }))} placeholder="e.g. 2015" className="mt-1" />
                  ) : (
                    <p className="font-display font-bold">{profile.farming_since ? `Since ${profile.farming_since}` : "Not set"}</p>
                  )}
                </div>

                {/* Crops */}
                <div className="rounded-lg bg-muted p-4 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sprout size={12} /> Crops Grown
                  </Label>
                  {editing ? (
                    <div>
                      <Input value={cropsInput} onChange={(e) => setCropsInput(e.target.value)} placeholder="Rice, Wheat, Tomato (comma separated)" className="mt-1" />
                      <p className="text-xs text-muted-foreground mt-2">Separate multiple crops with commas. These help with price suggestions and alerts.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.crops_grown.length > 0 ? (
                        profile.crops_grown.map((c) => (
                          <span key={c} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{c}</span>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No crops added</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {editing ? (
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  <Save size={16} className="mr-2" /> {saving ? "Saving..." : "Save Profile"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  <X size={16} className="mr-2" /> Cancel
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right-side info panel */}
        <aside className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-sm font-semibold mb-2">Quick Actions</h4>
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="sm" onClick={handleGetLocation}>Use Current Location</Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit Profile</Button>
              <Button variant="ghost" size="sm" onClick={() => { setCropsInput(''); setProfile(p => ({...p, crops_grown: []})); toast({ title: 'Cleared crops' }); }}>Clear Crops</Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-sm font-semibold mb-2">Location</h4>
            <p className="text-sm text-muted-foreground">{profile.location || 'Not set'}</p>
            {profile.latitude && profile.longitude && (
              <p className="text-xs text-muted-foreground mt-2">Lat: {profile.latitude.toFixed(4)}  Lon: {profile.longitude.toFixed(4)}</p>
            )}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-sm font-semibold mb-2">Recent</h4>
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
