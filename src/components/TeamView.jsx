import React, { useContext, useState } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { Plus, Trash2, Briefcase, UserPlus, Users, UserMinus, Crown, Star } from 'lucide-react';
import './TeamView.css';

const TeamView = () => {
  const { 
    members, 
    addMember, 
    deleteMember, 
    allTasks,
    tasks, // Tasks filtered for the active project
    projects,
    activeProjectId,
    addMemberToProject,
    removeMemberFromProject,
    setProjectLead
  } = useContext(ProjectContext);
  
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Forms State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [selectedAddMemberId, setSelectedAddMemberId] = useState('');

  const handleCreateMember = (e) => {
    e.preventDefault();
    if (name.trim()) {
      addMember(name.trim(), role.trim(), color);
      setName('');
      setRole('');
      // Random color
      const colors = ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444'];
      setColor(colors[Math.floor(Math.random() * colors.length)]);
    }
  };

  const handleAddMemberToProjectSubmit = (e) => {
    e.preventDefault();
    if (selectedAddMemberId) {
      addMemberToProject(activeProjectId, selectedAddMemberId);
      setSelectedAddMemberId('');
    }
  };

  // Filter members based on project assignment
  const projectMembers = members.filter(m => {
    if (activeProject && activeProject.memberIds) {
      return activeProject.memberIds.includes(m.id);
    }
    return false;
  });

  const nonProjectMembers = members.filter(m => {
    if (activeProject && activeProject.memberIds) {
      return !activeProject.memberIds.includes(m.id);
    }
    return true;
  });

  // Calculate workloads
  const getProjectWorkload = (memberId) => {
    return tasks.filter(t => t && t.assigneeId === memberId && t.status !== 'done').length;
  };

  const getGlobalWorkload = (memberId) => {
    return allTasks.filter(t => t && t.assigneeId === memberId && t.status !== 'done').length;
  };

  return (
    <div className="team-view fade-in">
      {/* View Header */}
      <div className="view-header">
        <h1 className="view-title">Quản Lý Thành Viên</h1>
        <p className="view-subtitle">
          Phân công thành viên tham gia dự án **{activeProject?.name}** và quản lý nhân sự công ty.
        </p>
      </div>

      <div className="team-layout">
        {/* Left Side: Setup Forms */}
        <div className="team-sidebar-pane">
          {/* Add member to active project form */}
          {activeProject && (
            <div className="add-member-card glass-panel form-card">
              <div className="card-header-row">
                <Users size={20} className="icon-accent" />
                <h3 className="card-title-text">Thêm vào dự án này</h3>
              </div>
              <p className="form-info-text">Chỉ định nhân sự công ty tham gia vào dự án hiện tại.</p>

              {nonProjectMembers.length > 0 ? (
                <form onSubmit={handleAddMemberToProjectSubmit} className="add-member-form">
                  <div className="input-group">
                    <label>Chọn nhân viên</label>
                    <select 
                      value={selectedAddMemberId}
                      onChange={(e) => setSelectedAddMemberId(e.target.value)}
                      required
                    >
                      <option value="">-- Chọn nhân viên --</option>
                      {nonProjectMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="add-member-submit-btn project-add-btn clickable">
                    <Plus size={16} />
                    <span>Thêm vào dự án</span>
                  </button>
                </form>
              ) : (
                <p className="no-more-members-text">Tất cả nhân viên đã tham gia dự án này.</p>
              )}
            </div>
          )}

          {/* Create Member globally form */}
          <div className="add-member-card glass-panel form-card">
            <div className="card-header-row">
              <UserPlus size={20} className="icon-accent" />
              <h3 className="card-title-text">Tạo nhân viên mới</h3>
            </div>
            <p className="form-info-text">Đăng ký hồ sơ nhân viên mới vào danh bạ công ty.</p>

            <form onSubmit={handleCreateMember} className="add-member-form">
              <div className="input-group">
                <label>Họ và tên</label>
                <input 
                  type="text" 
                  placeholder="Nhập họ và tên..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Vai trò / Chức danh</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Designer, Developer..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Màu sắc nhận diện</label>
                <div className="color-picker-row">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="color-picker-input"
                  />
                  <span className="color-code-label">{color.toUpperCase()}</span>
                  <div 
                    className="color-preview-circle" 
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>

              <button type="submit" className="add-member-submit-btn clickable">
                <Plus size={16} />
                <span>Tạo Nhân Viên</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Two Grid Boards */}
        <div className="members-directory">
          {/* Section 1: Project Specific Members */}
          <div className="directory-section">
            <div className="directory-header-row">
              <h3 className="section-heading-text text-gradient">
                Thành viên dự án: {activeProject?.name} ({projectMembers.length})
              </h3>
              {projectMembers.length > 0 && (
                <div className="lead-selector-dropdown-wrapper">
                  <label htmlFor="lead-select">Trưởng dự án:</label>
                  <select 
                    id="lead-select"
                    value={activeProject?.leadId || ''}
                    onChange={(e) => setProjectLead(activeProjectId, e.target.value)}
                    className="lead-select-dropdown clickable"
                  >
                    <option value="">-- Chưa chỉ định --</option>
                    {projectMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {projectMembers.length > 0 ? (
              <div className="members-grid">
                {projectMembers.map((member) => {
                  const projectWorkload = getProjectWorkload(member.id);
                  const isLead = activeProject?.leadId === member.id;
                  
                  return (
                    <div key={member.id} className={`member-card glass-panel hover-lift project-member-card ${isLead ? 'lead-active' : ''}`}>
                      {/* Lead Badge Indicator */}
                      {isLead && (
                        <div className="project-lead-badge-overlay" title="Trưởng dự án / Người chịu trách nhiệm chính">
                          <Crown size={11} />
                          <span>Trưởng dự án</span>
                        </div>
                      )}

                      {/* Member Actions */}
                      <div className="member-card-actions">
                        {!isLead && (
                          <button 
                            className="member-action-btn set-lead clickable"
                            onClick={() => setProjectLead(activeProjectId, member.id)}
                            title={`Chỉ định ${member.name} làm trưởng dự án`}
                          >
                            <Crown size={14} />
                          </button>
                        )}
                        <button 
                          className="member-action-btn remove-proj clickable"
                          onClick={() => removeMemberFromProject(activeProjectId, member.id)}
                          title={`Loại ${member.name} khỏi dự án này`}
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>

                      {/* Avatar */}
                      <div 
                        className="member-card-avatar"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.avatar}
                      </div>

                      <h4 className="member-card-name">{member.name}</h4>
                      <span className="member-card-role">
                        <Briefcase size={12} className="role-icon" /> {member.role}
                      </span>

                      <div className="member-workload-badge project-workload">
                        <span className="workload-value">{projectWorkload}</span>
                        <span className="workload-label">Task dự án này</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-members-card glass-panel">
                Dự án này hiện chưa có thành viên nào. Hãy chọn và thêm nhân sự ở cột bên trái!
              </div>
            )}
          </div>

          {/* Section 2: All Company Directory */}
          <div className="directory-section company-directory-section">
            <h3 className="section-heading-text">
              Danh sách Nhân sự Công ty ({members.length})
            </h3>
            <div className="members-grid">
              {members.map((member) => {
                const globalWorkload = getGlobalWorkload(member.id);
                const isAssignedToProject = activeProject?.memberIds?.includes(member.id);
                
                return (
                  <div key={member.id} className="member-card glass-panel company-member-card">
                    {/* Delete member globally */}
                    <button 
                      className="member-delete-btn clickable global-delete-btn"
                      onClick={() => deleteMember(member.id)}
                      title={`Xóa nhân viên ${member.name} khỏi hệ thống`}
                    >
                      <Trash2 size={15} />
                    </button>

                    {/* Avatar */}
                    <div 
                      className="member-card-avatar mini"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.avatar}
                    </div>

                    <div className="company-member-details">
                      <h4 className="member-card-name text-left">{member.name}</h4>
                      <span className="member-card-role text-left">
                        <Briefcase size={12} className="role-icon" /> {member.role}
                      </span>
                    </div>

                    <div className="company-member-stats">
                      <span className="comp-stat-badge" title="Tổng số task đang chạy trên hệ thống">
                        {globalWorkload} tasks
                      </span>
                      <span className={`comp-project-status ${isAssignedToProject ? 'active' : 'inactive'}`}>
                        {isAssignedToProject ? 'Trong dự án' : 'Ngoài dự án'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamView;
