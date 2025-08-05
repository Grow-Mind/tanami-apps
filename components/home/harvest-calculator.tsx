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
import { CalendarIcon, Calculator } from "lucide-react";
import { api } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; 
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function HarvestCalculator() {
  const [cropType, setCropType] = useState("");
  const [area, setArea] = useState("");
  const [price, setPrice] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!cropType || !area || !plantingDate) return;

    setLoading(true);
    try {
      const payload = {
        crop_type: cropType,
        area: parseFloat(area),
        planting_date: plantingDate,
        price_per_kg: price ? parseFloat(price) : undefined,
      };

      const data = await api.calculateHarvest(
        cropType,
        parseFloat(area),
        plantingDate,
        price ? parseFloat(price) : undefined
      );

      setResult(data);
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
                  <SelectItem value="cabai">Cabai</SelectItem>
                  <SelectItem value="tomat">Tomat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Luas Lahan (m²)
              </label>
              <Input
                type="number"
                placeholder="Masukkan luas lahan"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Harga per kg (opsional)
              </label>
              <Input
                type="number"
                placeholder="Harga jual/kg"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tanggal Tanam
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-left font-normal text-white shadow-sm">
                    {plantingDate ? (
                      format(new Date(plantingDate), "dd MMMM yyyy", {
                        locale: id,
                      })
                    ) : (
                      <span className="text-muted-foreground">
                        Pilih tanggal
                      </span>
                    )}
                    <CalendarIcon className="ml-2 h-4 w-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={plantingDate ? new Date(plantingDate) : undefined}
                    onSelect={(date) => {
                      if (date)
                        setPlantingDate(date.toISOString().split("T")[0]); // simpan sebagai yyyy-mm-dd
                    }}
                    locale={id}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            className="w-full mt-6"
            onClick={handleCalculate}
            disabled={!cropType || !area || !plantingDate || loading}
          >
            <Calculator className="mr-2 h-4 w-4" />
            {loading ? "Menghitung..." : "Hitung Estimasi"}
          </Button>

          {result && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-2">
              <p className="text-center text-xl font-semibold">
                Estimasi Hasil Panen
              </p>
              <ul className="text-sm space-y-1 text-center">
                <li>
                  <strong>Jenis Tanaman:</strong> {result.crop_type}
                </li>
                <li>
                  <strong>Luas Lahan:</strong> {area} m²
                </li>
                <li>
                  <strong>Estimasi Hasil:</strong>{" "}
                  {result.estimated_yield.toLocaleString()} kg
                </li>
                <li>
                  <strong>Harga per Kg:</strong> Rp{" "}
                  {result.price_per_kg.toLocaleString()}
                </li>
                <li>
                  <strong>Total Estimasi Pendapatan:</strong>{" "}
                  <span className="text-green-600 font-bold">
                    Rp {result.estimated_income.toLocaleString()}
                  </span>
                </li>
                <li>
                  <strong>Estimasi Panen:</strong>{" "}
                  {format(
                    new Date(result.estimated_harvest_date),
                    "dd MMMM yyyy",
                    { locale: id }
                  )}
                </li>
              </ul>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
