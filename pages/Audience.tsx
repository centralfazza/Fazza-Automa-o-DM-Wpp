import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contact } from '../types';
import { useToast } from '../components/ui/ToastContext';

const initialContacts: Contact[] = [
   { id: '1', workspaceId: 'ws1', identifiers: { instagramId: 'ig_1', email: 'alice@gmail.com' }, name: 'Alice Silva', username: 'alice_design', email: 'alice@gmail.com', avatar: 'AS', status: 'subscribed', tags: [{ id: '1', name: 'Lead', color: '' }], customFields: {}, lastActive: '2m ago', joinedAt: 'Oct 12' },
   { id: '2', workspaceId: 'ws1', identifiers: { instagramId: 'ig_2' }, name: 'Bob Brown', username: 'bobby_b', avatar: 'BB', status: 'unsubscribed', tags: [], customFields: {}, lastActive: '1d ago', joinedAt: 'Oct 10' },
   { id: '3', workspaceId: 'ws1', identifiers: { instagramId: 'ig_3', email: 'kim@food.com' }, name: 'Charlie Kim', username: 'ck_food', email: 'kim@food.com', avatar: 'CK', status: 'subscribed', tags: [{ id: '2', name: 'VIP', color: '' }], customFields: {}, lastActive: '5h ago', joinedAt: 'Sep 28' },
];

export const Audience: React.FC = () => {
   const navigate = useNavigate();
   const { toast } = useToast();

   const [search, setSearch] = useState('');
   const [statusFilter, setStatusFilter] = useState('All');
   const [tagFilter, setTagFilter] = useState('Any');

   const filteredContacts = initialContacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(search.toLowerCase()) ||
         (contact.username || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || contact.status === statusFilter.toLowerCase();
      const matchesTag = tagFilter === 'Any' || contact.tags.some(t => t.name === tagFilter);

      return matchesSearch && matchesStatus && matchesTag;
   });

   const handleAction = (action: string) => {
      toast(`${action} functionality coming soon!`, 'info');
   };

   const handleChat = (contactName: string) => {
      navigate('/conversations');
      toast(`Navigating to chat with ${contactName}`, 'success');
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Audience</h2>
            <div className="flex gap-3">
               <button onClick={() => handleAction('Import CSV')} className="px-4 py-2 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">Import .CSV</button>
               <button onClick={() => handleAction('Add Contact')} className="px-4 py-2 bg-primary text-black font-bold rounded-lg text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-primary/20">Add Contact</button>
            </div>
         </div>

         {/* Filters */}
         <div className="bg-surface border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row gap-4">
            <input
               type="text"
               placeholder="Search name, username..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white w-full md:w-64 focus:border-primary outline-none focus:ring-1 focus:ring-primary"
            />
            <select
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
               <option>All</option>
               <option>Subscribed</option>
               <option>Unsubscribed</option>
            </select>
            <select
               value={tagFilter}
               onChange={(e) => setTagFilter(e.target.value)}
               className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
               <option>Any</option>
               <option>Lead</option>
               <option>VIP</option>
            </select>
         </div>

         {/* Table */}
         <div className="bg-surface border border-zinc-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-900 text-zinc-500 uppercase text-xs font-bold">
                     <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Tags</th>
                        <th className="px-6 py-4">Last Active</th>
                        <th className="px-6 py-4">Joined</th>
                        <th className="px-6 py-4">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                     {filteredContacts.length > 0 ? (
                        filteredContacts.map(contact => (
                           <tr key={contact.id} className="hover:bg-zinc-800/50 transition-colors group">
                              <td className="px-6 py-4 flex items-center gap-3">
                                 <div className="w-8 h-8 rounded bg-zinc-700 flex items-center justify-center text-xs text-white font-bold">{contact.avatar}</div>
                                 <div>
                                    <p className="text-white font-medium">{contact.name}</p>
                                    <p className="text-xs">@{contact.username}</p>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${contact.status === 'subscribed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {contact.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex gap-1">
                                    {contact.tags.length > 0 ? contact.tags.map(t => (
                                       <span key={t.id} className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-[10px]">{t.name}</span>
                                    )) : <span className="text-zinc-600">-</span>}
                                 </div>
                              </td>
                              <td className="px-6 py-4">{contact.lastActive}</td>
                              <td className="px-6 py-4">{contact.joinedAt}</td>
                              <td className="px-6 py-4">
                                 <button onClick={() => handleChat(contact.name)} className="text-primary hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity">Chat</button>
                              </td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                           <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No contacts found matching your filters.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 text-center text-xs text-zinc-500">
               Showing {filteredContacts.length} of {initialContacts.length} contacts
            </div>
         </div>
      </div>
   );
};