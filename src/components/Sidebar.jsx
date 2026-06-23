import React, { useContext, useState } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { 
  Home,
  LayoutDashboard, 
  KanbanSquare, 
  ListTodo, 
  GitFork, 
  Users, 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  Plus, 
  FolderGit2,
  Trash2,
  RefreshCw,
  LogOut,
  Settings
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const {
    projects,
    members,
    activeProjectId,
    setActiveProjectId,
    activeTab,
    setActiveTab,
    theme,
    setTheme,
    addProject,
    deleteProject,
    exportData,
    importData,
    googleToken,
    googleProfile,
    googleClientId,
    saveGoogleClientId,
    syncState,
    lastSyncTime,
    handleGoogleLogin,
    handleGoogleLogout,
    syncWithDrive
  } = useContext(ProjectContext);

  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectLeadId, setNewProjectLeadId] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(googleClientId);

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      addProject(newProjectName.trim(), newProjectDesc.trim(), newProjectLeadId);
      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectLeadId('');
      setNewProjectOpen(false);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        importData(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'home', label: 'Trang chủ', icon: <Home size={18} /> },
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={18} /> },
    { id: 'kanban', label: 'Bảng Kanban', icon: <KanbanSquare size={18} /> },
    { id: 'list', label: 'Danh sách', icon: <ListTodo size={18} /> },
    { id: 'gantt', label: 'Tiến độ Gantt', icon: <GitFork size={18} /> },
    { id: 'team', label: 'Thành viên', icon: <Users size={18} /> }
  ];

  return (
    <aside className="sidebar glass-panel">
      {/* Brand Header */}
      <div className="brand clickable" onClick={() => setActiveTab('home')} title="Về trang chủ hệ thống">
        <div className="brand-logo text-glow">N</div>
        <span className="brand-name text-gradient">Nexus PM</span>
      </div>

      {/* Main Tabs Navigation */}
      <nav className="nav-section">
        <span className="section-title">GIAO DIỆN</span>
        <ul className="nav-list">
          {tabs.map((tab) => {
            const isDisabled = tab.id !== 'home' && activeTab === 'home';
            return (
              <li key={tab.id}>
                <button 
                  className={`nav-btn clickable ${activeTab === tab.id ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  title={isDisabled ? 'Vui lòng chọn một dự án để xem chi tiết' : tab.label}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Projects List Section */}
      <div className="nav-section">
        <div className="section-header">
          <span className="section-title">DỰ ÁN</span>
          <button 
            className="add-btn clickable" 
            onClick={() => setNewProjectOpen(!newProjectOpen)}
            title="Thêm dự án mới"
          >
            <Plus size={14} />
          </button>
        </div>

        {newProjectOpen && (
          <form className="new-project-form" onSubmit={handleCreateProject}>
            <input 
              type="text" 
              placeholder="Tên dự án..." 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              required
              autoFocus
            />
            <input 
              type="text" 
              placeholder="Mô tả..." 
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
            />
            <select 
              value={newProjectLeadId}
              onChange={(e) => setNewProjectLeadId(e.target.value)}
              required
              className="new-project-lead-select"
            >
              <option value="">-- Người chịu trách nhiệm --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <div className="form-actions">
              <button type="submit" className="submit-btn clickable">Tạo</button>
              <button 
                type="button" 
                className="cancel-btn clickable" 
                onClick={() => {
                  setNewProjectOpen(false);
                  setNewProjectLeadId('');
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        <ul className="project-list">
          {projects.map((proj) => {
            const leadMember = members.find(m => m.id === proj.leadId);
            return (
              <li key={proj.id} className="project-list-item">
                <button 
                  className={`project-btn clickable ${(activeProjectId === proj.id && activeTab !== 'home') ? 'active' : ''}`}
                  onClick={() => {
                    setActiveProjectId(proj.id);
                    if (activeTab === 'home') {
                      setActiveTab('gantt');
                    }
                  }}
                >
                  <FolderGit2 size={16} />
                  <span className="project-name-text" title={proj.name}>{proj.name}</span>
                  {leadMember && (
                    <div 
                      className="project-lead-mini-avatar" 
                      style={{ backgroundColor: leadMember.color }}
                      title={`Chịu trách nhiệm: ${leadMember.name} (${leadMember.role})`}
                    >
                      {leadMember.avatar}
                    </div>
                  )}
                </button>
                {projects.length > 1 && (
                  <button 
                    className="project-delete-btn clickable"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(proj.id);
                    }}
                    title={`Xóa dự án "${proj.name}"`}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Team Section */}
      <div className="nav-section team-section">
        <span className="section-title clickable" onClick={() => setActiveTab('team')}>THÀNH VIÊN ({members.length})</span>
        <div className="member-avatars clickable" onClick={() => setActiveTab('team')}>
          {members.map((member) => (
            <div 
              key={member.id} 
              className="member-avatar"
              style={{ backgroundColor: member.color }}
              title={`${member.name} (${member.role})`}
            >
              {member.avatar}
            </div>
          ))}
        </div>
      </div>

      {/* Google Drive Sync Controls */}
      <div className="drive-sync-section">
        <div className="drive-sync-header">
          <span className="section-title">Đồng bộ đám mây</span>
          <button 
            className={`drive-settings-toggle-btn clickable ${settingsOpen ? 'active' : ''}`}
            onClick={() => setSettingsOpen(!settingsOpen)}
            title="Cấu hình Google Client ID"
          >
            <Settings size={14} />
          </button>
        </div>

        {settingsOpen && (
          <form className="drive-settings-form glass-panel" onSubmit={(e) => {
            e.preventDefault();
            saveGoogleClientId(clientIdInput);
            setSettingsOpen(false);
            alert('Đã lưu cấu hình Google Client ID!');
          }}>
            <span className="drive-settings-label">Google OAuth Client ID:</span>
            <input 
              type="text"
              className="drive-settings-input"
              placeholder="Nhập Client ID..."
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              required
            />
            <div className="drive-settings-help">
              * Lưu ý: Hãy đảm bảo Client ID đã đăng ký domain <code>{window.location.origin}</code> trong mục <strong>Authorized JavaScript Origins</strong> của Google Cloud Console.
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn clickable">Lưu</button>
              <button type="button" className="cancel-btn clickable" onClick={() => {
                setClientIdInput(googleClientId);
                setSettingsOpen(false);
              }}>Hủy</button>
            </div>
          </form>
        )}

        {!googleToken ? (
          <button className="drive-connect-btn clickable" onClick={handleGoogleLogin}>
            <svg className="google-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="#EA4335" d="M12 5.04c1.67 0 3.2.58 4.38 1.69l3.27-3.27C17.67 1.63 15.02 1 12 1 7.37 1 3.42 3.66 1.5 7.56l3.96 3.07C6.38 7.56 8.96 5.04 12 5.04z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.6-.2-2.36H12v4.51h6.45c-.28 1.48-1.11 2.73-2.36 3.58v2.98h3.82c2.23-2.05 3.58-5.07 3.58-8.71z"/>
              <path fill="#FBBC05" d="M5.46 10.63c-.24-.73-.38-1.51-.38-2.31s.14-1.58.38-2.31L1.5 2.94C.54 4.88 0 7.07 0 9.38s.54 4.5 1.5 6.44l3.96-3.19z"/>
              <path fill="#34A853" d="M12 18.96c-3.04 0-5.62-2.52-6.54-5.59L1.5 16.56C3.42 20.34 7.37 23 12 23c2.98 0 5.62-1.02 7.51-2.77l-3.82-2.98c-1.05.71-2.4 1.71-3.69 1.71z"/>
            </svg>
            <span>Kết nối Google Drive</span>
          </button>
        ) : (
          <div className="drive-sync-panel glass-panel">
            <div className="drive-user-info">
              {googleProfile?.picture ? (
                <img src={googleProfile.picture} alt="Google Avatar" className="drive-avatar" />
              ) : (
                <div className="drive-avatar-placeholder">
                  {googleProfile?.name ? googleProfile.name.charAt(0).toUpperCase() : 'G'}
                </div>
              )}
              <div className="drive-user-meta">
                <span className="drive-user-name" title={googleProfile?.name}>{googleProfile?.name || 'Tài khoản Google'}</span>
                <span className={`drive-sync-time ${syncState}`}>
                  {syncState === 'syncing' ? 'Đang đồng bộ...' : 
                   syncState === 'error' ? 'Lỗi đồng bộ' : 
                   lastSyncTime ? `Đã lưu: ${lastSyncTime}` : 'Đã kết nối'}
                </span>
              </div>
            </div>
            <div className="drive-actions">
              <button 
                className={`drive-action-btn sync clickable ${syncState === 'syncing' ? 'spinning' : ''}`}
                onClick={() => syncWithDrive(googleToken, false)}
                title="Đồng bộ ngay"
                disabled={syncState === 'syncing'}
              >
                <RefreshCw size={14} />
              </button>
              <button 
                className="drive-action-btn logout clickable"
                onClick={handleGoogleLogout}
                title="Đăng xuất Google Drive"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer Controls */}
      <div className="sidebar-footer">
        <div className="divider"></div>
        <div className="footer-controls">
          {/* Theme Toggle */}
          <button 
            className="control-btn clickable"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Export JSON */}
          <button 
            className="control-btn clickable"
            onClick={exportData}
            title="Xuất dữ liệu dự án (JSON)"
          >
            <Download size={18} />
          </button>

          {/* Import JSON */}
          <label className="control-btn clickable" title="Nhập dữ liệu dự án (JSON)">
            <Upload size={18} />
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportFile} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
