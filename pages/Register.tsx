import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-[400px] bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-400"></div>

        <div className="text-center mb-8 mt-2">
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary via-emerald-400 to-white mb-2">
            Fazza.
          </h1>
          <h2 className="text-xl font-bold text-white">Crie sua conta</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">Nome Completo</label>
            <input 
              type="text" 
              required
              className="w-full bg-black/40 border border-zinc-800 rounded-lg py-3 px-4 text-white placeholder-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-black/40 border border-zinc-800 rounded-lg py-3 px-4 text-white placeholder-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">Senha</label>
            <input 
              type="password" 
              required
              className="w-full bg-black/40 border border-zinc-800 rounded-lg py-3 px-4 text-white placeholder-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-all transform hover:scale-[1.01] mt-4"
          >
            Começar Agora
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-500 text-sm">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Fazer Login
          </Link>
        </p>
      </div>
    </div>
  );
};