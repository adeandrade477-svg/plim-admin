"use client";

import { useEffect, useState } from "react";
import { Database, Users, Stethoscope, HandCoins, CreditCard, Activity } from "lucide-react";
import { adminApi, baseApi } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    bases: 0,
    users: 0,
    specialties: 0,
    covenants: 0,
    plans: 0,
  });
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [health, bases, users, specialties, covenants, plans] = await Promise.allSettled([
          adminApi.health(),
          baseApi.fetch(),
          adminApi.fetchUsers(),
          adminApi.fetchSpecialties(),
          adminApi.fetchCovenants(),
          adminApi.fetchPlans(),
        ]);

        setApiStatus(health.status === "fulfilled" ? "online" : "offline");

        setStats({
          bases: bases.status === "fulfilled" ? (Array.isArray(bases.value.data) ? bases.value.data.length : 0) : 0,
          users: users.status === "fulfilled" ? (Array.isArray(users.value.data) ? users.value.data.length : 0) : 0,
          specialties: specialties.status === "fulfilled" ? (Array.isArray(specialties.value.data) ? specialties.value.data.length : 0) : 0,
          covenants: covenants.status === "fulfilled" ? (Array.isArray(covenants.value.data) ? covenants.value.data.length : 0) : 0,
          plans: plans.status === "fulfilled" ? (Array.isArray(plans.value.data) ? plans.value.data.length : 0) : 0,
        });
      } catch {
        setApiStatus("offline");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do sistema Plim"
      />

      <div className="mb-6 flex items-center gap-2">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            apiStatus === "online"
              ? "bg-green-500"
              : apiStatus === "offline"
              ? "bg-red-500"
              : "bg-yellow-400 animate-pulse"
          }`}
        />
        <span className="text-sm text-gray-600">
          API:{" "}
          {apiStatus === "checking"
            ? "Verificando..."
            : apiStatus === "online"
            ? "Online"
            : "Offline"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Bases"
          value={loading ? "..." : stats.bases}
          icon={Database}
          color="blue"
        />
        <StatCard
          title="Usuários"
          value={loading ? "..." : stats.users}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Especialidades"
          value={loading ? "..." : stats.specialties}
          icon={Stethoscope}
          color="purple"
        />
        <StatCard
          title="Convênios"
          value={loading ? "..." : stats.covenants}
          icon={HandCoins}
          color="orange"
        />
        <StatCard
          title="Planos"
          value={loading ? "..." : stats.plans}
          icon={CreditCard}
          color="blue"
        />
        <StatCard
          title="Status"
          value={apiStatus === "online" ? "Online" : apiStatus === "offline" ? "Offline" : "..."}
          icon={Activity}
          color={apiStatus === "online" ? "green" : "orange"}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sobre o sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Módulos ativos</h3>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Bases de dados (multi-tenancy)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Agendamento de consultas (GTW)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Integração Typebot (chatbot)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Integração Chatwoot (mensageria)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Evolution (WhatsApp)
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Infraestrutura</h3>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                PostgreSQL (banco de dados)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Redis (cache)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Consul (configuração)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Criptografia AES-256
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
