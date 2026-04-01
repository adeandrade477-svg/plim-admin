"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { adminApi } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";

interface HealthData {
  status: string;
  version?: string;
  [key: string]: unknown;
}

interface EndpointCheck {
  name: string;
  path: string;
  status: "checking" | "ok" | "error";
  latency?: number;
  data?: unknown;
}

const endpoints: { name: string; path: string }[] = [
  { name: "Admin Health", path: "/admin" },
  { name: "Bases", path: "/base/fetch" },
  { name: "Especialidades (Base)", path: "/base/specialties/fetch" },
  { name: "Convênios (Base)", path: "/base/covenants/fetch" },
  { name: "Usuários (Admin)", path: "/admin/user/fetch" },
  { name: "Convênios (Admin)", path: "/admin/covenant/fetch" },
  { name: "Especialidades (Admin)", path: "/admin/specialty/fetch" },
  { name: "Planos (Admin)", path: "/admin/plan/fetch" },
];

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [checks, setChecks] = useState<EndpointCheck[]>(
    endpoints.map((e) => ({ ...e, status: "checking" }))
  );
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

  async function runChecks() {
    setLoading(true);
    setChecks(endpoints.map((e) => ({ ...e, status: "checking" })));
    setHealth(null);

    try {
      const start = Date.now();
      const res = await adminApi.health();
      setHealth({ ...res.data, latency: Date.now() - start });
    } catch {
      setHealth({ status: "ERROR" });
    }

    const results = await Promise.allSettled(
      endpoints.map(async (ep) => {
        const start = Date.now();
        const { api } = await import("@/lib/api");
        const res = await api.get(ep.path);
        return { ...ep, status: "ok" as const, latency: Date.now() - start, data: res.data };
      })
    );

    setChecks(
      results.map((r, i) =>
        r.status === "fulfilled"
          ? r.value
          : { ...endpoints[i], status: "error" as const }
      )
    );

    setLoading(false);
  }

  useEffect(() => {
    runChecks();
  }, []);

  const okCount = checks.filter((c) => c.status === "ok").length;
  const errorCount = checks.filter((c) => c.status === "error").length;

  return (
    <div>
      <PageHeader
        title="Health Check"
        description="Status dos endpoints da API"
        action={
          <button
            onClick={runChecks}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Verificar
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{okCount}</p>
          <p className="text-sm text-gray-500 mt-1">Online</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{errorCount}</p>
          <p className="text-sm text-gray-500 mt-1">Com erro</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">API URL</p>
          <p className="text-xs font-mono text-blue-600 truncate">{apiUrl}</p>
        </div>
      </div>

      {health && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {health.status === "UP" || health.status === "online" ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <XCircle size={20} className="text-red-500" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-800">API Principal</p>
              <p className="text-xs text-gray-500">Status: {String(health.status)}</p>
            </div>
          </div>
          {health.version && (
            <span className="text-xs text-gray-500">v{String(health.version)}</span>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-800">Endpoints verificados</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {checks.map((check) => (
            <div key={check.path} className="px-4 py-3 flex items-center gap-4">
              <div className="w-5 flex items-center justify-center">
                {check.status === "checking" ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : check.status === "ok" ? (
                  <CheckCircle size={18} className="text-green-500" />
                ) : (
                  <XCircle size={18} className="text-red-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{check.name}</p>
                <code className="text-xs text-gray-500">{check.path}</code>
              </div>
              {check.latency !== undefined && (
                <span className="text-xs text-gray-400">{check.latency}ms</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
