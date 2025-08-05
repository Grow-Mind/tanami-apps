"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Leaf, Camera, Upload } from "lucide-react";
import Image from "next/image";
import { api } from "@/lib/api";

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      alert("Tidak bisa mengakses kamera.");
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    setPhoto(imageData);
    stopCamera();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const handleDetect = async () => {
    if (!photo) return;
    setLoading(true);

    try {
      const res = await fetch(photo);
      const blob = await res.blob();
      const file = new File([blob], "image.png", { type: "image/png" });

      const data = await api.detectDisease(file);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Gagal mendeteksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <Card className="p-4 sm:p-6 w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Leaf className="h-5 w-5 text-green-600" />
          Deteksi Penyakit Tanaman
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* KIRI: Video atau Gambar */}
          <div className="w-full flex justify-center">
            {!photo ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded-md w-full h-auto max-h-[70vh] shadow-md"
              />
            ) : (
              <Image
                src={photo}
                alt="Hasil Foto"
                width={500}
                height={500}
                className="rounded-md object-cover w-full h-auto max-h-[70vh]"
              />
            )}
          </div>

          {/* KANAN: Tombol dan Hasil */}
          <div className="flex flex-col gap-4">
            {!photo ? (
              <>
                <Button onClick={startCamera} className="w-full">
                  <Camera className="mr-2 h-4 w-4" /> Mulai Kamera
                </Button>
                <Button
                  onClick={takePhoto}
                  variant="secondary"
                  className="w-full"
                >
                  Ambil Gambar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload dari Galeri
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  className="hidden"
                />
              </>
            ) : (
              <>
                <Button
                  onClick={handleDetect}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Mendeteksi..." : "Deteksi Penyakit"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhoto(null);
                    setResult(null);
                    startCamera();
                  }}
                  className="w-full"
                >
                  Ambil Ulang / Ganti
                </Button>
              </>
            )}

            {/* Hasil deteksi */}
            {result && (
              <Card
                className={`p-4 ${
                  result.category === "health"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                    : result.category === "early"
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                    : result.category === "late"
                    ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                    : "bg-gray-50"
                }`}
              >
                <p className="font-bold text-lg capitalize">
                  {result.disease_class.replaceAll("_", " ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tingkat keyakinan: {(result.confidence * 100).toFixed(2)}%
                </p>
                {result.recommendation && (
                  <p className="text-sm mt-2">{result.recommendation}</p>
                )}
              </Card>
            )}
          </div>
        </div>
      </CardContent>

      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
}
