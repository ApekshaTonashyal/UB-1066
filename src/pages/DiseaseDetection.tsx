import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Camera,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Shield,
} from "lucide-react";

interface DiagnosisResult {
  disease: string;
  confidence: number;
  severity: "healthy" | "moderate" | "severe";
  treatment: string[];
  prevention: string[];
}

const mockResult: DiagnosisResult = {
  disease: "Late Blight (Phytophthora infestans)",
  confidence: 94.2,
  severity: "severe",
  treatment: [
    "Apply Mancozeb fungicide at 2.5g/L immediately",
    "Remove and destroy affected leaves",
    "Improve air circulation around plants",
  ],
  prevention: [
    "Use disease-resistant varieties",
    "Avoid overhead irrigation",
    "Rotate crops every season",
    "Apply preventive fungicide before monsoon",
  ],
};

const severityConfig = {
  healthy: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Healthy" },
  moderate: { color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle, label: "Moderate" },
  severe: { color: "bg-red-100 text-red-700", icon: AlertTriangle, label: "Severe" },
};

const DiseaseDetection = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /** Upload Handler */
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  /** AI Analysis Simulation */
  const analyze = () => {
    setLoading(true);
    setTimeout(() => {
      setResult(mockResult);
      setLoading(false);
    }, 2000);
  };

  /** Camera Start / Stop */
  const openCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera not supported on this device.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Camera Access Error:", error);
      alert("Unable to access camera. Please allow permissions or use file upload.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  /** Capture Frame from Video */
  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setImage(dataUrl);
    stopCamera();
  };

  /** Clean up camera when leaving component */
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const sev = result ? severityConfig[result.severity] : null;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Leaf className="text-green-600" /> Crop Disease Detection
          </h1>
          <p className="text-gray-500">
            Upload or capture a crop leaf image for AI diagnosis.
          </p>
        </div>

        {/* Upload / Camera */}
        <div className="rounded-xl border p-8">
          {!image ? (
            <div className="flex flex-col items-center justify-center h-72 border-2 border-dashed rounded-lg">
              <Upload size={40} className="text-gray-400 mb-3" />
              <span className="font-bold text-lg">Upload or Capture Image</span>
              <div className="flex gap-3 mt-4">
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload size={16} className="mr-2" /> Browse
                </Button>
                <Button variant="outline" onClick={openCamera}>
                  <Camera size={16} className="mr-2" /> Camera
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <img
                src={image}
                alt="Leaf"
                className="w-full max-h-96 object-contain rounded-lg"
              />
              <div className="flex gap-3">
                <Button onClick={analyze} disabled={loading} className="flex-1">
                  {loading ? "Analyzing..." : "Analyze with AI"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImage(null);
                    setResult(null);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}

          {/* Camera Modal */}
          {cameraActive && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-md">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-md bg-black"
                />
                <div className="flex gap-3 mt-4">
                  <Button onClick={captureImage} className="flex-1">
                    Capture
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Result Section */}
        {result && sev && (
          <div className="rounded-xl border p-6 space-y-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-xl">{result.disease}</h3>
                <p className="text-sm text-gray-500">
                  Confidence: {result.confidence.toFixed(1)}%
                </p>
              </div>
              <span
                className={`${sev.color} px-3 py-1 rounded-full text-xs flex items-center gap-1`}
              >
                <sev.icon size={14} /> {sev.label}
              </span>
            </div>

            <div>
              <h4 className="font-bold flex items-center gap-2">
                <Shield size={16} /> Treatment
              </h4>
              <ul className="list-disc ml-5 text-sm">
                {result.treatment.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold flex items-center gap-2">
                <CheckCircle size={16} /> Prevention
              </h4>
              <ul className="list-disc ml-5 text-sm">
                {result.prevention.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DiseaseDetection;
