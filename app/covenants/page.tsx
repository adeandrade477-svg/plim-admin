"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Check } from "lucide-react";
import { adminApi, baseApi, Covenant, Base } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { Modal } from "@/components/Modal";

export default function CovenantsPage() {
  const searchParams = useSearchParams();
  const baseParam = searchParams.get("base");

  const [base, setBase] = useState<Base | null>(null);
  const [covenants, setCovenants] = useState<Covenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [selectedGtw, setSelectedGtw] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [gtwCovenants, setGtwCovenants] = useState<{ codigo: number; nome: string }[]>([]);
  const [loadingGtw, setLoadingGtw] = useState(false);

  async function loadCovenants(b: Base) {
    const res = await adminApi.fetchCovenants(b["x-api-key"]);
    setCovenants(Array.isArray(res.data) ? res.data : []);
  }

  useEffect(() => {
    if (!baseParam) return;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const basesRes = await baseApi.fetch();
        const list: Base[] = Array.isArray(basesRes.data) ? basesRes.data : [];
        const found = list.find((b) => String(b.id) === baseParam) ?? null;
        setBase(found);
        if (found) await loadCovenants(found);
      } catch {
        setError("Erro ao carregar convênios");
        setCovenants([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [baseParam]);

  async function openCreate() {
    setSelectedGtw("");
    setFormError("");
    setShowCreate(true);
    if (!base || gtwCovenants.length > 0) return;
    setLoadingGtw(true);
    try {
      const res = await adminApi.fetchGtwCovenants(base["x-api-key"]!);
      setGtwCovenants(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoadingGtw(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!base) return;
    const selected = gtwCovenants.find((c) => String(c.codigo) === selectedGtw);
    if (!selected) return;
    setSaving(true);
    setFormError("");
    try {
      await adminApi.createCovenant(base["x-api-key"]!, { name: selected.nome });
      setShowCreate(false);
      setSelectedGtw("");
      showSuccess(`Convênio "${selected.nome}" criado com sucesso`);
      await loadCovenants(base);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg || "Erro ao criar convênio");
    } finally {
      setSaving(false);
    }
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

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
        title={base ? `Convênios — ${base.name}` : "Convênios"}
        description="Convênios médicos cadastrados no sistema"
        action={
          base ? (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Novo convênio
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <Check size={16} />
          {successMsg}
        </div>
      )}

      {!baseParam && (
        <p className="text-sm text-gray-500">Nenhuma clínica selecionada. Acesse esta página a partir da listagem de clínicas.</p>
      )}

      {baseParam && !loading && (
        <div className="mb-4 text-sm text-gray-500">
          {covenants.length} convênio{covenants.length !== 1 ? "s" : ""} encontrado{covenants.length !== 1 ? "s" : ""}
        </div>
      )}

      {baseParam && (
        <Table
          columns={columns}
          data={covenants}
          loading={loading}
          emptyMessage="Nenhum convênio encontrado para esta clínica"
        />
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Convênio">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Convênio externo *</label>
            <select
              required
              value={selectedGtw}
              onChange={(e) => setSelectedGtw(e.target.value)}
              disabled={loadingGtw}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-60"
            >
              <option value="">{loadingGtw ? "Carregando..." : "Selecione um convênio"}</option>
              {gtwCovenants.map((c) => (
                <option key={c.codigo} value={c.codigo}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? "Criando..." : "Criar convênio"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
