import React, { useContext, useState } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { 
  FolderKanban, 
  CheckCircle2, 
  Users, 
  AlertCircle, 
  Plus, 
  Crown, 
  Briefcase, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import './HomeView.css';

const HomeView = () => {
  const { 
    projects, 
    allTasks, 
    members, 
    setActiveProjectId, 
    setActiveTab, 
    addProject 
  } = useContext(ProjectContext);

  // Form State for Quick Add Project Card
  const [isAdding, setIsAdding] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLeadId, setProjLeadId] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate Global KPIs
  const totalProjects = projects.length;
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t && t.status === 'done').length;
  const totalMembers = members.length;
  const globalProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter out High-Priority Pending Tasks across all projects
  const criticalTasks = allTasks
    .filter(t => t && t.priority === 'high' && t.status !== 'done')
    .slice(0, 5);

  const handleCreateProjectSubmit = (e) => {
    e.preventDefault();
    if (projName.trim()) {
      addProject(projName.trim(), projDesc.trim(), projLeadId);
      setProjName('');
      setProjDesc('');
      setProjLeadId('');
      setIsAdding(false);
    }
  };

  const handleOpenProject = (projId, tabId = 'gantt') => {
    setActiveProjectId(projId);
    setActiveTab(tabId);
  };

  return (
    <div className="home-view fade-in">
      {/* Welcome Banner */}
      <div className="view-header home-header">
        <div>
          <h1 className="view-title text-gradient">Trang Chủ Hệ Thống</h1>
          <p className="view-subtitle">Tổng quan tiến độ tất cả dự án và phân tích hiệu suất nhân sự.</p>
        </div>
      </div>

      {/* Global Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card glass-panel hover-lift">
          <div className="stat-icon-wrapper blue">
            <FolderKanban size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{totalProjects}</span>
            <span className="stat-label">Tổng Số Dự Án</span>
          </div>
        </div>

        <div className="stat-card glass-panel hover-lift">
          <div className="stat-icon-wrapper green">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{completedTasks}/{totalTasks}</span>
            <span className="stat-label">Công Việc Hoàn Thành</span>
          </div>
        </div>

        <div className="stat-card glass-panel hover-lift">
          <div className="stat-icon-wrapper purple">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{totalMembers}</span>
            <span className="stat-label">Nhân Sự Hoạt Động</span>
          </div>
        </div>

        <div className="stat-card glass-panel hover-lift">
          <div className="stat-icon-wrapper amber">
            <div className="radial-progress-mini">
              <span className="radial-progress-value">{globalProgress}%</span>
            </div>
          </div>
          <div className="stat-details">
            <span className="stat-value">{globalProgress}%</span>
            <span className="stat-label">Tiến Độ Toàn Cục</span>
          </div>
        </div>
      </div>

      {/* Projects Grid Section */}
      <div className="home-section">
        <h2 className="section-title-large">Danh Sách Dự Án Đang Chạy</h2>
        
        <div className="projects-grid">
          {projects.map((proj) => {
            const projTasks = allTasks.filter(t => t && t.projectId === proj.id);
            const totalProjTasks = projTasks.length;
            const completedProjTasks = projTasks.filter(t => t.status === 'done').length;
            const progress = totalProjTasks > 0 ? Math.round((completedProjTasks / totalProjTasks) * 100) : 0;
            const lead = members.find(m => m.id === proj.leadId);
            
            // Calculate Project Status
            const overdueProjTasks = projTasks.filter(t => t.status !== 'done' && t.planEndDate && t.planEndDate < todayStr).length;
            let statusLabel = 'Đang chạy';
            let statusClass = 'active';
            
            if (overdueProjTasks > 0) {
              statusLabel = 'Trễ hạn';
              statusClass = 'delayed';
            } else if (progress === 100 && totalProjTasks > 0) {
              statusLabel = 'Hoàn thành';
              statusClass = 'completed';
            } else if (totalProjTasks === 0) {
              statusLabel = 'Chưa bắt đầu';
              statusClass = 'empty';
            }

            // Project member avatars
            const projMembers = members.filter(m => proj.memberIds?.includes(m.id));

            return (
              <div 
                key={proj.id} 
                className="project-summary-card glass-panel hover-lift clickable"
                onClick={() => handleOpenProject(proj.id, 'gantt')}
              >
                {/* Top Badge Info */}
                <div className="card-top-row">
                  <span className={`proj-status-badge ${statusClass}`}>{statusLabel}</span>
                  {overdueProjTasks > 0 && (
                    <span className="overdue-warning" title={`${overdueProjTasks} task quá hạn`}>
                      <AlertCircle size={14} />
                      <span>{overdueProjTasks} trễ</span>
                    </span>
                  )}
                </div>

                {/* Body details */}
                <h3 className="proj-card-title">{proj.name}</h3>
                <p className="proj-card-desc">{proj.description || 'Chưa có mô tả chi tiết cho dự án này.'}</p>

                {/* Progress bar */}
                <div className="proj-progress-section">
                  <div className="progress-label-row">
                    <span className="progress-pct-text">{progress}% Hoàn thành</span>
                    <span className="progress-ratio">{completedProjTasks}/{totalProjTasks} Tasks</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className={`progress-bar-fill ${statusClass}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Lead and Members row */}
                <div className="card-footer-row">
                  {lead ? (
                    <div className="proj-card-lead" title={`Trưởng dự án: ${lead.name}`}>
                      <div className="lead-avatar-mini" style={{ backgroundColor: lead.color }}>
                        {lead.avatar}
                      </div>
                      <div className="lead-details-mini">
                        <span className="lead-role-title"><Crown size={10} className="crown-icon-mini" /> Lead</span>
                        <span className="lead-name-text">{lead.name}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="no-lead-text">Chưa chọn Lead</span>
                  )}

                  {/* Members Avatars Stack */}
                  <div className="members-avatar-stack">
                    {projMembers.slice(0, 3).map(m => (
                      <div 
                        key={m.id} 
                        className="stack-avatar" 
                        style={{ backgroundColor: m.color }}
                        title={`${m.name} (${m.role})`}
                      >
                        {m.avatar}
                      </div>
                    ))}
                    {projMembers.length > 3 && (
                      <div className="stack-avatar extra" title={`Và ${projMembers.length - 3} thành viên khác`}>
                        +{projMembers.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="open-proj-arrow">
                  <span>Mở chi tiết</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            );
          })}

          {/* Quick Add Project Card */}
          {!isAdding ? (
            <div 
              className="project-summary-card add-project-card glass-panel hover-lift clickable"
              onClick={() => setIsAdding(true)}
            >
              <div className="add-proj-inner">
                <div className="add-proj-icon-circle">
                  <Plus size={24} />
                </div>
                <h3>Tạo Dự Án Mới</h3>
                <p>Khởi tạo và thiết lập tiến độ cho dự án tiếp theo.</p>
              </div>
            </div>
          ) : (
            <div className="project-summary-card add-project-form-card glass-panel fade-in">
              <h3 className="form-card-title">Tạo Dự Án Mới</h3>
              <form onSubmit={handleCreateProjectSubmit} className="add-project-card-form">
                <input 
                  type="text" 
                  placeholder="Tên dự án..." 
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  required
                  autoFocus
                />
                <textarea 
                  placeholder="Mô tả dự án..." 
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  rows="2"
                />
                <div className="input-group">
                  <select 
                    value={projLeadId}
                    onChange={(e) => setProjLeadId(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn trưởng dự án --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-actions-row">
                  <button type="submit" className="form-submit-btn clickable">Khởi tạo</button>
                  <button 
                    type="button" 
                    className="form-cancel-btn clickable" 
                    onClick={() => {
                      setIsAdding(false);
                      setProjName('');
                      setProjDesc('');
                      setProjLeadId('');
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Critical Tasks Table Section */}
      {criticalTasks.length > 0 && (
        <div className="home-section critical-tasks-section">
          <div className="section-title-row">
            <h2 className="section-title-large">Công Việc Cần Lưu Ý (Ưu tiên Cao)</h2>
            <span className="critical-count-badge">{criticalTasks.length} task khẩn cấp</span>
          </div>

          <div className="critical-tasks-table-wrapper glass-panel">
            <table className="critical-tasks-table">
              <thead>
                <tr>
                  <th>Tên Công Việc</th>
                  <th>Dự Án</th>
                  <th>Người Phụ Trách</th>
                  <th>Thời Hạn Kế Hoạch</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {criticalTasks.map((task) => {
                  const project = projects.find(p => p.id === task.projectId);
                  const assignee = members.find(m => m.id === task.assigneeId);
                  
                  const getStatusLabel = (status) => {
                    switch (status) {
                      case 'todo': return 'Cần Làm';
                      case 'in_progress': return 'Đang Làm';
                      case 'in_review': return 'Đợi Duyệt';
                      default: return 'Cần Làm';
                    }
                  };

                  const getStatusClass = (status) => {
                    switch (status) {
                      case 'todo': return 'status-todo';
                      case 'in_progress': return 'status-progress';
                      case 'in_review': return 'status-review';
                      default: return 'status-todo';
                    }
                  };

                  const formatDate = (dateStr) => {
                    if (!dateStr) return 'Chưa set';
                    const [year, month, day] = dateStr.split('-');
                    return `${day}/${month}/${year}`;
                  };

                  return (
                    <tr key={task.id} className="critical-task-row">
                      <td className="task-title-cell font-medium">{task.title}</td>
                      <td className="task-project-cell">
                        <span className="project-name-badge">{project?.name || 'Dự án khác'}</span>
                      </td>
                      <td className="task-assignee-cell">
                        {assignee ? (
                          <div className="table-assignee">
                            <div 
                              className="table-assignee-avatar" 
                              style={{ backgroundColor: assignee.color }}
                            >
                              {assignee.avatar}
                            </div>
                            <span>{assignee.name}</span>
                          </div>
                        ) : (
                          <span className="unassigned-text">Chưa phân công</span>
                        )}
                      </td>
                      <td className="task-deadline-cell">
                        <div className="deadline-wrapper">
                          <Calendar size={12} className="deadline-icon" />
                          <span>{formatDate(task.planEndDate)}</span>
                        </div>
                      </td>
                      <td className="task-status-cell">
                        <span className={`table-status-badge ${getStatusClass(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </td>
                      <td className="task-action-cell">
                        <button 
                          className="table-action-btn clickable"
                          onClick={() => handleOpenProject(task.projectId, 'kanban')}
                        >
                          Xem Bảng
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
