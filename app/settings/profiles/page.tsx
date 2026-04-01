"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, ChevronDown } from "lucide-react";
import { adminApi, Profile, Permission } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Tooltip } from "@/components/Tooltip";

const EMPTY_FORM: Profile = { name: "", permissionsId: [] };

function PermissionsSelect({
  permissions,
  selected,
  onChange,
  loading,
  openIds,
  onToggleAccordion,
}: {
  permissions: Permission[];
  selected: number[];
  onChange: (v: number[]) => void;
  loading: boolean;
  openIds: Set<number>;
  onToggleAccordion: (id: number) => void;
}) {

  if (loading) return <p className="text-sm text-gray-400">Carregando permissões...</p>;
  if (permissions.length === 0) return <p className="text-sm text-amber-600">Nenhuma permissão cadastrada.</p>;

  const parents = permissions.filter((p) => p.idpermission == null);
  const childrenOf = (parentId: number) => permissions.filter((p) => p.idpermission === parentId);
  const parentIds = new Set(parents.map((p) => p.id));
  const orphans = permissions.filter((p) => p.idpermission != null && !parentIds.has(p.idpermission!));

  function toggleChild(childId: number, parentId: number, kids: Permission[]) {
    const isRemoving = selected.includes(childId);
    let next = isRemoving
      ? selected.filter((id) => id !== childId)
      : [...selected, childId];

    // após toggle, verifica se todos os filhos estão selecionados
    const kidIds = kids.map((k) => k.id);
    const remainingSelected = next.filter((id) => kidIds.includes(id));
    const allKidsSelected = remainingSelected.length === kids.length;

    if (allKidsSelected && !next.includes(parentId)) {
      next = [...next, parentId];
    } else if (!allKidsSelected && next.includes(parentId)) {
      next = next.filter((id) => id !== parentId);
    }

    onChange(next);
  }

  function toggleParentRow(parentId: number, kids: Permission[]) {
    const kidIds = kids.map((k) => k.id);
    const allSelected = kidIds.every((id) => selected.includes(id)) && selected.includes(parentId);
    if (allSelected) {
      onChange(selected.filter((id) => id !== parentId && !kidIds.includes(id)));
    } else {
      const toAdd = [parentId, ...kidIds].filter((id) => !selected.includes(id));
      onChange([...selected, ...toAdd]);
    }
  }

  function Checkbox({ checked, partial }: { checked: boolean; partial?: boolean }) {
    return (
      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
        checked ? "bg-blue-600 border-blue-600" : partial ? "bg-blue-100 border-blue-400" : "border-gray-300"
      }`}>
        {checked && <Check size={11} className="text-white" />}
        {!checked && partial && <span className="w-2 h-0.5 bg-blue-500 rounded" />}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-y-auto max-h-72">
      {parents.map((parent) => {
        const kids = childrenOf(parent.id);
        const selectedKids = kids.filter((k) => selected.includes(k.id)).length;
        const allSelected = selected.includes(parent.id) && kids.every((k) => selected.includes(k.id));
        const partial = !allSelected && (selected.includes(parent.id) || selectedKids > 0);
        const isOpen = openIds.has(parent.id);

        return (
          <div key={parent.id} className="border-b border-gray-200 last:border-0">
            {/* Cabeçalho do acordeão */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100">
              {/* Checkbox do pai — só seleciona, não abre accordion */}
              <div
                onClick={(e) => { e.stopPropagation(); toggleParentRow(parent.id, kids); }}
                className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
              >
                <Checkbox checked={allSelected} partial={partial} />
                <span className="text-sm font-semibold text-gray-800 select-none truncate">
                  {parent.name}
                </span>
                {selectedKids > 0 && (
                  <span className="text-xs text-blue-600 font-medium shrink-0">
                    {selectedKids}/{kids.length}
                  </span>
                )}
              </div>
              {/* Botão do acordeão — só abre/fecha */}
              {kids.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onToggleAccordion(parent.id); }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                >
                  <ChevronDown size={15} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
            {/* Filhos */}
            {isOpen && kids.map((child) => (
              <div
                key={child.id}
                onClick={(e) => { e.stopPropagation(); toggleChild(child.id, parent.id, kids); }}
                className="flex items-center gap-3 pl-8 pr-3 py-2 hover:bg-gray-50 cursor-pointer border-t border-gray-100"
              >
                <Checkbox checked={selected.includes(child.id)} />
                <span className="text-sm text-gray-700 select-none flex-1">{child.name}</span>
              </div>
            ))}
          </div>
        );
      })}
      {orphans.map((p) => (
        <div
          key={p.id}
          onClick={() => onChange(selected.includes(p.id) ? selected.filter((id) => id !== p.id) : [...selected, p.id])}
          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
        >
          <Checkbox checked={selected.includes(p.id)} />
          <span className="text-sm text-gray-700 select-none flex-1">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

function ProfileForm({
  isUpdate,
  form,
  setForm,
  error,
  saving,
  permissions,
  loadingPermissions,
  openIds,
  onToggleAccordion,
  onCancel,
}: {
  isUpdate: boolean;
  form: Profile;
  setForm: (f: Profile) => void;
  error: string;
  saving: boolean;
  permissions: Permission[];
  loadingPermissions: boolean;
  openIds: Set<number>;
  onToggleAccordion: (id: number) => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
        <input
          type="text" required value={form.name} autoComplete="off"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Ex: Administrador"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Permissões{" "}
          {(form.permissionsId ?? []).length > 0 && (
            <span className="text-blue-600 font-normal">({(form.permissionsId ?? []).length} selecionada{(form.permissionsId ?? []).length !== 1 ? "s" : ""})</span>
          )}
        </label>
        <PermissionsSelect
          permissions={permissions}
          selected={form.permissionsId ?? []}
          onChange={(v) => setForm({ ...form, permissionsId: v })}
          loading={loadingPermissions}
          openIds={openIds}
          onToggleAccordion={onToggleAccordion}
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
          {saving ? "Salvando..." : isUpdate ? "Salvar alterações" : "Criar perfil"}
        </button>
      </div>
    </div>
  );
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  function handleToggleAccordion(id: number) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function loadProfiles() {
    setLoading(true);
    try {
      const res = await adminApi.fetchProfiles();
      setProfiles(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  }

  async function ensurePermissions() {
    if (permissions.length > 0) return;
    setLoadingPermissions(true);
    try {
      const res = await adminApi.fetchPermissions();
      setPermissions(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoadingPermissions(false);
    }
  }

  useEffect(() => { loadProfiles(); }, []);

  async function openCreate() {
    setForm(EMPTY_FORM);
    setError("");
    await ensurePermissions();
    setShowCreate(true);
  }

  async function openEdit(profile: Profile) {
    setForm({ id: profile.id, name: profile.name, permissionsId: profile.permissionsId ?? [] });
    setError("");
    await ensurePermissions();
    setEditing(profile);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminApi.createProfile({ name: form.name, permissionsId: form.permissionsId ?? [] });
      setShowCreate(false);
      showSuccess(`Perfil "${form.name}" criado com sucesso`);
      await loadProfiles();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Erro ao criar perfil");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminApi.updateProfile({ id: form.id, name: form.name, permissionsId: form.permissionsId ?? [] });
      setEditing(null);
      showSuccess(`Perfil "${form.name}" atualizado com sucesso`);
      await loadProfiles();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting?.id) return;
    try {
      await adminApi.deleteProfile(deleting.id);
      setDeleting(null);
      showSuccess(`Perfil "${deleting.name}" excluído`);
      await loadProfiles();
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
      render: (_: unknown, row: Profile) => (
        <div className="flex items-center gap-1">
          <Tooltip label="Editar">
            <button
              onClick={() => openEdit(row)}
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
        title="Perfis"
        description="Gerencie os perfis de acesso e suas permissões"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Novo perfil
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
        data={profiles}
        loading={loading}
        emptyMessage="Nenhum perfil cadastrado"
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Perfil">
        <form onSubmit={handleCreate}>
          <ProfileForm
            isUpdate={false}
            form={form}
            setForm={setForm}
            error={error}
            saving={saving}
            permissions={permissions}
            loadingPermissions={loadingPermissions}
            openIds={openIds}
            onToggleAccordion={handleToggleAccordion}
            onCancel={() => setShowCreate(false)}
          />
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Perfil">
        <form onSubmit={handleUpdate}>
          <ProfileForm
            isUpdate={true}
            form={form}
            setForm={setForm}
            error={error}
            saving={saving}
            permissions={permissions}
            loadingPermissions={loadingPermissions}
            openIds={openIds}
            onToggleAccordion={handleToggleAccordion}
            onCancel={() => setEditing(null)}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Excluir perfil"
        message={`Deseja excluir o perfil "${deleting?.name}"?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
