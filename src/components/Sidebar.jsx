import React, { useContext, useState } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { 
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
  Trash2
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
    importData
  } = useContext(ProjectContext);

  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectLeadId, setNewProjectLeadId] = useState('');

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
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={18} /> },
    { id: 'kanban', label: 'Bảng Kanban', icon: <KanbanSquare size={18} /> },
    { id: 'list', label: 'Danh sách', icon: <ListTodo size={18} /> },
    { id: 'gantt', label: 'Tiến độ Gantt', icon: <GitFork size={18} /> },
    { id: 'team', label: 'Thành viên', icon: <Users size={18} /> }
  ];

  return (
    <aside className="sidebar glass-panel">
      {/* Brand Header */}
      <div className="brand">
        <div className="brand-logo text-glow">N</div>
        <span className="brand-name text-gradient">Nexus PM</span>
      </div>

      {/* Main Tabs Navigation */}
      <nav className="nav-section">
        <span className="section-title">GIAO DIỆN</span>
        <ul className="nav-list">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button 
                className={`nav-btn clickable ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
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
                  className={`project-btn clickable ${activeProjectId === proj.id ? 'active' : ''}`}
                  onClick={() => setActiveProjectId(proj.id)}
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
