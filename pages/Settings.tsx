import React, { useState } from 'react';
import { useToast } from '../components/ui/ToastContext';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  const handleSave = () => {
    toast('Profile updated successfully!', 'success');
  };

  const tabs = [
    { id: 'profile', label: 'Perfil' },
    { id: 'notifications', label: 'Notificações' },
    { id: 'billing', label: 'Plano & Cobrança' },
    { id: 'appearance', label: 'Aparência' },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0">
      <h2 className="text-2xl font-bold text-white mb-6">Configurações</h2>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-700 mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
                ? 'border-primary text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-slate-600">JD</div>
              <div>
                <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition">Alterar Foto</button>
                <p className="text-xs text-slate-500 mt-2">JPG ou PNG, max 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nome Completo</label>
                <input type="text" defaultValue="John Doe" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <input type="email" defaultValue="john@autodm.com" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-300">Bio / Descrição</label>
                <textarea rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"></textarea>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button onClick={handleSave} className="bg-primary hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-primary/20">Salvar Alterações</button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-fade-in">
            {['Email em novos leads', 'Push no celular', 'Resumo semanal', 'Alertas de erro'].map((setting, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <span className="text-slate-200">{setting}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6 animate-fade-in text-center py-8">
            <div className="inline-block p-4 rounded-full bg-primary/10 text-primary mb-2 text-3xl">💎</div>
            <h3 className="text-xl font-bold text-white">Plano Pro</h3>
            <p className="text-slate-400">Seu plano renova em 12/12/2024</p>
            <div className="max-w-xs mx-auto pt-4">
              <button className="w-full border border-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg transition">Gerenciar Assinatura</button>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <span className="text-xl">🌙</span>
                <div>
                  <p className="font-medium text-white">Dark Mode</p>
                  <p className="text-xs text-slate-500">O tema padrão do sistema</p>
                </div>
              </div>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Ativo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};