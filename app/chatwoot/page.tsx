"use client";

import { PageHeader } from "@/components/PageHeader";
import { ExternalLink, Webhook, Info } from "lucide-react";

const webhooks = [
  {
    method: "POST",
    path: "/chatwoot/webhook",
    description: "Webhook principal do Chatwoot",
    detail: "Recebe eventos de mensagens e conversa do Chatwoot",
  },
  {
    method: "POST",
    path: "/chatwoot/evolution/webhook/:accountId/:boxId",
    description: "Webhook Evolution (WhatsApp)",
    detail: "Recebe eventos do Evolution para uma conta e caixa específicas",
  },
];

export default function ChatwootPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

  return (
    <div>
      <PageHeader
        title="Chatwoot"
        description="Integração com Chatwoot e Evolution WhatsApp"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <a
          href="https://chat-prd.plim.cloud"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <div>
            <p className="text-sm font-medium text-gray-800">Chatwoot</p>
            <p className="text-xs text-gray-500 mt-0.5">chat-prd.plim.cloud</p>
          </div>
          <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500" />
        </a>
        <a
          href="https://typebotbuilder-prd.plim.cloud"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <div>
            <p className="text-sm font-medium text-gray-800">Typebot Builder</p>
            <p className="text-xs text-gray-500 mt-0.5">typebotbuilder-prd.plim.cloud</p>
          </div>
          <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500" />
        </a>
        <a
          href="https://evolution-prd.plim.cloud"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <div>
            <p className="text-sm font-medium text-gray-800">Evolution API</p>
            <p className="text-xs text-gray-500 mt-0.5">evolution-prd.plim.cloud</p>
          </div>
          <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500" />
        </a>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <Webhook size={16} className="text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-800">Endpoints de Webhook</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {webhooks.map((w) => (
            <div key={w.path} className="px-4 py-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                  {w.method}
                </span>
                <code className="text-sm font-mono text-gray-800">{w.path}</code>
              </div>
              <p className="text-sm text-gray-600 ml-14">{w.description}</p>
              <p className="text-xs text-gray-400 ml-14 mt-0.5">{w.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Como configurar os webhooks</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Copie a URL base da API: <code className="bg-blue-100 px-1 rounded text-xs">{apiUrl}</code></li>
            <li>No painel do Chatwoot, vá em Configurações → Integrações → Webhooks</li>
            <li>Adicione o endpoint: <code className="bg-blue-100 px-1 rounded text-xs">{apiUrl}/chatwoot/webhook</code></li>
            <li>Para Evolution, configure o webhook com accountId e boxId correspondentes</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
