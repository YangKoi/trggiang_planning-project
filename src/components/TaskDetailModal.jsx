import React, { useContext, useState, useEffect } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { X, Calendar, CheckSquare, Trash2, Plus, Users, Tag, AlertTriangle, Link2 } from 'lucide-react';
import './TaskDetailModal.css';

const TaskDetailModal = ({ taskId, onClose }) => {
  const { 
    tasks, 
    updateTask, 
    deleteTask, 
    members 
  } = useContext(ProjectContext);

  const task = tasks.find(t => t.id === taskId);

  if (!task) return null;

  // Local States
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId);
  const [planStartDate, setPlanStartDate] = useState(task.planStartDate);
  const [planEndDate, setPlanEndDate] = useState(task.planEndDate);
  const [actualStartDate, setActualStartDate] = useState(task.actualStartDate);
  const [actualEndDate, setActualEndDate] = useState(task.actualEndDate);
  
  const [newCheckItem, setNewCheckItem] = useState('');
  const [newTag, setNewTag] = useState('');
  const [progressVal, setProgressVal] = useState(task.progress);

  // Sync state if task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setAssigneeId(task.assigneeId);
    setPlanStartDate(task.planStartDate);
    setPlanEndDate(task.planEndDate);
    setActualStartDate(task.actualStartDate);
    setActualEndDate(task.actualEndDate);
    setProgressVal(task.progress);
  }, [task]);

  const handleFieldChange = (field, value) => {
    updateTask(task.id, { [field]: value });
  };

  // Checklist Actions
  const handleToggleCheck = (itemId) => {
    const updatedChecklist = task.checklist.map(item => {
      if (item.id === itemId) {
        return { ...item, isCompleted: !item.isCompleted };
      }
      return item;
    });

    const completed = updatedChecklist.filter(c => c.isCompleted).length;
    const total = updatedChecklist.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    updateTask(task.id, { 
      checklist: updatedChecklist,
      progress
    });
  };

  const handleAddCheckItem = (e) => {
    e.preventDefault();
    if (newCheckItem.trim()) {
      const newItem = {
        id: 'chk_' + Date.now(),
        text: newCheckItem.trim(),
        isCompleted: false
      };
      const updatedChecklist = [...task.checklist, newItem];
      
      const completed = updatedChecklist.filter(c => c.isCompleted).length;
      const total = updatedChecklist.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      updateTask(task.id, { 
        checklist: updatedChecklist,
        progress
      });
      setNewCheckItem('');
    }
  };

  const handleDeleteCheckItem = (itemId) => {
    const updatedChecklist = task.checklist.filter(item => item.id !== itemId);
    
    const completed = updatedChecklist.filter(c => c.isCompleted).length;
    const total = updatedChecklist.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    updateTask(task.id, { 
      checklist: updatedChecklist,
      progress
    });
  };

  // Tags Actions
  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !task.tags.includes(newTag.trim())) {
      const updatedTags = [...task.tags, newTag.trim()];
      handleFieldChange('tags', updatedTags);
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    const updatedTags = task.tags.filter(t => t !== tagToDelete);
    handleFieldChange('tags', updatedTags);
  };

  // Dependency Actions
  const handleToggleDependency = (otherTaskId) => {
    let updatedDeps = [...(task.dependencies || [])];
    if (updatedDeps.includes(otherTaskId)) {
      updatedDeps = updatedDeps.filter(id => id !== otherTaskId);
    } else {
      updatedDeps.push(otherTaskId);
    }
    handleFieldChange('dependencies', updatedDeps);
  };

  const handleDeleteTaskClick = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  // Get potential dependency tasks (exclude self)
  const potentialDependencies = tasks.filter(t => t.id !== task.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <input 
            type="text" 
            className="modal-title-input" 
            value={title} 
            onChange={(e) => {
              setTitle(e.target.value);
              handleFieldChange('title', e.target.value);
            }} 
            placeholder="Tên công việc..."
          />
          <button className="close-btn clickable" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-layout">
          {/* Left Main Pane */}
          <div className="modal-main-pane">
            {/* Description */}
            <div className="pane-section">
              <h4 className="section-title-label">Mô tả chi tiết</h4>
              <textarea 
                className="modal-textarea"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  handleFieldChange('description', e.target.value);
                }}
                placeholder="Nhập mô tả cho công việc này..."
              />
            </div>

            {/* Checklist Section */}
            <div className="pane-section">
              <div className="checklist-header-row">
                <h4 className="section-title-label">Danh sách checklist</h4>
                <span className="checklist-progress-text">
                  {task.checklist.filter(c => c.isCompleted).length}/{task.checklist.length} hoàn thành
                </span>
              </div>

              {/* Progress Slider (Fallback or display) */}
              <div className="modal-progress-bar-container">
                <div 
                  className="modal-progress-bar-fill" 
                  style={{ width: `${task.checklist.length > 0 ? Math.round((task.checklist.filter(c => c.isCompleted).length / task.checklist.length) * 100) : progressVal}%` }}
                />
              </div>

              {task.checklist.length === 0 && (
                <div className="progress-slider-row">
                  <span className="slider-label">Tiến độ thủ công:</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progressVal}
                    onChange={(e) => {
                      setProgressVal(parseInt(e.target.value));
                      handleFieldChange('progress', parseInt(e.target.value));
                    }}
                  />
                  <span className="slider-value">{progressVal}%</span>
                </div>
              )}

              <div className="checklist-items">
                {task.checklist.map(item => (
                  <div key={item.id} className="checklist-item">
                    <label className="checkbox-label clickable">
                      <input 
                        type="checkbox" 
                        checked={item.isCompleted} 
                        onChange={() => handleToggleCheck(item.id)}
                      />
                      <span className={`checkmark ${item.isCompleted ? 'checked' : ''}`}>{item.text}</span>
                    </label>
                    <button 
                      className="delete-item-btn clickable"
                      onClick={() => handleDeleteCheckItem(item.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <form className="add-checkitem-form" onSubmit={handleAddCheckItem}>
                <input 
                  type="text" 
                  placeholder="Thêm mục checklist mới..."
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                />
                <button type="submit" className="add-checkitem-btn clickable">
                  <Plus size={16} />
                </button>
              </form>
            </div>

            {/* Task Dependency Selection */}
            <div className="pane-section">
              <h4 className="section-title-label">Công việc tiền quyết (Dependencies)</h4>
              <p className="section-desc-text">Chọn các công việc cần hoàn thành trước khi bắt đầu công việc này:</p>
              
              <div className="dependency-selectors-grid">
                {potentialDependencies.length > 0 ? (
                  potentialDependencies.map(otherTask => (
                    <label key={otherTask.id} className="dependency-checkboxclickable">
                      <input 
                        type="checkbox" 
                        checked={(task.dependencies || []).includes(otherTask.id)} 
                        onChange={() => handleToggleDependency(otherTask.id)}
                      />
                      <span className="dep-task-title">{otherTask.title}</span>
                    </label>
                  ))
                ) : (
                  <span className="no-deps-text">Không có công việc khác trong dự án này.</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Settings Pane */}
          <div className="modal-side-pane">
            {/* Status */}
            <div className="side-option-group">
              <label className="side-option-label">Trạng thái</label>
              <select 
                className="side-select"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  handleFieldChange('status', e.target.value);
                }}
              >
                <option value="todo">Cần Làm</option>
                <option value="in_progress">Đang Làm</option>
                <option value="in_review">Đợi Duyệt</option>
                <option value="done">Đã Xong</option>
              </select>
            </div>

            {/* Priority */}
            <div className="side-option-group">
              <label className="side-option-label">Độ ưu tiên</label>
              <select 
                className="side-select"
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  handleFieldChange('priority', e.target.value);
                }}
              >
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="side-option-group">
              <label className="side-option-label">Người phụ trách</label>
              <select 
                className="side-select"
                value={assigneeId}
                onChange={(e) => {
                  setAssigneeId(e.target.value);
                  handleFieldChange('assigneeId', e.target.value);
                }}
              >
                <option value="">Chọn người phụ trách</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Plan Dates */}
            <div className="side-option-group">
              <label className="side-option-label">Thời gian kế hoạch</label>
              <div className="date-inputs">
                <div className="date-input-wrapper">
                  <span>Bắt đầu:</span>
                  <input 
                    type="date" 
                    value={planStartDate}
                    onChange={(e) => {
                      setPlanStartDate(e.target.value);
                      handleFieldChange('planStartDate', e.target.value);
                    }}
                  />
                </div>
                <div className="date-input-wrapper">
                  <span>Kết thúc:</span>
                  <input 
                    type="date" 
                    value={planEndDate}
                    onChange={(e) => {
                      setPlanEndDate(e.target.value);
                      handleFieldChange('planEndDate', e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Actual Dates */}
            <div className="side-option-group">
              <label className="side-option-label">Thời gian thực tế</label>
              <div className="date-inputs">
                <div className="date-input-wrapper">
                  <span>Bắt đầu:</span>
                  <input 
                    type="date" 
                    value={actualStartDate || ''}
                    onChange={(e) => {
                      setActualStartDate(e.target.value);
                      handleFieldChange('actualStartDate', e.target.value);
                    }}
                  />
                </div>
                <div className="date-input-wrapper">
                  <span>Kết thúc:</span>
                  <input 
                    type="date" 
                    value={actualEndDate || ''}
                    disabled={status !== 'done'}
                    onChange={(e) => {
                      setActualEndDate(e.target.value);
                      handleFieldChange('actualEndDate', e.target.value);
                    }}
                  />
                </div>
              </div>
              {status !== 'done' && (
                <span className="helper-text-alert">
                  <AlertTriangle size={12} /> Hạn kết thúc thực tế chỉ mở khi trạng thái là "Đã Xong".
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="side-option-group">
              <label className="side-option-label">Nhãn dán (Tags)</label>
              <div className="modal-tags-list">
                {task.tags.map(tag => (
                  <span key={tag} className="modal-tag">
                    {tag}
                    <button type="button" onClick={() => handleDeleteTag(tag)}>×</button>
                  </span>
                ))}
              </div>
              <form className="add-tag-form" onSubmit={handleAddTag}>
                <input 
                  type="text" 
                  placeholder="Thêm tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <button type="submit">Thêm</button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="danger-zone">
              <button 
                type="button" 
                className="delete-task-btn clickable"
                onClick={handleDeleteTaskClick}
              >
                <Trash2 size={16} />
                <span>Xóa công việc này</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
