// components/layout/footer.tsx
"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background/95 border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <div className="flex justify-center space-x-4 text-sm">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/detection" className="hover:underline">
            Deteksi
          </Link>
          <Link href="/education" className="hover:underline">
            Edukasi
          </Link>
          <Link href="/ecommerce" className="hover:underline">
            Market
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Tanami. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
