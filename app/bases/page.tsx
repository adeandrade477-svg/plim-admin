"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, HandCoins } from "lucide-react";
import Link from "next/link";
import { baseApi, Base } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Tooltip } from "@/components/Tooltip";

export default function BasesPage() {
  const [bases, setBases] = useState<Base[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState<Base | null>(null);
  const [deleting, setDeleting] = useState<Base | null>(null);
  const [form, setForm] = useState({
    name: "",
    dbhost: "",
    dbport: "5432",
    dbname: "",
    dbuser: "",
    dbpassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadBases() {
    setLoading(true);
    try {
      const res = await baseApi.fetch();
      setBases(Array.isArray(res.data) ? res.data : []);
    } catch {
      setBases([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBases();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await baseApi.create({ ...form, dbport: Number(form.dbport) });
      setShowCreate(false);
      setForm({ name: "", dbhost: "", dbport: "5432", dbname: "", dbuser: "", dbpassword: "" });
      await loadBases();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Erro ao criar clínica");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await baseApi.delete(deleting.id);
      setDeleting(null);
      await loadBases();
    } catch {
      setDeleting(null);
    }
  }

  const columns = [
    { key: "name", label: "Nome" },
    { key: "dbhost", label: "Host" },
    { key: "dbport", label: "Porta" },
    { key: "dbname", label: "Database" },
    { key: "dbuser", label: "Usuário" },
    {
      key: "active",
      label: "Status",
      render: (val: unknown) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            val !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {val !== false ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      key: "id",
      label: "Ações",
      render: (_: unknown, row: Base) => (
        <div className="flex items-center gap-2">
          <Tooltip label="Ver detalhes">
            <button
              onClick={() => setShowView(row)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye size={16} />
            </button>
          </Tooltip>
          <Tooltip label="Convênios">
            <Link
              href={`/covenants?base=${row.id}`}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors inline-flex"
            >
              <HandCoins size={16} />
            </Link>
          </Tooltip>
          <Tooltip label="Remover">
            <button
              onClick={() => setDeleting(row)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clínicas"
        description="Gerencie as clínicas cadastradas no sistema"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Nova clínica
          </button>
        }
      />

      <Table
        columns={columns}
        data={bases}
        loading={loading}
        emptyMessage="Nenhuma clínica cadastrada"
      />

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova Clínica">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Clínica São José"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Host *</label>
              <input
                type="text"
                required
                value={form.dbhost}
                onChange={(e) => setForm({ ...form, dbhost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="localhost"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Porta *</label>
              <input
                type="number"
                required
                value={form.dbport}
                onChange={(e) => setForm({ ...form, dbport: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Database *</label>
              <input
                type="text"
                required
                value={form.dbname}
                onChange={(e) => setForm({ ...form, dbname: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="clinica_db"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuário *</label>
              <input
                type="text"
                required
                value={form.dbuser}
                onChange={(e) => setForm({ ...form, dbuser: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
              <input
                type="password"
                required
                value={form.dbpassword}
                onChange={(e) => setForm({ ...form, dbpassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Criando..." : "Criar clínica"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={!!showView} onClose={() => setShowView(null)} title="Detalhes da Clínica">
        {showView && (
          <div className="space-y-3">
            {[
              { label: "ID", value: showView.id },
              { label: "Nome", value: showView.name },
              { label: "Host", value: showView.dbhost },
              { label: "Porta", value: showView.dbport },
              { label: "Database", value: showView.dbname },
              { label: "Usuário", value: showView.dbuser },
              { label: "Status", value: showView.active !== false ? "Ativo" : "Inativo" },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-4">
                <span className="w-24 text-sm text-gray-500 shrink-0">{label}</span>
                <span className="text-sm text-gray-900 font-medium break-all">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Remover clínica"
        message={`Deseja remover a clínica "${deleting?.name}"?`}
        confirmLabel="Remover"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
