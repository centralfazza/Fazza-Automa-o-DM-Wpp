import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-[400px] bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-400"></div>

        <div className="text-center mb-10 mt-2">
          {/* Logo Text with Gradient */}
          <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary via-emerald-400 to-white mb-2">
            Fazza.
          </h1>
          <h2 className="text-xl font-bold text-white mb-1">Bem-vindo</h2>
          <p className="text-zinc-500 text-sm">Faça login para acessar o sistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">E-mail</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              </div>
              <input
                type="email"
                required
                className="w-full bg-black/40 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">Senha</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
              <input
                type="password"
                required
                className="w-full bg-black/40 border border-zinc-800 rounded-lg py-3 pl-10 pr-10 text-white placeholder-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
                placeholder="••••••••"
              />
              <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            <span>Entrar</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-600 text-xs">
          v3.0.0
        </p>
      </div>
    </div>
  );
};