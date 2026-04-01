"use client";

import { useState } from "react";
import { Search, Plus, Trash2, Save } from "lucide-react";
import { adminApi } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Tooltip } from "@/components/Tooltip";

interface KVEntry {
  key: string;
  value: string;
  loading?: boolean;
}

export default function ConsulPage() {
  const [entries, setEntries] = useState<KVEntry[]>([]);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [searchKey, setSearchKey] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  async function handleFetch() {
    if (!searchKey.trim()) return;
    setFetchLoading(true);
    setFetchError("");
    try {
      const res = await adminApi.getConsulKey(searchKey.trim());
      const value = typeof res.data === "object" ? JSON.stringify(res.data, null, 2) : String(res.data);
      setEntries((prev) => {
        const exists = prev.find((e) => e.key === searchKey.trim());
        if (exists) {
          return prev.map((e) => e.key === searchKey.trim() ? { ...e, value } : e);
        }
        return [...prev, { key: searchKey.trim(), value }];
      });
      setSearchKey("");
    } catch {
      setFetchError(`Chave "${searchKey}" não encontrada`);
    } finally {
      setFetchLoading(false);
    }
  }

  async function handleSave() {
    if (!newKey.trim() || !newValue.trim()) return;
    setSaving(true);
    setSaveMsg("");
    try {
      await adminApi.setConsulKey(newKey.trim(), newValue.trim());
      setSaveMsg(`Chave "${newKey}" salva com sucesso`);
      setEntries((prev) => {
        const exists = prev.find((e) => e.key === newKey.trim());
        if (exists) {
          return prev.map((e) => e.key === newKey.trim() ? { ...e, value: newValue.trim() } : e);
        }
        return [...prev, { key: newKey.trim(), value: newValue.trim() }];
      });
      setNewKey("");
      setNewValue("");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("Erro ao salvar chave");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingKey) return;
    try {
      await adminApi.deleteConsulKey(deletingKey);
      setEntries((prev) => prev.filter((e) => e.key !== deletingKey));
    } finally {
      setDeletingKey(null);
    }
  }

  async function handleUpdateEntry(key: string, value: string) {
    try {
      await adminApi.setConsulKey(key, value);
      setEntries((prev) =>
        prev.map((e) => e.key === key ? { ...e, value, loading: false } : e)
      );
    } catch {
      alert("Erro ao atualizar chave");
    }
  }

  return (
    <div>
      <PageHeader
        title="Consul KV"
        description="Gerenciamento de chaves de configuração via Consul"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Fetch key */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Buscar chave</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              placeholder="Ex: plim/config"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleFetch}
              disabled={fetchLoading || !searchKey.trim()}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Search size={16} />
              {fetchLoading ? "..." : "Buscar"}
            </button>
          </div>
          {fetchError && (
            <p className="mt-2 text-xs text-red-600">{fetchError}</p>
          )}
        </div>

        {/* Set key */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Definir chave</h2>
          <div className="space-y-2">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Chave (Ex: plim/feature-flag)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Valor"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSave}
                disabled={saving || !newKey.trim() || !newValue.trim()}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Plus size={16} />
                {saving ? "..." : "Salvar"}
              </button>
            </div>
            {saveMsg && (
              <p className={`text-xs ${saveMsg.includes("Erro") ? "text-red-600" : "text-green-600"}`}>
                {saveMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loaded entries */}
      {entries.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Chaves carregadas</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <div key={entry.key} className="px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-medium text-blue-700">{entry.key}</span>
                  <div className="flex items-center gap-2">
                    <Tooltip label="Salvar alterações">
                      <button
                        onClick={() => handleUpdateEntry(entry.key, entry.value)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Save size={15} />
                      </button>
                    </Tooltip>
                    <Tooltip label="Remover chave">
                      <button
                        onClick={() => setDeletingKey(entry.key)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
                <textarea
                  value={entry.value}
                  onChange={(e) =>
                    setEntries((prev) =>
                      prev.map((en) =>
                        en.key === entry.key ? { ...en, value: e.target.value } : en
                      )
                    )
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center py-16">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">🗄️</div>
            <p className="text-sm">Busque uma chave para visualizar ou editar</p>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!deletingKey}
        title="Remover chave"
        message={`Deseja remover a chave "${deletingKey}"?`}
        confirmLabel="Remover"
        onConfirm={handleDelete}
        onCancel={() => setDeletingKey(null)}
      />
    </div>
  );
}
