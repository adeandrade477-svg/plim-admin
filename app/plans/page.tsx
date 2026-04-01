"use client";

import { useEffect, useState } from "react";
import { adminApi, Plan } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { Table } from "@/components/Table";

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await adminApi.fetchPlans();
        setPlans(Array.isArray(res.data) ? res.data : []);
      } catch {
        setPlans([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (v: unknown) => (
        <span className="font-mono text-xs text-gray-500">{String(v).slice(0, 8)}...</span>
      ),
    },
    { key: "name", label: "Nome" },
    {
      key: "covenantid",
      label: "Convênio ID",
      render: (v: unknown) => (
        <span className="font-mono text-xs text-gray-500">{String(v).slice(0, 8)}...</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Planos"
        description="Planos de saúde vinculados aos convênios"
      />
      <div className="mb-4 text-sm text-gray-500">
        {!loading && `${plans.length} plano${plans.length !== 1 ? "s" : ""} encontrado${plans.length !== 1 ? "s" : ""}`}
      </div>
      <Table
        columns={columns}
        data={plans}
        loading={loading}
        emptyMessage="Nenhum plano encontrado"
      />
    </div>
  );
}
