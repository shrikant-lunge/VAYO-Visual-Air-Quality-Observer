import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShieldOff, ShieldCheck, Trash2, LogOut,
  Search, RefreshCw, AlertTriangle, Loader, CheckCircle,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import '../styles/AdminDashboard.css';

/* ── helpers ─────────────────────────────────────── */
const getSession = () => {
  try {
    const s = localStorage.getItem('adminSession');
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

/* ── component ───────────────────────────────────── */
const AdminDashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers]             = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // uid of user being acted on

  // Confirm-delete modal state
  const [confirmUser, setConfirmUser] = useState(null); // { uid, name, email }
  const [deleting, setDeleting]       = useState(false);

  // Toast
  const [toast, setToast]             = useState(null); // { type: 'success'|'error', msg }

  const session = getSession();

  /* ── data loading ─────────────────────────────── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API_BASE_URL}/api/admin/users`);
      if (resp.data.status === 'success') {
        setUsers(resp.data.users || []);
      }
    } catch (err) {
      showToast('error', 'Failed to fetch users.');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter on search
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(users);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        users.filter(
          (u) =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.uid?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, users]);

  /* ── toast util ───────────────────────────────── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── logout ───────────────────────────────────── */
  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/admin-login', { replace: true });
  };

  /* ── block ────────────────────────────────────── */
  const handleBlock = async (uid) => {
    setActionLoading(uid);
    try {
      await axios.post(`${API_BASE_URL}/api/admin/users/${uid}/block`);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, status: 'blocked' } : u))
      );
      showToast('success', 'User blocked successfully.');
    } catch {
      showToast('error', 'Failed to block user.');
    } finally {
      setActionLoading(null);
    }
  };

  /* ── unblock ──────────────────────────────────── */
  const handleUnblock = async (uid) => {
    setActionLoading(uid);
    try {
      await axios.post(`${API_BASE_URL}/api/admin/users/${uid}/unblock`);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, status: 'active' } : u))
      );
      showToast('success', 'User unblocked successfully.');
    } catch {
      showToast('error', 'Failed to unblock user.');
    } finally {
      setActionLoading(null);
    }
  };

  /* ── delete ───────────────────────────────────── */
  const handleDeleteConfirm = async () => {
    if (!confirmUser) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${confirmUser.uid}`);
      setUsers((prev) => prev.filter((u) => u.uid !== confirmUser.uid));
      showToast('success', `${confirmUser.name || confirmUser.email} deleted.`);
      setConfirmUser(null);
    } catch {
      showToast('error', 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  /* ── stats ────────────────────────────────────── */
  const totalUsers   = users.length;
  const activeUsers  = users.filter((u) => (u.status || 'active') !== 'blocked').length;
  const blockedUsers = users.filter((u) => u.status === 'blocked').length;

  /* ── render ───────────────────────────────────── */
  return (
    <div className="admin-page">
      {/* ── Header ──────────────────────────── */}
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-header-icon">🛡️</div>
          <div>
            <div className="admin-header-title">Admin Dashboard</div>
            <div className="admin-header-meta">
              Logged in as &nbsp;
              <span style={{ color: 'var(--accent)' }}>
                {session?.username || 'Admin'}
              </span>
            </div>
          </div>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-logout-btn"
            onClick={fetchUsers}
            title="Refresh user list"
            style={{ gap: '6px' }}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────── */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon stat-icon-total">
            <Users size={20} color="#3b82f6" />
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{totalUsers}</div>
            <div className="admin-stat-label">Total Users</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon stat-icon-active">
            <ShieldCheck size={20} color="var(--accent)" />
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{activeUsers}</div>
            <div className="admin-stat-label">Active</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon stat-icon-blocked">
            <ShieldOff size={20} color="#f87171" />
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{blockedUsers}</div>
            <div className="admin-stat-label">Blocked</div>
          </div>
        </div>
      </div>

      {/* ── Users Table ─────────────────────── */}
      <div className="admin-users-section">
        <div className="admin-users-header">
          <div className="admin-users-title">
            Registered Users
            {!loading && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginLeft: '10px',
                }}
              >
                ({filtered.length})
              </span>
            )}
          </div>
          <div className="admin-search-wrap">
            <span className="admin-search-icon">
              <Search size={14} />
            </span>
            <input
              className="admin-search-input"
              type="text"
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-table-empty">
            <div className="admin-spinner" />
            <p>Loading users…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-table-empty">
            <p>{search ? 'No users match your search.' : 'No users found.'}</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>UID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const isBlocked  = user.status === 'blocked';
                  const isBusy     = actionLoading === user.uid;

                  return (
                    <tr key={user.uid}>
                      <td>{user.name || '—'}</td>
                      <td>{user.email || '—'}</td>
                      <td>
                        <span className="uid-cell" title={user.uid}>
                          {user.uid}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${isBlocked ? 'blocked' : 'active'}`}
                        >
                          <span className="status-dot" />
                          {isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          {isBlocked ? (
                            <button
                              className="action-btn unblock"
                              onClick={() => handleUnblock(user.uid)}
                              disabled={isBusy}
                              title="Unblock user"
                            >
                              {isBusy
                                ? <Loader size={11} className="animate-spin" />
                                : <ShieldCheck size={11} />}
                              Unblock
                            </button>
                          ) : (
                            <button
                              className="action-btn block"
                              onClick={() => handleBlock(user.uid)}
                              disabled={isBusy}
                              title="Block user"
                            >
                              {isBusy
                                ? <Loader size={11} className="animate-spin" />
                                : <ShieldOff size={11} />}
                              Block
                            </button>
                          )}
                          <button
                            className="action-btn delete"
                            onClick={() =>
                              setConfirmUser({
                                uid: user.uid,
                                name: user.name,
                                email: user.email,
                              })
                            }
                            disabled={isBusy}
                            title="Delete user"
                          >
                            <Trash2 size={11} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Confirm Delete Modal ─────────────── */}
      {confirmUser && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('modal-overlay')) setConfirmUser(null);
          }}
        >
          <div className="confirm-modal">
            <div className="confirm-modal-icon">⚠️</div>
            <h3>Delete User?</h3>
            <p>
              This will permanently remove the user from Firebase Auth, the
              database, and add their email to the blacklist. This action cannot
              be undone.
            </p>
            <div className="confirm-modal-user">
              <strong>{confirmUser.name || 'Unknown'}</strong>
              <br />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {confirmUser.email}
              </span>
            </div>
            <div className="confirm-modal-actions">
              <button
                className="confirm-cancel-btn"
                onClick={() => setConfirmUser(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────── */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === 'success'
            ? <CheckCircle size={16} />
            : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
