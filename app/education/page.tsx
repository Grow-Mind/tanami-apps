"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleList } from "@/components/education/article-list";
import { VideoList } from "@/components/education/video-list";

export default function EducationPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Edukasi Pertanian
          </h1>
          <p className="text-xl text-muted-foreground">
            Pelajari teknik pertanian modern dari para ahli
          </p>
        </div>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="articles">Artikel</TabsTrigger>
            <TabsTrigger value="videos">Video</TabsTrigger>
          </TabsList>
          <TabsContent value="articles">
            <ArticleList />
          </TabsContent>
          <TabsContent value="videos">
            <VideoList />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
