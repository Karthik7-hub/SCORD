import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Server, LogOut, CheckCircle, Mail, Lock } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { user, login, logout } = useAuth();

    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        const res = await login(email, pass);
        setLoading(false);
        if (!res.success) setError(res.msg);
    };

    const handleLogout = () => {
        logout();
    };

    // --- STATE: LOGGED IN ---
    if (user) return (
        <div className="auth-container">
            <div className="glass-card auth-card">
                <div className="auth-icon success">
                    <CheckCircle size={40} />
                </div>

                <h1 className="auth-title">Connected</h1>
                <p className="auth-desc">
                    Synced as <strong>{user.email}</strong>
                </p>

                <button className="btn btn-danger" onClick={handleLogout} style={{ width: '100%' }}>
                    <LogOut size={18} /> Logout & Switch to Guest
                </button>
            </div>

            <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ marginTop: 24 }}>
                <ArrowLeft size={20} /> Back to Dashboard
            </button>
        </div>
    );

    // --- STATE: LOGIN FORM ---
    return (
        <div className="auth-container">
            <div className="glass-card auth-card">
                <div className="auth-icon">
                    <Server size={40} />
                </div>

                <h1 className="auth-title">Server Sync</h1>
                <p className="auth-desc">
                    Sign in to backup your matches and sync across devices.
                </p>

                <form onSubmit={handleLogin} className="auth-form">

                    {error && <div className="auth-error">{error}</div>}

                    <div className="input-group">
                        <span className="input-label">Email Address</span>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="input-field"
                                type="email"
                                name="email"
                                id="email"
                                autoComplete="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                style={{ paddingLeft: 44 }} // Space for icon
                            />
                            <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 18 }} />
                        </div>
                    </div>

                    <div className="input-group">
                        <span className="input-label">Password</span>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="input-field"
                                type="password"
                                name="password"
                                id="password"
                                autoComplete="current-password"
                                value={pass}
                                onChange={e => setPass(e.target.value)}
                                placeholder="••••••••"
                                style={{ paddingLeft: 44 }} // Space for icon
                            />
                            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 18 }} />
                        </div>
                    </div>

                    <input type="submit" style={{ display: 'none' }} />

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 10 }}>
                        {loading ? 'Connecting...' : 'Login to Server'}
                    </button>
                </form>
            </div>

            <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ marginTop: 24 }}>
                <ArrowLeft size={20} /> Back to Dashboard
            </button>
        </div>
    );
}