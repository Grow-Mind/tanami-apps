"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Leaf, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import Image from "next/image";

export function DiseaseDetector() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleDetect = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const data = await api.detectDisease(image);
      setResult(data);
    } catch (error) {
      console.error("Detection failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-4">
            Upload Gambar Daun Tanaman
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              {preview ? (
                <Image
                  src={preview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="mx-auto rounded-lg object-cover"
                />
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Klik untuk upload gambar
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {image && (
          <Button onClick={handleDetect} disabled={loading} className="w-full">
            <Leaf className="mr-2 h-4 w-4" />
            {loading ? "Mendeteksi..." : "Deteksi Penyakit"}
          </Button>
        )}

        {result && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Hasil Deteksi</h3>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="font-medium">{result.disease}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.confidence}% confidence
              </p>
              {result.recommendation && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Rekomendasi:</span>
                  </div>
                  <p className="text-sm mt-1">{result.recommendation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
