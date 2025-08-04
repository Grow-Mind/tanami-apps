import { Card } from "@/components/ui/card";
import { Shield, Clock, Zap, Award } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Keamanan Terjamin",
    description:
      "Data Anda aman dengan enkripsi tingkat tinggi dan privasi terjaga.",
  },
  {
    icon: Clock,
    title: "Real-time Monitoring",
    description:
      "Pantau kondisi tanaman Anda secara real-time dengan sensor canggih.",
  },
  {
    icon: Zap,
    title: "AI Powered",
    description:
      "Teknologi AI terkini untuk deteksi penyakit dan rekomendasi optimal.",
  },
  {
    icon: Award,
    title: "Terpercaya",
    description: "Telah digunakan oleh ribuan petani di seluruh Indonesia.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Kenapa Memilih Tanami?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kami hadir untuk membantu petani Indonesia meningkatkan hasil panen
            dengan teknologi modern dan terjangkau.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
