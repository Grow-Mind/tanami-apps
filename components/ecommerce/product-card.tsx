import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    farmer?: {
      name?: string;
    };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative">
        <Image
          src={product.image || "/placeholder-image.jpg"} // Fallback image
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {product.description}
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          Oleh: {product.farmer?.name || "Petani Lokal"}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-green-600">
            Rp {Number(product.price).toLocaleString("id-ID")}
          </span>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Beli
          </Button>
        </div>
      </div>
    </Card>
  );
}
