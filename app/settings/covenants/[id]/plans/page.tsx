"use client";

import { use, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { adminApi, Plan, Covenant } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Tooltip } from "@/components/Tooltip";

const EMPTY_FORM = { name: "" };

function PlanForm({
  form,
  setForm,
  isUpdate,
  error,
  saving,
  onCancel,
  onSubmit,
}: {
  form: { name: string };
  setForm: (f: { name: string }) => void;
  isUpdate: boolean;
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
          placeholder="Ex: Consulta"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? "Salvando..." : isUpdate ? "Salvar alterações" : "Criar plano"}
        </button>
      </div>
    </form>
  );
}

export default function PlansByCovenant({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const covenantId = Number(id);

  const [covenant, setCovenant] = useState<Covenant | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [deleting, setDeleting] = useState<Plan | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadPlans() {
    try {
      const res = await adminApi.fetchPlansByCovenant(covenantId);
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Erro ao carregar planos");
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [covenantsRes, plansRes] = await Promise.all([
          adminApi.fetchCovenants(),
          adminApi.fetchPlansByCovenant(covenantId),
        ]);
        const list: Covenant[] = Array.isArray(covenantsRes.data) ? covenantsRes.data : [];
        setCovenant(list.find((c) => String(c.id) === id) ?? null);
        setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      } catch {
        setError("Erro ao carregar planos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await adminApi.createPlan({ name: form.name, covenantid: covenantId });
      setShowCreate(false);
      showSuccess(`Plano "${form.name}" criado com sucesso`);
      await loadPlans();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg || "Erro ao criar plano");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing?.id) return;
    setSaving(true);
    setFormError("");
    try {
      await adminApi.updatePlan(Number(editing.id), { name: form.name, covenantid: covenantId });
      setEditing(null);
      showSuccess(`Plano "${form.name}" atualizado com sucesso`);
      await loadPlans();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg || "Erro ao atualizar plano");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting?.id) return;
    try {
      await adminApi.deletePlan(Number(deleting.id));
      setDeleting(null);
      showSuccess(`Plano "${deleting.name}" excluído`);
      await loadPlans();
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
      render: (_: unknown, row: Plan) => (
        <div className="flex items-center gap-1">
          <Tooltip label="Editar">
            <button
              onClick={() => { setForm({ name: row.name }); setFormError(""); setEditing(row); }}
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
        title={covenant ? `Planos — ${covenant.name}` : "Planos"}
        description="Planos vinculados ao convênio"
        action={
          <button
            onClick={() => { setForm(EMPTY_FORM); setFormError(""); setShowCreate(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Novo plano
          </button>
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <Check size={16} />
          {successMsg}
        </div>
      )}

      <Table
        columns={columns}
        data={plans}
        loading={loading}
        emptyMessage="Nenhum plano encontrado para este convênio"
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Plano">
        <PlanForm
          isUpdate={false} form={form} setForm={setForm}
          error={formError} saving={saving}
          onCancel={() => setShowCreate(false)} onSubmit={handleCreate}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Plano">
        <PlanForm
          isUpdate={true} form={form} setForm={setForm}
          error={formError} saving={saving}
          onCancel={() => setEditing(null)} onSubmit={handleUpdate}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Excluir plano"
        message={`Deseja excluir o plano "${deleting?.name}"?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
