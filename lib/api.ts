import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Types
export interface Base {
  id: string;
  name: string;
  dbhost: string;
  dbport: number;
  dbname: string;
  dbuser: string;
  dbpassword?: string;
  active?: boolean;
  "x-api-key"?: string;
}

export interface User {
  id: number;
  name: string;
  profileId: number;
  active: boolean;
  delete: boolean;
  profile: string;
}

export interface Specialty {
  id: string;
  name: string;
}

export interface Covenant {
  id: string;
  name: string;
}

export interface Plan {
  id: string;
  name: string;
  covenantid: string;
}

export interface Profile {
  id?: number;
  name: string;
  permissionsId?: number[];
}

export interface Permission {
  id: number;
  name: string;
  idpermission?: number | null;
}

export interface LoginResponse {
  token: string;
  name: string;
  profileId: number;
}

// Admin endpoints
export const adminApi = {
  login: (name: string, password: string) =>
    api.post<LoginResponse>("/admin/user/login", { name, password }),
  health: () => api.get("/admin"),
  fetchUsers: () => api.get("/admin/user/fetch"),
  findUser: (id: number) => api.get<User>(`/admin/user/${id}`),
  createUser: (data: { name: string; profileId: number; profile: string; password: string }) =>
    api.post("/admin/user/create", data),
  updateUser: (id: number, data: { name: string; profileId: number; profile: string; active: boolean; password?: string }) =>
    api.put(`/admin/user/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/user/${id}`),
  fetchCovenants: (apiKey?: string) => api.get("/admin/covenant/fetch", apiKey ? { headers: { "x-api-key": apiKey } } : undefined),
  createCovenant: (apiKey: string, data: { name: string }) =>
    api.post("/admin/covenant/create", data, { headers: { "x-api-key": apiKey } }),
  createAdminCovenant: (data: { name: string }) => api.post("/admin/covenant/create", data),
  updateAdminCovenant: (id: number, data: { name: string }) => api.put(`/admin/covenant/${id}`, data),
  deleteAdminCovenant: (id: number) => api.delete(`/admin/covenant/${id}`),
  fetchGtwCovenants: (apiKey: string) =>
    api.get<{ codigo: number; nome: string }[]>(`/gtw/tconvenios/fetch`, { headers: { "x-api-key": apiKey } }),
  fetchSpecialties: () => api.get("/admin/specialty/fetch"),
  fetchPlans: () => api.get("/admin/plan/fetch"),
  fetchPlansByCovenant: (covenantId: number) => api.get<Plan[]>(`/admin/plan/covenant/${covenantId}`),
  createPlan: (data: { name: string; covenantid: number }) => api.post("/admin/plan/create", data),
  updatePlan: (id: number, data: { name: string; covenantid: number }) => api.put(`/admin/plan/${id}`, data),
  deletePlan: (id: number) => api.delete(`/admin/plan/${id}`),
  fetchProfiles: () => api.get<Profile[]>("/admin/profile/fetch"),
  fetchPermissions: () => api.get<Permission[]>("/admin/permission/fetch"),
  createProfile: (data: Profile) => api.post("/admin/profile/create", data),
  updateProfile: (data: Profile) => api.post("/admin/profile/update", data),
  deleteProfile: (id: number) => api.delete(`/admin/profile/${id}`),
  getConsulKey: (key: string) => api.get(`/admin/consul/${key}`),
  setConsulKey: (key: string, value: string) =>
    api.put(`/admin/consul/${key}`, { value }),
  deleteConsulKey: (key: string) => api.delete(`/admin/consul/${key}`),
};

// Base endpoints
export const baseApi = {
  create: (data: Omit<Base, "id">) => api.post("/base/create", data),
  fetch: () => api.get("/base/fetch"),
  find: (baseId: string) => api.get(`/base/find/${baseId}`),
  delete: (baseId: string) => api.delete(`/base/delete/${baseId}`),
  fetchSpecialties: () => api.get("/base/specialties/fetch"),
  fetchCovenants: () => api.get("/base/covenants/fetch"),
};
