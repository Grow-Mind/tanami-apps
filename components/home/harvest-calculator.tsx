"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { api } from "@/lib/api";

export function HarvestCalculator() {
  const [cropType, setCropType] = useState("");
  const [area, setArea] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!cropType || !area) return;

    setLoading(true);
    try {
      const data = await api.calculateHarvest(cropType, parseFloat(area));
      setResult(data.estimated_yield);
    } catch (error) {
      console.error("Calculation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Kalkulator Hasil Panen
          </h2>
          <p className="text-xl text-muted-foreground">
            Hitung estimasi hasil panen Anda berdasarkan jenis tanaman dan luas
            lahan
          </p>
        </div>

        <Card className="p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Jenis Tanaman
              </label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis tanaman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="padi">Padi</SelectItem>
                  <SelectItem value="jagung">Jagung</SelectItem>
                  <SelectItem value="kedelai">Kedelai</SelectItem>
                  <SelectItem value="cabe">Cabai</SelectItem>
                  <SelectItem value="tomat">Tomat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Luas Lahan (hektar)
              </label>
              <Input
                type="number"
                placeholder="Masukkan luas lahan"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full mt-6"
            onClick={handleCalculate}
            disabled={!cropType || !area || loading}
          >
            <Calculator className="mr-2 h-4 w-4" />
            {loading ? "Menghitung..." : "Hitung Estimasi"}
          </Button>

          {result !== null && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-center">
                <span className="text-2xl font-bold text-green-600">
                  {result.toLocaleString()}
                </span>{" "}
                kg
              </p>
              <p className="text-center text-sm text-muted-foreground mt-1">
                Estimasi hasil panen untuk {cropType} di lahan {area} hektar
              </p>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
