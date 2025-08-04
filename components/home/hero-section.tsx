"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative -mt-20 min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-green-900/20 dark:via-background dark:to-green-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Revolusi Pertanian <span className="text-green-600">Digital</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Optimalkan hasil panen Anda dengan teknologi AI canggih, edukasi
            lengkap, dan pasar digital yang terpercaya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/detection">
                Mulai Deteksi <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/education">Pelajari Lebih</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
