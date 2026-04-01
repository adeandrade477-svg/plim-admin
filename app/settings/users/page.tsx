"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminApi, User, Profile } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Tooltip } from "@/components/Tooltip";

const EMPTY_FORM = { name: "", profileId: "", password: "", active: true };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await adminApi.fetchUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  }

  async function ensureProfiles() {
    if (profiles.length > 0) return;
    setLoadingProfiles(true);
    try {
      const res = await adminApi.fetchProfiles();
      setProfiles(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoadingProfiles(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function openCreate() {
    setForm(EMPTY_FORM);
    setError("");
    await ensureProfiles();
    setShowCreate(true);
  }

  async function openEdit(user: User) {
    setError("");
    await ensureProfiles();
    try {
      const res = await adminApi.findUser(user.id);
      const fresh = res.data;
      setForm({ name: fresh.name, profileId: String(fresh.profileId), password: "", active: fresh.active });
      setEditing(fresh);
    } catch {
      setForm({ name: user.name, profileId: String(user.profileId), password: "", active: user.active });
      setEditing(user);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const selectedProfile = profiles.find((p) => String(p.id) === form.profileId);
      await adminApi.createUser({
        name: form.name,
        profileId: Number(form.profileId),
        profile: selectedProfile?.name ?? "",
        password: form.password,
      });
      setShowCreate(false);
      await loadUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Erro ao criar usuário");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const selectedProfile = profiles.find((p) => String(p.id) === form.profileId);
      const payload: { name: string; profileId: number; profile: string; active: boolean; password?: string } = {
        name: form.name,
        profileId: Number(form.profileId),
        profile: selectedProfile?.name ?? "",
        active: form.active,
      };
      if (form.password) payload.password = form.password;
      await adminApi.updateUser(editing.id, payload);
      setEditing(null);
      await loadUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Erro ao atualizar usuário");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await adminApi.deleteUser(deleting.id);
      setDeleting(null);
      await loadUsers();
    } catch {
      setDeleting(null);
    }
  }

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nome" },
    { key: "profile", label: "Perfil" },
    {
      key: "active",
      label: "Status",
      render: (val: unknown) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${val !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {val !== false ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      key: "id",
      label: "Ações",
      render: (_: unknown, row: User) => (
        <div className="flex items-center gap-1">
          <Tooltip label="Editar">
            <button
              onClick={() => openEdit(row)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Pencil size={15} />
            </button>
          </Tooltip>
          {row.delete ? (
            <Tooltip label="Excluir">
              <button
                onClick={() => setDeleting(row)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </Tooltip>
          ) : (
            <Tooltip label="Usuário protegido contra exclusão">
              <span className="p-1.5 text-gray-200 cursor-not-allowed">
                <Trash2 size={15} />
              </span>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  function ProfileSelect() {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Perfil *</label>
        <select
          required
          disabled={loadingProfiles}
          value={form.profileId}
          onChange={(e) => setForm({ ...form, profileId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-60"
        >
          <option value="">{loadingProfiles ? "Carregando perfis..." : "Selecione um perfil"}</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {!loadingProfiles && profiles.length === 0 && (
          <p className="mt-1 text-xs text-amber-600">Nenhum perfil encontrado. Crie um perfil primeiro.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Gerencie os usuários do sistema"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Novo usuário
          </button>
        }
      />

      <Table columns={columns} data={users} loading={loading} emptyMessage="Nenhum usuário cadastrado" />

      {/* Create */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Usuário">
        <form onSubmit={handleCreate} className="space-y-4" autoComplete="off">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              type="text" required value={form.name} autoComplete="off"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ProfileSelect />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
            <input
              type="password" required value={form.password} autoComplete="new-password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? "Criando..." : "Criar usuário"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Usuário">
        <form onSubmit={handleUpdate} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ProfileSelect />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nova senha <span className="text-gray-400 font-normal">(deixe em branco para não alterar)</span>
            </label>
            <input
              type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {editing?.delete && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <p className="text-xs text-gray-500">{form.active ? "Usuário ativo no sistema" : "Usuário inativo no sistema"}</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, active: !form.active })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Excluir usuário"
        message={`Deseja excluir o usuário "${deleting?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
