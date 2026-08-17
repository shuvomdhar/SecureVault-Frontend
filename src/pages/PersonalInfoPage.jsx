import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  Folder,
  Plus,
  Search,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Edit,
  Shield,
  ShieldAlert,
  Check,
  X,
  Lock,
  Layers,
  Sparkles,
  Info,
  FolderKey,
  Pencil,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PersonalInfoPage = () => {
  const navigate = useNavigate();
  const { user, token, showToast } = useAuth();

  const [folders, setFolders] = useState([]);
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('all'); // 'all', 'root', or folderId
  const [searchQuery, setSearchQuery] = useState('');

  // Folder Modal state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null); // null for create, folder object for edit
  const [newFolderName, setNewFolderName] = useState('');

  // Secret Modal state
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState(null);
  const [secretTitle, setSecretTitle] = useState('');
  const [secretFolderId, setSecretFolderId] = useState('');
  const [secretNotes, setSecretNotes] = useState('');
  const [columns, setColumns] = useState([
    { name: 'username', isSecured: false, value: '' },
    { name: 'password', isSecured: true, value: '' },
  ]);

  // Mask reveal toggle map { [`${secretId}-${colIndex}`]: boolean }
  const [revealedFields, setRevealedFields] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user, selectedFolder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Folders
      const resFolders = await fetch('/api/vault/folders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataFolders = await resFolders.json();
      if (dataFolders.success) {
        setFolders(dataFolders.folders);
      }

      // Fetch Secrets
      let url = '/api/vault/secrets';
      if (selectedFolder !== 'all') {
        url += `?folderId=${selectedFolder}`;
      }

      const resSecrets = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataSecrets = await resSecrets.json();
      if (dataSecrets.success) {
        setSecrets(dataSecrets.secrets);
      }
    } catch (err) {
      showToast('Failed to load vault data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open Folder Modal for Create
  const openCreateFolderModal = () => {
    setEditingFolder(null);
    setNewFolderName('');
    setIsFolderModalOpen(true);
  };

  // Open Folder Modal for Edit
  const openEditFolderModal = (folder, e) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setIsFolderModalOpen(true);
  };

  // Create or Update Folder
  const handleSaveFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const url = editingFolder
        ? `/api/vault/folders/${editingFolder._id}`
        : '/api/vault/folders';
      const method = editingFolder ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newFolderName }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      showToast(
        editingFolder
          ? `Folder renamed to '${data.folder.name}'!`
          : `Folder '${data.folder.name}' created successfully!`,
        'success'
      );
      setNewFolderName('');
      setEditingFolder(null);
      setIsFolderModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Folder
  const handleDeleteFolder = async (folderId, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete folder '${name}'? Secrets inside will be moved to root storage.`)) return;

    try {
      const res = await fetch(`/api/vault/folders/${folderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      showToast(`Folder '${name}' removed.`, 'info');
      if (selectedFolder === folderId) setSelectedFolder('all');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Dynamic Column Builder Handlers
  const handleAddColumn = () => {
    setColumns([...columns, { name: '', isSecured: false, value: '' }]);
  };

  const handleRemoveColumn = (index) => {
    if (columns.length <= 1) {
      showToast('At least one column is required.', 'error');
      return;
    }
    setColumns(columns.filter((_, idx) => idx !== index));
  };

  const handleColumnChange = (index, field, val) => {
    const updated = [...columns];
    updated[index][field] = val;
    setColumns(updated);
  };

  // Open Secret Modal for Create or Edit
  const openSecretModal = (secret = null) => {
    if (secret) {
      setEditingSecret(secret);
      setSecretTitle(secret.title);
      setSecretFolderId(secret.folderId || '');
      setSecretNotes(secret.notes || '');
      setColumns(secret.columns.map((c) => ({ ...c })));
    } else {
      setEditingSecret(null);
      setSecretTitle('');
      setSecretFolderId(selectedFolder === 'all' || selectedFolder === 'root' ? '' : selectedFolder);
      setSecretNotes('');
      setColumns([
        { name: 'username', isSecured: false, value: '' },
        { name: 'password', isSecured: true, value: '' },
      ]);
    }
    setIsSecretModalOpen(true);
  };

  // Save Secret (Create or Update)
  const handleSaveSecret = async (e) => {
    e.preventDefault();
    if (!secretTitle.trim()) {
      showToast('Secret title is required', 'error');
      return;
    }

    const payload = {
      title: secretTitle,
      folderId: secretFolderId || null,
      notes: secretNotes,
      columns,
    };

    try {
      const url = editingSecret ? `/api/vault/secrets/${editingSecret._id}` : '/api/vault/secrets';
      const method = editingSecret ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      showToast(`Secret '${data.secret.title}' saved successfully!`, 'success');
      setIsSecretModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Secret Item
  const handleDeleteSecret = async (secretId, title) => {
    if (!window.confirm(`Are you sure you want to delete secret '${title}'?`)) return;

    try {
      const res = await fetch(`/api/vault/secrets/${secretId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      showToast(`Secret '${title}' deleted`, 'info');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Toggle Masked Field Reveal
  const toggleReveal = (key) => {
    setRevealedFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Single-Click Copy Function
  const handleCopyText = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`Copied '${label}' to clipboard!`, 'success');
  };

  // Filter secrets by search query
  const filteredSecrets = secrets.filter((s) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(query);
    const colMatch = s.columns.some(
      (c) => c.name.toLowerCase().includes(query) || c.value.toLowerCase().includes(query)
    );
    return titleMatch || colMatch;
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FolderKey className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Personal Information & Secrets Storage
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize secrets in folders or store directly. Define custom columns with AES-256 field encryption.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateFolderModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 shadow-sm flex items-center gap-2 transition"
          >
            <FolderPlus className="w-4 h-4 text-purple-500" />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => openSecretModal(null)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Secret</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Folder Directory */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Folders Directory
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {folders.length} Folders
            </span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setSelectedFolder('all')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                selectedFolder === 'all'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4" /> All Secrets
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/20 text-current">
                {secrets.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedFolder('root')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                selectedFolder === 'root'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-amber-500" /> Root Vault (No Folder)
              </span>
            </button>

            {folders.map((f) => (
              <div key={f._id} className="group relative flex items-center">
                <button
                  onClick={() => setSelectedFolder(f._id)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                    selectedFolder === f._id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate pr-14">
                    <Folder className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </span>
                </button>

                {/* Folder Actions: Edit & Delete */}
                <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => openEditFolderModal(f, e)}
                    title="Rename Folder"
                    className="p-1 text-slate-400 hover:text-purple-400 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteFolder(f._id, f.name, e)}
                    title="Delete Folder"
                    className="p-1 text-slate-400 hover:text-rose-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Secrets List & Search */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search secrets by title, username, or column content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-sm"
            />
          </div>

          {/* Secrets Display Grid */}
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Loading secrets vault...
            </div>
          ) : filteredSecrets.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-dashed border-slate-300 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Secret Items Found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  {selectedFolder === 'all'
                    ? "You haven't saved any secrets yet. Click 'Add New Secret' above to get started!"
                    : "No secrets inside this folder. Create a new secret item or select a different folder."}
                </p>
              </div>
              <button
                onClick={() => openSecretModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-md"
              >
                Create Secret Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSecrets.map((secret) => {
                const folderObj = folders.find((f) => f._id === secret.folderId);

                return (
                  <div
                    key={secret._id}
                    className="glass-panel glass-panel-hover rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Top Banner */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                            {secret.title}
                          </h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 inline-block mt-1">
                            {folderObj ? `Folder: ${folderObj.name}` : 'Root Storage'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openSecretModal(secret)}
                            title="Edit Secret"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSecret(secret._id, secret.title)}
                            title="Delete Secret"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Columns List */}
                      <div className="space-y-2.5">
                        {secret.columns.map((col, idx) => {
                          const fieldKey = `${secret._id}-${idx}`;
                          const isRevealed = revealedFields[fieldKey];

                          return (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 space-y-1"
                            >
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <span>{col.name}</span>
                                  {col.isSecured && (
                                    <span
                                      title="Secured & Encrypted Field"
                                      className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold"
                                    >
                                      SECURED
                                    </span>
                                  )}
                                </span>
                                {/* Copy Column Name Button */}
                                <button
                                  onClick={() => handleCopyText(col.name, `Column Name: ${col.name}`)}
                                  title="Copy Column Name"
                                  className="text-[10px] text-purple-500 hover:underline flex items-center gap-0.5"
                                >
                                  <Copy className="w-3 h-3" /> Copy Header
                                </button>
                              </div>

                              <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                                <span className="truncate pr-2">
                                  {col.isSecured && !isRevealed ? '••••••••••••' : col.value || '(empty)'}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  {col.isSecured && (
                                    <button
                                      onClick={() => toggleReveal(fieldKey)}
                                      title={isRevealed ? 'Hide Secured Entry' : 'Reveal Secured Entry'}
                                      className="p-1 rounded text-slate-400 hover:text-purple-400 transition"
                                    >
                                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleCopyText(col.value, col.name)}
                                    title={`Copy ${col.name}`}
                                    className="p-1 rounded text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {secret.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                          "{secret.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT FOLDER MODAL */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-purple-500/30 text-white shadow-2xl space-y-4">
            <button
              onClick={() => setIsFolderModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-purple-400" />
              {editingFolder ? 'Rename Folder' : 'Create New Folder'}
            </h3>
            <p className="text-xs text-slate-400">
              {editingFolder
                ? 'Enter a new name for this folder category.'
                : "Name your folder (e.g., 'Instagram', 'Work Accounts') to categorize related secret credentials."}
            </p>
            <form onSubmit={handleSaveFolder} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Folder Name (e.g. Instagram)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-600/25"
              >
                {editingFolder ? 'Save Folder Name' : 'Create Folder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SECRET MODAL WITH DYNAMIC COLUMNS */}
      {isSecretModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-purple-500/30 text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSecretModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                {editingSecret ? 'Edit Secret Item' : 'Add New Secret Item'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Customize column names (e.g. username, password). Check 'Is Secured?' to encrypt entry text using AES-256.
              </p>
            </div>

            <form onSubmit={handleSaveSecret} className="space-y-6">
              {/* Secret Title & Folder */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Secret Item Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Instagram Account 1"
                    value={secretTitle}
                    onChange={(e) => setSecretTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Folder Category</label>
                  <select
                    value={secretFolderId}
                    onChange={(e) => setSecretFolderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">No Folder (Root Storage)</option>
                    {folders.map((f) => (
                      <option key={f._id} value={f._id}>
                        Folder: {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DYNAMIC COLUMNS SECTION */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Custom Columns & Values
                  </span>
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Column
                  </button>
                </div>

                <div className="space-y-3">
                  {columns.map((col, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Column Name (e.g. username, password)"
                          value={col.name}
                          onChange={(e) => handleColumnChange(idx, 'name', e.target.value)}
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          placeholder="Entry Value..."
                          value={col.value}
                          onChange={(e) => handleColumnChange(idx, 'value', e.target.value)}
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                          <input
                            type="checkbox"
                            checked={col.isSecured}
                            onChange={(e) => handleColumnChange(idx, 'isSecured', e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded border-slate-700 focus:ring-purple-500"
                          />
                          <span>Is Secured? (AES Encrypted in DB & Masked)</span>
                        </label>

                        {columns.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColumn(idx)}
                            className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or notes..."
                  value={secretNotes}
                  onChange={(e) => setSecretNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition shadow-lg shadow-purple-600/25"
              >
                {editingSecret ? 'Update Secret Item' : 'Save Secret Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
