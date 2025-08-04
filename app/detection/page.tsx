"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiseaseDetector } from "@/components/detection/disease-detector";
import { PlantingRecommendations } from "@/components/detection/planting-recommendations";

export default function DetectionPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Deteksi & Rekomendasi Tanaman
          </h1>
          <p className="text-xl text-muted-foreground">
            Gunakan AI untuk mendeteksi penyakit tanaman dan dapatkan
            rekomendasi waktu tanam terbaik
          </p>
        </div>

        <Tabs defaultValue="disease" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="disease">Deteksi Penyakit</TabsTrigger>
            <TabsTrigger value="recommendation">Rekomendasi Tanam</TabsTrigger>
          </TabsList>
          <TabsContent value="disease">
            <DiseaseDetector />
          </TabsContent>
          <TabsContent value="recommendation">
            <PlantingRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
