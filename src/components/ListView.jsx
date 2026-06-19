import React, { useContext, useState } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { Search, Filter, ArrowUpDown, Calendar, HelpCircle, CheckSquare } from 'lucide-react';
import './ListView.css';

const ListView = ({ onSelectTask }) => {
  const { tasks, members } = useContext(ProjectContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('planEndDate'); // Default sort by deadline
  const [sortOrder, setSortOrder] = useState('asc'); // asc / desc

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredTasks = tasks
    .filter((task) => {
      const matchSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';

      if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        aVal = priorityWeight[a.priority] || 0;
        bVal = priorityWeight[b.priority] || 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusLabel = (status) => {
    switch (status) {
      case 'todo': return 'Cần làm';
      case 'in_progress': return 'Đang làm';
      case 'in_review': return 'Đợi duyệt';
      case 'done': return 'Đã xong';
      default: return 'Cần làm';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'todo': return 'status-todo';
      case 'in_progress': return 'status-progress';
      case 'in_review': return 'status-review';
      case 'done': return 'status-done';
      default: return 'status-todo';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return 'Thấp';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'prio-high';
      case 'medium': return 'prio-medium';
      case 'low': return 'prio-low';
      default: return 'prio-low';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <div className="list-view fade-in">
      {/* View Header */}
      <div className="view-header">
        <h1 className="view-title">Danh sách Công việc</h1>
        <p className="view-subtitle">Quản lý và lọc công việc dưới dạng bảng biểu trực quan.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar glass-panel">
        {/* Search */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm công việc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="filters-wrapper">
          {/* Status Filter */}
          <div className="filter-select">
            <Filter size={14} className="filter-icon" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="todo">Cần Làm</option>
              <option value="in_progress">Đang Làm</option>
              <option value="in_review">Đợi Duyệt</option>
              <option value="done">Đã Xong</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="filter-select">
            <Filter size={14} className="filter-icon" />
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">Tất cả Độ ưu tiên</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="table-container glass-panel">
        <table className="tasks-table">
          <thead>
            <tr>
              <th className="sortable text-left" onClick={() => handleSort('title')}>
                Tên công việc <ArrowUpDown size={14} className="sort-icon" />
              </th>
              <th>Người phụ trách</th>
              <th className="sortable" onClick={() => handleSort('status')}>
                Trạng thái <ArrowUpDown size={14} className="sort-icon" />
              </th>
              <th className="sortable" onClick={() => handleSort('priority')}>
                Độ ưu tiên <ArrowUpDown size={14} className="sort-icon" />
              </th>
              <th className="sortable" onClick={() => handleSort('planEndDate')}>
                Hạn kế hoạch <ArrowUpDown size={14} className="sort-icon" />
              </th>
              <th>Tiến độ</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const assignee = members.find((m) => m.id === task.assigneeId);
                const completedChecks = task.checklist.filter(c => c.isCompleted).length;
                const totalChecks = task.checklist.length;
                const progressPct = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : task.progress;

                return (
                  <tr 
                    key={task.id} 
                    className="task-row clickable"
                    onClick={() => onSelectTask(task.id)}
                  >
                    <td className="text-left">
                      <div className="task-title-cell">
                        <span className="task-title-bold">{task.title}</span>
                        {task.description && (
                          <span className="task-desc-muted">{task.description}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {assignee ? (
                        <div className="assignee-cell">
                          <div 
                            className="assignee-badge" 
                            style={{ backgroundColor: assignee.color }}
                          >
                            {assignee.avatar}
                          </div>
                          <span className="assignee-name">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="unassigned">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`prio-badge ${getPriorityClass(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} className="date-icon" />
                        <span>{formatDate(task.planEndDate)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-percent-label">{progressPct}%</div>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar-fill"
                            style={{ 
                              width: `${progressPct}%`,
                              backgroundColor: task.status === 'done' ? 'var(--color-success)' : 'var(--color-primary)' 
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
                <tr>
                  <td colSpan="6" className="no-tasks-cell">
                    Không tìm thấy công việc nào phù hợp.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView;
