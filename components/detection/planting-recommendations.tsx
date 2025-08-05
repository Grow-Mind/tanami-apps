"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CloudSun,
  Thermometer,
  Droplets,
  CloudRain,
  MapPin,
  Search,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";

const CROPS = [
  { id: "all", name: "Semua Tanaman" },
  { id: "padi", name: "Padi" },
  { id: "jagung", name: "Jagung" },
  { id: "kedelai", name: "Kedelai" },
  { id: "cabai", name: "Cabai" },
  { id: "tomat", name: "Tomat" },
  { id: "bawang_merah", name: "Bawang Merah" },
  { id: "bawang_putih", name: "Bawang Putih" },
  { id: "kentang", name: "Kentang" },
  { id: "wortel", name: "Wortel" },
  { id: "bayam", name: "Bayam" },
  { id: "kangkung", name: "Kangkung" },
  { id: "sawi", name: "Sawi" },
  { id: "terong", name: "Terong" },
  { id: "timun", name: "Timun" },
  { id: "labu", name: "Labu" },
  { id: "kacang_tanah", name: "Kacang Tanah" },
  { id: "kacang_panjang", name: "Kacang Panjang" },
  { id: "singkong", name: "Singkong" },
  { id: "ubi_jalar", name: "Ubi Jalar" },
  { id: "buncis", name: "Buncis" },
];

export function PlantingRecommendations() {
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [list, setList] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchLocation = async () => {
    setError("");
    setList([]);
    if (locationQuery.length < 3) {
      setError("Masukkan minimal 3 karakter lokasi.");
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationQuery
        )}`
      );
      const data = await res.json();
      if (data.length === 0) {
        setError("Lokasi tidak ditemukan.");
        return;
      }
      const loc = data[0];
      setLocationCoords({ lat: parseFloat(loc.lat), lon: parseFloat(loc.lon) });

      fetchRecommendations(parseFloat(loc.lat), parseFloat(loc.lon), selectedCrop);
    } catch (err) {
      setError("Gagal mencari lokasi.");
    }
  };

  const fetchRecommendations = async (
    lat: number,
    lon: number,
    cropId: string
  ) => {
    setLoading(true);
    setError("");
    try {
      const url = `/api/planting/recommendations?crop_id=${cropId}&lat=${lat}&lon=${lon}`;
      const data = await api.get<any>(url);
      setList(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError("Gagal memuat rekomendasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Rekomendasi Waktu Tanam
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pilih lokasi dan tanaman untuk melihat rekomendasi berdasarkan prediksi cuaca.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">Cari Lokasi</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Contoh: Tegal, Yogyakarta"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Pilih Tanaman</label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tanaman" />
              </SelectTrigger>
              <SelectContent>
                {CROPS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={searchLocation}
            className="flex items-center justify-center gap-2 bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
          >
            <Search className="w-4 h-4" />
            Cari
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-6 text-center text-muted-foreground">Memuat data…</div>
        ) : list.length > 0 ? (
          <div className="grid gap-6">
            {list.map((rec, index) => (
              <Card
                key={index}
                className="p-5 shadow border-l-4"
                style={{
                  borderColor:
                    rec.status === "good"
                      ? "#22c55e"
                      : rec.status === "moderate"
                      ? "#facc15"
                      : "#ef4444",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <CloudSun className="text-blue-500" />
                  <h4 className="text-lg font-semibold">{rec.statusText}</h4>
                </div>

                <p className="text-sm mb-3 text-muted-foreground">
                  {rec.recommendation}
                </p>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Suhu Rata-rata: {rec.avgTemp}°C
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    Kelembapan: {rec.avgHumidity}%
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4" />
                    Curah Hujan: {rec.totalRainfall} mm
                  </div>
                  {rec.bestDates?.length > 0 && (
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="w-4 h-4" />
                      Tanggal terbaik: {rec.bestDates.join(", ")}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
