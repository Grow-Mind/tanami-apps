"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Loader2 } from "lucide-react";
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
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async (cropId: string) => {
    setLoading(true);
    try {
      const url = `/planting/recommendations?crop_id=${cropId}`;
      const data = await api.get<any>(url);
      setList(Array.isArray(data) ? data : [data]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(selectedCrop);
  }, [selectedCrop]);

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Rekomendasi Waktu Tanam Indonesia
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pilih tanaman untuk melihat rekomendasi cuaca saat ini
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dropdown pilihan tanaman */}
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

        {/* Hasil */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Memuat…</span>
          </div>
        ) : (
          <div className="grid gap-4">
            {list.map((rec) => (
              <Card key={rec.id} className="p-4">
                <h4 className="font-semibold">{rec.crop}</h4>
                <p className="text-sm text-muted-foreground">
                  Status:{" "}
                  <span className="text-green-600">{rec.statusText}</span>
                </p>
                <p className="text-sm">{rec.recommendation}</p>
                {rec.bestDates?.length > 0 && (
                  <p className="text-sm mt-2">
                    Tanggal terbaik: {rec.bestDates.join(", ")}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
