import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../lib/api';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [busy1, setBusy1] = useState(false);
  const [busy2, setBusy2] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy1(true);
    try {
      await api.patch('/api/user/profile', profile);
      await refreshUser();
      toast.success('Profile updated ✅');
    } catch (err) { toast.error(err.message); }
    finally { setBusy1(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setBusy2(true);
    try {
      await api.post('/api/auth/change-password', passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      toast.success('Password changed 🔐');
    } catch (err) { toast.error(err.message); }
    finally { setBusy2(false); }
  };

  return (
    <Sidebar>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-white">⚙️ Profile Settings</h1>

        <div className="glass p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neon to-electric text-2xl font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{user?.name}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
              <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${user?.role === 'ADMIN' ? 'bg-glow/20 text-glow' : 'bg-electric/15 text-electric'}`}>
                {user?.role === 'ADMIN' ? '👑 ADMIN' : '👤 USER'}
              </span>
              {!user?.isVerified && <span className="ml-2 inline-block rounded-full bg-amber-400/15 px-3 py-1 text-xs text-amber-300">Email not verified</span>}
            </div>
          </div>
        </div>

        <form onSubmit={saveProfile} className="glass space-y-4 p-6">
          <h2 className="font-semibold text-white">Personal Information</h2>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Full Name</label>
            <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Avatar URL</label>
            <input className="input" value={profile.avatar} onChange={(e) => setProfile({ ...profile, avatar: e.target.value })} placeholder="https://..." />
          </div>
          <button type="submit" disabled={busy1} className="btn-primary disabled:opacity-60">
            {busy1 ? 'Saving...' : '💾 Save Changes'}
          </button>
        </form>

        <form onSubmit={changePassword} className="glass space-y-4 p-6">
          <h2 className="font-semibold text-white">Change Password</h2>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Current Password</label>
            <input type="password" required className="input" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">New Password</label>
            <input type="password" required minLength={6} className="input" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
          </div>
          <button type="submit" disabled={busy2} className="btn-primary disabled:opacity-60">
            {busy2 ? 'Updating...' : '🔐 Change Password'}
          </button>
        </form>

        <div className="glass border border-rose-400/20 p-6">
          <h2 className="font-semibold text-rose-300">Danger Zone</h2>
          <p className="mt-2 text-sm text-slate-400">Account deletion is processed by administrators. Contact support to request deletion.</p>
        </div>
      </div>
    </Sidebar>
  );
}
