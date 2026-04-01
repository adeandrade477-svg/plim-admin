"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, CreditCard } from "lucide-react";
import Link from "next/link";
import { adminApi, Covenant } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Tooltip } from "@/components/Tooltip";

const EMPTY_FORM = { name: "" };

function CovenantForm({
  isUpdate,
  form,
  setForm,
  error,
  saving,
  onCancel,
  onSubmit,
}: {
  isUpdate: boolean;
  form: { name: string };
  setForm: (f: { name: string }) => void;
  error: string;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
        <input
          type="text" required value={form.name} autoComplete="off"
          onChange={(e) => setForm({ name: e.target.value })}
          placeholder="Ex: Unimed"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit" disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Salvando..." : isUpdate ? "Salvar alterações" : "Criar convênio"}
        </button>
      </div>
    </form>
  );
}

export default function AdminCovenantsPage() {
  const [covenants, setCovenants] = useState<Covenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Covenant | null>(null);
  const [deleting, setDeleting] = useState<Covenant | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function loadCovenants() {
    setLoading(true);
    try {
      const res = await adminApi.fetchCovenants();
      setCovenants(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCovenants(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminApi.createAdminCovenant({ name: form.name });
      setShowCreate(false);
      showSuccess(`Convênio "${form.name}" criado com sucesso`);
      await loadCovenants();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Erro ao criar convênio");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing?.id) return;
    setSaving(true);
    setError("");
    try {
      await adminApi.updateAdminCovenant(Number(editing.id), { name: form.name });
      setEditing(null);
      showSuccess(`Convênio "${form.name}" atualizado com sucesso`);
      await loadCovenants();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Erro ao atualizar convênio");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting?.id) return;
    try {
      await adminApi.deleteAdminCovenant(Number(deleting.id));
      setDeleting(null);
      showSuccess(`Convênio "${deleting.name}" excluído`);
      await loadCovenants();
    } catch {
      setDeleting(null);
    }
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nome" },
    {
      key: "id",
      label: "Ações",
      render: (_: unknown, row: Covenant) => (
        <div className="flex items-center gap-1">
          <Tooltip label="Planos">
            <Link
              href={`/settings/covenants/${row.id}/plans`}
              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors inline-flex"
            >
              <CreditCard size={15} />
            </Link>
          </Tooltip>
          <Tooltip label="Editar">
            <button
              onClick={() => { setForm({ name: row.name }); setError(""); setEditing(row); }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Pencil size={15} />
            </button>
          </Tooltip>
          <Tooltip label="Excluir">
            <button
              onClick={() => setDeleting(row)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Convênios"
        description="Gerencie os convênios cadastrados no sistema"
        action={
          <button
            onClick={() => { setForm(EMPTY_FORM); setError(""); setShowCreate(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Novo convênio
          </button>
        }
      />

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <Check size={16} />
          {successMsg}
        </div>
      )}

      <Table
        columns={columns}
        data={covenants}
        loading={loading}
        emptyMessage="Nenhum convênio cadastrado"
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Convênio">
        <CovenantForm
          isUpdate={false}
          form={form}
          setForm={setForm}
          error={error}
          saving={saving}
          onCancel={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Convênio">
        <CovenantForm
          isUpdate={true}
          form={form}
          setForm={setForm}
          error={error}
          saving={saving}
          onCancel={() => setEditing(null)}
          onSubmit={handleUpdate}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Excluir convênio"
        message={`Deseja excluir o convênio "${deleting?.name}"?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
