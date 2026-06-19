import React, { useContext, useState } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, CheckSquare, Calendar, MoreHorizontal, MessageSquare, Tag } from 'lucide-react';
import './KanbanBoard.css';

const COLUMNS = [
  { id: 'todo', title: 'Cần Làm', color: '#6366f1' },
  { id: 'in_progress', title: 'Đang Làm', color: '#06b6d4' },
  { id: 'in_review', title: 'Đợi Duyệt', color: '#f59e0b' },
  { id: 'done', title: 'Đã Xong', color: '#10b981' }
];

const KanbanBoard = ({ onSelectTask }) => {
  const { tasks, moveTask, addTask, members } = useContext(ProjectContext);
  const [quickAddColumn, setQuickAddColumn] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // moveTask in ProjectContext
    moveTask(draggableId, destination.droppableId);
  };

  const handleQuickAddSubmit = (e, colId) => {
    e.preventDefault();
    if (quickTitle.trim()) {
      addTask({
        title: quickTitle.trim(),
        status: colId,
        priority: 'medium',
        planStartDate: new Date().toISOString().split('T')[0],
        planEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setQuickTitle('');
      setQuickAddColumn(null);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trưng bình';
      case 'low': return 'Thấp';
      default: return 'Thấp';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div className="kanban-view fade-in">
      {/* View Header */}
      <div className="view-header kanban-header">
        <div>
          <h1 className="view-title">Bảng Kanban</h1>
          <p className="view-subtitle">Kéo thả để cập nhật trạng thái công việc nhanh chóng.</p>
        </div>
      </div>

      {/* Drag & Drop Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            
            return (
              <div key={col.id} className="kanban-column glass-panel">
                {/* Column Title Header */}
                <div className="column-header">
                  <div className="column-title-wrapper">
                    <span className="column-dot" style={{ backgroundColor: col.color }} />
                    <h3 className="column-title">{col.title}</h3>
                    <span className="column-count">{colTasks.length}</span>
                  </div>
                  
                  <button 
                    className="column-add-btn clickable"
                    onClick={() => setQuickAddColumn(quickAddColumn === col.id ? null : col.id)}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Inline Quick Add Form */}
                {quickAddColumn === col.id && (
                  <form 
                    className="quick-add-form fade-in"
                    onSubmit={(e) => handleQuickAddSubmit(e, col.id)}
                  >
                    <input 
                      type="text" 
                      placeholder="Tên công việc..." 
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      required
                      autoFocus
                    />
                    <div className="quick-add-actions">
                      <button type="submit" className="quick-submit-btn clickable">Lưu</button>
                      <button 
                        type="button" 
                        className="quick-cancel-btn clickable" 
                        onClick={() => setQuickAddColumn(null)}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}

                {/* Droppable Area */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      className={`column-task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {colTasks.map((task, index) => {
                        const assignee = members.find((m) => m.id === task.assigneeId);
                        const completedChecks = task.checklist.filter(c => c.isCompleted).length;
                        const totalChecks = task.checklist.length;
                        
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                className={`task-card glass-panel clickable hover-lift ${snapshot.isDragging ? 'dragging' : ''}`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => onSelectTask(task.id)}
                              >
                                {/* Card Header - Priority & Tags */}
                                <div className="card-top">
                                  <span className={`card-priority ${getPriorityClass(task.priority)}`}>
                                    {getPriorityLabel(task.priority)}
                                  </span>
                                  {task.tags && task.tags.length > 0 && (
                                    <div className="card-tags">
                                      <Tag size={10} className="tag-icon" />
                                      <span className="tag-text">{task.tags[0]}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Title & Description */}
                                <h4 className="card-title">{task.title}</h4>
                                {task.description && (
                                  <p className="card-desc">{task.description}</p>
                                )}

                                {/* Progress Bar for Checklist */}
                                {totalChecks > 0 && (
                                  <div className="card-progress-wrapper">
                                    <div className="progress-text-row">
                                      <span className="progress-icon-text">
                                        <CheckSquare size={12} /> {completedChecks}/{totalChecks}
                                      </span>
                                      <span className="progress-percent">
                                        {Math.round((completedChecks / totalChecks) * 100)}%
                                      </span>
                                    </div>
                                    <div className="card-progress-bar-bg">
                                      <div 
                                        className="card-progress-bar-fill" 
                                        style={{ 
                                          width: `${(completedChecks / totalChecks) * 100}%`,
                                          backgroundColor: col.color 
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Card Footer - Date & Assignee */}
                                <div className="card-footer">
                                  <div className="card-date-wrapper" title="Thời hạn kế hoạch">
                                    <Calendar size={12} />
                                    <span className="card-date">
                                      {formatDate(task.planStartDate)} - {formatDate(task.planEndDate)}
                                    </span>
                                  </div>

                                  {assignee && (
                                    <div 
                                      className="card-assignee" 
                                      style={{ backgroundColor: assignee.color }}
                                      title={assignee.name}
                                    >
                                      {assignee.avatar}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
