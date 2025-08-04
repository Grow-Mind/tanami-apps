"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FarmerDashboard } from "@/components/ecommerce/farmer-dashboard";

export default function FarmerDashboardPage() {
  return (
    <ProtectedRoute role="petani">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Dashboard Petani
          </h1>
          <p className="text-xl text-muted-foreground">
            Kelola produk Anda dan pantau penjualan
          </p>
        </div>

        <FarmerDashboard />
      </div>
    </ProtectedRoute>
  );
}
