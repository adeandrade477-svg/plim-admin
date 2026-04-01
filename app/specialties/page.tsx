"use client";

import { useEffect, useState } from "react";
import { adminApi, Specialty } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { Table } from "@/components/Table";

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await adminApi.fetchSpecialties();
        setSpecialties(Array.isArray(res.data) ? res.data : []);
      } catch {
        setSpecialties([]);
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
  ];

  return (
    <div>
      <PageHeader
        title="Especialidades"
        description="Especialidades médicas disponíveis no sistema"
      />
      <div className="mb-4 text-sm text-gray-500">
        {!loading && `${specialties.length} especialidade${specialties.length !== 1 ? "s" : ""} encontrada${specialties.length !== 1 ? "s" : ""}`}
      </div>
      <Table
        columns={columns}
        data={specialties}
        loading={loading}
        emptyMessage="Nenhuma especialidade encontrada"
      />
    </div>
  );
}
