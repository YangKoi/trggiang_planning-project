import React, { useContext, useState } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { Plus, Trash2, Users, Briefcase, UserPlus } from 'lucide-react';
import './TeamView.css';

const TeamView = () => {
  const { members, addMember, deleteMember, allTasks } = useContext(ProjectContext);
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [color, setColor] = useState('#6366f1'); // Default indigo

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      addMember(name.trim(), role.trim(), color);
      setName('');
      setRole('');
      // Randomize color for next member
      const colors = ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setColor(randomColor);
    }
  };

  const getMemberTasksCount = (memberId) => {
    // Count active tasks assigned to this member (tasks that are not done)
    return allTasks.filter(t => t && t.assigneeId === memberId && t.status !== 'done').length;
  };

  return (
    <div className="team-view fade-in">
      {/* View Header */}
      <div className="view-header">
        <h1 className="view-title">Quản Lý Thành Viên</h1>
        <p className="view-subtitle">Thêm, xóa thành viên và theo dõi khối lượng công việc hiện tại của họ.</p>
      </div>

      <div className="team-layout">
        {/* Left Side: Add Member Form */}
        <div className="add-member-card glass-panel">
          <div className="card-header-row">
            <UserPlus size={20} className="icon-accent" />
            <h3 className="card-title-text">Thêm thành viên mới</h3>
          </div>

          <form onSubmit={handleSubmit} className="add-member-form">
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
                placeholder="Ví dụ: Frontend Developer, QA..."
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
              <span>Thêm Thành Viên</span>
            </button>
          </form>
        </div>

        {/* Right Side: Members Directory Grid */}
        <div className="members-directory">
          <h3 className="section-heading-text">Danh sách nhân viên ({members.length})</h3>
          
          <div className="members-grid">
            {members.map((member) => {
              const activeTasksCount = getMemberTasksCount(member.id);
              
              return (
                <div key={member.id} className="member-card glass-panel hover-lift">
                  {/* Delete button */}
                  <button 
                    className="member-delete-btn clickable"
                    onClick={() => deleteMember(member.id)}
                    title={`Xóa thành viên ${member.name}`}
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* Avatar Bubble */}
                  <div 
                    className="member-card-avatar"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.avatar}
                  </div>

                  {/* Name and Role */}
                  <h4 className="member-card-name">{member.name}</h4>
                  <span className="member-card-role">
                    <Briefcase size={12} className="role-icon" /> {member.role}
                  </span>

                  {/* Workload Indicator */}
                  <div className="member-workload-badge">
                    <span className="workload-value">{activeTasksCount}</span>
                    <span className="workload-label">Công việc đang chạy</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamView;
