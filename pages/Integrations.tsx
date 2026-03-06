import React from 'react';

const integrations = [
    { name: 'Google Sheets', icon: '📊', desc: 'Save user data to spreadsheets', connected: true },
    { name: 'Shopify', icon: '🛍️', desc: 'Trigger automation on purchase', connected: false },
    { name: 'Slack', icon: '#️⃣', desc: 'Notify team on new leads', connected: false },
    { name: 'OpenAI (ChatGPT)', icon: '🤖', desc: 'AI-generated replies', connected: true },
    { name: 'Calendly', icon: '📅', desc: 'Book appointments inside DM', connected: false },
    { name: 'Zapier', icon: '⚡', desc: 'Connect to 3000+ apps', connected: false },
];

export const Integrations: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Integrations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((app, i) => (
                    <div key={i} className="bg-surface border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-600 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center text-2xl border border-zinc-800 shadow-inner">
                                {app.icon}
                            </div>
                            {app.connected ? (
                                <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded border border-green-500/20 font-medium">Connected</span>
                            ) : (
                                <button className="bg-zinc-800 text-white text-xs px-3 py-1.5 rounded hover:bg-zinc-700 transition">Connect</button>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{app.name}</h3>
                            <p className="text-sm text-zinc-400 mt-1">{app.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};