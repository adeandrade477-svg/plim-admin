"use client";

import { useState } from "react";
import { LogOut, ChevronDown, User } from "lucide-react";
import { logout } from "@/app/actions/auth";
import type { Session } from "@/app/actions/auth";

export function UserMenu({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await logout();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
          <User size={14} className="text-white" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-white truncate">{session.name}</p>
          <p className="text-xs text-gray-400">{session.profileName}</p>
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <LogOut size={15} />
              {loading ? "Saindo..." : "Sair"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
