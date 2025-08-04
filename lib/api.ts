const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5328";

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem("token");
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("token");
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const response = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async register(email: string, password: string, role: string) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
  }

  async calculateHarvest(cropType: string, area: number) {
    return this.request("/api/harvest/calculate", {
      method: "POST",
      body: JSON.stringify({ crop_type: cropType, area }),
    });
  }

  // inside class ApiClient
  async get<T>(endpoint: string): Promise<T> {
    return this.request(endpoint, { method: "GET" });
  }

  async detectDisease(image: File) {
    const formData = new FormData();
    formData.append("image", image);

    const response = await fetch(`${BASE_URL}/api/plant/detect`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Disease detection failed");
    }

    return response.json();
  }

  async getPlantingRecommendations(lat: number, lon: number) {
    return this.request(`/api/planting/recommendation?lat=${lat}&lon=${lon}`);
  }

  async getProducts() {
    return this.request("/api/ecommerce/products");
  }

  async addProduct(
    name: string,
    price: string,
    description: string,
    image: File
  ) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("image", image);

    const response = await fetch(`${BASE_URL}/api/ecommerce/sell`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Product upload failed");
    }

    return response.json();
  }

  async getArticles() {
    return this.request("/api/education/articles");
  }

  async getVideos() {
    return this.request("/api/education/videos");
  }

  async uploadArticle(title: string, content: string, image: File) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("image", image);

    const response = await fetch(`${BASE_URL}/api/education/articles/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Article upload failed");
    }

    return response.json();
  }

  async uploadVideo(title: string, description: string, video: File) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("video", video);

    const response = await fetch(`${BASE_URL}/api/education/videos/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Video upload failed");
    }

    return response.json();
  }
}

export const api = new ApiClient();
