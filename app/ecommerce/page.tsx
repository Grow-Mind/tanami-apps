"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProductList } from "@/components/ecommerce/product-list";

export default function EcommercePage() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Tanami Market</h1>
          <p className="text-xl text-muted-foreground">
            Beli dan jual hasil pertanian langsung dari petani lokal
          </p>
        </div>

        <ProductList />
      </div>
    </ProtectedRoute>
  );
}
