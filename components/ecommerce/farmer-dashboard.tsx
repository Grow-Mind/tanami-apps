"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { Upload, Plus } from "lucide-react";
import Image from "next/image";

export function FarmerDashboard() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !formData.name || !formData.price || !formData.description)
      return;

    setLoading(true);
    try {
      await api.addProduct(
        formData.name,
        formData.price,
        formData.description,
        image
      );

      // Reset form
      setFormData({ name: "", price: "", description: "" });
      setImage(null);
      setPreview(null);
      setShowAddProduct(false);

      // Reload products
      window.location.reload();
    } catch (error) {
      console.error("Failed to add product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Produk Saya</h2>
        <Button onClick={() => setShowAddProduct(!showAddProduct)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {showAddProduct && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nama Produk
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: Cabai Merah"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Harga (Rp)
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="25000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Deskripsi
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Deskripsi singkat produk"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Gambar Produk
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="product-image"
              />
              <label htmlFor="product-image" className="cursor-pointer">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Klik untuk upload gambar
                    </p>
                  </div>
                )}
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Produk"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddProduct(false);
                  setFormData({ name: "", price: "", description: "" });
                  setImage(null);
                  setPreview(null);
                }}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Products list would go here */}
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Daftar produk Anda akan muncul di sini
        </p>
      </Card>
    </div>
  );
}
