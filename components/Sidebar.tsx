"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Users,
  Stethoscope,
  HandCoins,
  CreditCard,
  Settings,
  MessageSquare,
  Activity,
  ShieldCheck,
  ChevronDown,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/UserMenu";
import type { Session } from "@/app/actions/auth";

type NavChild = { href: string; label: string; icon: React.ElementType };
type NavItem =
  | { type: "link"; href: string; label: string; icon: React.ElementType }
  | { type: "group"; key: string; label: string; icon: React.ElementType; children: NavChild[] };

const navItems: NavItem[] = [
  { type: "link", href: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    type: "group",
    key: "clientes",
    label: "Clientes",
    icon: Building2,
    children: [
      { href: "/bases", label: "Clínicas", icon: Database },
      { href: "/covenants", label: "Convênios", icon: HandCoins },
      { href: "/specialties", label: "Especialidades", icon: Stethoscope },
      { href: "/plans", label: "Planos", icon: CreditCard },
    ],
  },
  {
    type: "group",
    key: "configuracoes",
    label: "Configurações",
    icon: Settings,
    children: [
      { href: "/settings/users", label: "Usuários", icon: Users },
      { href: "/settings/profiles", label: "Perfis", icon: ShieldCheck },
      { href: "/settings/covenants", label: "Convênios", icon: HandCoins },
    ],
  },
  { type: "link", href: "/consul", label: "Consul KV", icon: Settings },
  { type: "link", href: "/chatwoot", label: "Chatwoot", icon: MessageSquare },
  { type: "link", href: "/health", label: "Health", icon: Activity },
];

function groupKeysForPath(pathname: string): Set<string> {
  const open = new Set<string>();
  for (const item of navItems) {
    if (item.type === "group" && item.children.some((c) => c.href !== "/" && pathname.startsWith(c.href))) {
      open.add(item.key);
    }
  }
  return open;
}

export function Sidebar({ session }: { session: Session }) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => groupKeysForPath(pathname));

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-gray-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">
            P
          </div>
          <span className="font-semibold text-lg">Plim Admin</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.type === "link") {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          }

          const Icon = item.icon;
          const isOpen = openGroups.has(item.key);
          const isGroupActive = item.children.some((c) => pathname.startsWith(c.href) && c.href !== "/");

          return (
            <div key={item.key}>
              <button
                onClick={() => toggleGroup(item.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isGroupActive
                    ? "text-white bg-gray-800"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown
                  size={14}
                  className={cn("transition-transform", isOpen ? "rotate-180" : "")}
                />
              </button>
              {isOpen && (
                <div className="mt-1 ml-3 space-y-1 border-l border-gray-700 pl-3">
                  {item.children.map(({ href, label, icon: ChildIcon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        pathname === href || (href !== "/" && pathname.startsWith(href))
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <ChildIcon size={16} />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-gray-700">
        <UserMenu session={session} />
      </div>
    </aside>
  );
}
