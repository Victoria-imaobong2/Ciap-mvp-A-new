// src/services/api.ts

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`
  };
};

const BASE_URL = "https://ciap-mvp-backend.onrender.com/api/v1";

export const apiService = {
  // POST /api/v1/auth/login
  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Invalid credentials");
    return result;
  },

  // POST /api/v1/auth/register
  register: async (data: { full_name: string; email: string; password: string; role: string }) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Registration failed");
    return result;
  },

  // POST /api/v1/auth/forgot-password
  forgotPassword: async (email: string) => {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to send reset link");
    return result;
  },

  // POST /api/v1/auth/reset-password
  resetPassword: async (data: { token: string; new_password: string }) => {
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Password reset failed");
    return result;
  },

  // POST /api/v1/auth/verify-email
  verifyEmail: async (data: { email: string; otp: string }) => {
    const response = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Email verification failed");
    return result;
  },

  // GET /api/v1/auth/me
  fetchMe: async () => {
    const response = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },

  // GET /api/v1/creator/platforms
  fetchConnectedPlatforms: async () => {
    const response = await fetch(`${BASE_URL}/creator/platforms`, {
      headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to fetch platforms");
    return result;
  },

  // GET /api/v1/oauth/{platform}/connect
  getOAuthUrl: async (platform: string) => {
    const response = await fetch(`${BASE_URL}/oauth/${platform}/connect`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Failed to get OAuth URL");
    return response.json();
  },

  // GET /api/v1/oauth/{platform}/callback
  handleOAuthCallback: async (platform: string, code: string, state?: string) => {
    let url = `${BASE_URL}/oauth/${platform}/callback?code=${encodeURIComponent(code)}`;
    if (state) url += `&state=${state}`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "OAuth callback failed");
    return result;
  },

  // SME: GET /api/v1/discover
  fetchDiscovery: async (query?: string) => {
    const url = query 
      ? `${BASE_URL}/discover?query=${encodeURIComponent(query)}`
      : `${BASE_URL}/discover`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Discovery failed");
    return response.json();
  },

  // SME: GET /api/v1/campaigns
  fetchCampaigns: async () => {
    const response = await fetch(`${BASE_URL}/campaigns`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Campaigns failed");
    return response.json();
  },

  // SME: POST /api/v1/campaigns
  createCampaign: async (data: unknown) => {
    const response = await fetch(`${BASE_URL}/campaigns`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Campaign creation failed");
    return response.json();
  },

  // SME: GET /api/v1/discover/creators/{creator_id}
  fetchCreatorDetail: async (creatorId: string) => {
    const response = await fetch(`${BASE_URL}/discover/creators/${creatorId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Creator detail fetch failed");
    return response.json();
  },

  // SME: GET /api/v1/discover/creators
  fetchCreators: async (params?: { limit?: number; min_score?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.min_score !== undefined) query.set("min_score", String(params.min_score));
    const url = `${BASE_URL}/discover/creators${query.toString() ? "?" + query.toString() : ""}`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Creators fetch failed");
    return response.json();
  },

  // SME: POST /api/v1/forecast/campaign
  fetchForecast: async (data: { creator_id: string; budget: number; duration_days: number; goal: string }) => {
    const response = await fetch(`${BASE_URL}/forecast/campaign`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Forecast failed");
    return response.json();
  },

  // SME: GET /api/v1/sme/saved-creators
  fetchSavedCreators: async () => {
    const response = await fetch(`${BASE_URL}/sme/saved-creators`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Failed to fetch saved creators");
    return response.json();
  },

  // SME: POST /api/v1/sme/saved-creators/{creator_id}
  saveCreator: async (creatorId: string) => {
    const response = await fetch(`${BASE_URL}/sme/saved-creators/${creatorId}`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Failed to save creator");
    return response.json();
  },

  // SME: DELETE /api/v1/sme/saved-creators/{creator_id}
  unsaveCreator: async (creatorId: string) => {
    const response = await fetch(`${BASE_URL}/sme/saved-creators/${creatorId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Failed to unsave creator");
    return response.json();
  },

  // SME: GET /api/v1/sme/dashboard
  fetchSmeDashboard: async () => {
    const response = await fetch(`${BASE_URL}/sme/dashboard`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("SME dashboard failed");
    return response.json();
  },

  // GET /api/v1/analytics/summary
  fetchAnalyticsSummary: async () => {
    const response = await fetch(`${BASE_URL}/analytics/summary`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Analytics summary failed");
    return response.json();
  },

  // GET /api/v1/score/{creator_id}
  fetchInfluenceScore: async (creatorId: string) => {
    const response = await fetch(`${BASE_URL}/score/${creatorId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Score endpoint failed");
    return response.json();
  },

  // GET /api/v1/creator/dashboard
  fetchCreatorDashboard: async (creatorId: string, rangeStr: string = "Last 30 Days") => {
    const response = await fetch(`${BASE_URL}/creator/dashboard?creator_id=${creatorId}&range_str=${encodeURIComponent(rangeStr)}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Dashboard endpoint failed");
    return response.json();
  },

  // GET /api/v1/creator/content
  fetchContent: async (rangeStr: string = "Last 30 Days") => {
    const response = await fetch(`${BASE_URL}/creator/content?range_str=${encodeURIComponent(rangeStr)}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Content endpoint failed");
    return response.json();
  },

  // GET /api/v1/creator/audience
  fetchCreatorAudience: async () => {
    const response = await fetch(`${BASE_URL}/creator/audience`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Audience endpoint failed");
    return response.json();
  },

  queuePlatformSync: async (platforms: string[] = []) => {
    const response = await fetch(`${BASE_URL}/creator/platforms/sync`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ platforms })
    });
    if (!response.ok) throw new Error("Sync request failed");
    return response.json();
  },

  // Alias used by onboarding flow
  syncPlatforms: async () => {
    return apiService.queuePlatformSync([]);
  },

  // Alias used by onboarding flow
  getConnectUrl: async (platform: string) => {
    return apiService.getOAuthUrl(platform);
  }
};
