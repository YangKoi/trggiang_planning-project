import React, { useContext } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FolderKanban, 
  Activity 
} from 'lucide-react';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const { tasks, projects, activeProjectId, activities } = useContext(ProjectContext);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Calculate Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const reviewTasks = tasks.filter(t => t.status === 'in_review').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  
  const pendingTasks = totalTasks - completedTasks;

  // Calculate Overdue
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'done') return false;
    const deadline = t.planEndDate || t.deadline;
    return deadline && deadline < todayStr;
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Chart 1: Tasks by Status
  const statusChartData = {
    labels: ['Cần làm', 'Đang làm', 'Đợi duyệt', 'Hoàn thành'],
    datasets: [
      {
        label: 'Số lượng công việc',
        data: [todoTasks, inProgressTasks, reviewTasks, completedTasks],
        backgroundColor: [
          'rgba(99, 102, 241, 0.65)',  // Indigo
          'rgba(6, 182, 212, 0.65)',   // Cyan
          'rgba(245, 158, 11, 0.65)',  // Amber
          'rgba(16, 182, 129, 0.65)'   // Emerald
        ],
        borderColor: [
          '#6366f1',
          '#06b6d4',
          '#f59e0b',
          '#10b981'
        ],
        borderWidth: 1.5,
        borderRadius: 8
      }
    ]
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#151f32',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: '#2a354f',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'var(--text-muted)' }
      },
      y: {
        grid: { color: 'var(--border-color)', drawBorder: false },
        ticks: { 
          color: 'var(--text-muted)',
          precision: 0 
        }
      }
    }
  };

  // Chart 2: Priority breakdown
  const highPriority = tasks.filter(t => t.priority === 'high').length;
  const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
  const lowPriority = tasks.filter(t => t.priority === 'low').length;

  const priorityChartData = {
    labels: ['Ưu tiên Cao', 'Trung bình', 'Thấp'],
    datasets: [
      {
        data: [highPriority, mediumPriority, lowPriority],
        backgroundColor: [
          'rgba(244, 63, 94, 0.7)',   // Rose
          'rgba(245, 158, 11, 0.7)',  // Amber
          'rgba(99, 102, 241, 0.7)'   // Indigo
        ],
        borderColor: 'var(--bg-card)',
        borderWidth: 2
      }
    ]
  };

  const priorityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'var(--text-main)',
          font: { family: 'var(--font-sans)', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#151f32',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: '#2a354f',
        borderWidth: 1
      }
    }
  };

  return (
    <div className="dashboard-view fade-in">
      {/* Header */}
      <div className="view-header">
        <h1 className="view-title">{activeProject?.name || 'Tổng quan dự án'}</h1>
        <p className="view-subtitle">{activeProject?.description || 'Chi tiết thông số phân tích dự án.'}</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        {/* KPI 1 */}
        <div className="stat-card glass-panel hover-lift">
          <div className="stat-icon-wrapper blue">
            <FolderKanban size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{totalTasks}</span>
            <span className="stat-label">Tổng Công Việc</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="stat-card glass-panel hover-lift">
          <div className="stat-icon-wrapper green">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{completedTasks}</span>
            <span className="stat-label">Đã Hoàn Thành ({completionRate}%)</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="stat-card glass-panel hover-lift">
          <div className="stat-icon-wrapper amber">
            <Clock size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{pendingTasks}</span>
            <span className="stat-label">Đang Thực Hiện</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="stat-card glass-panel hover-lift">
          <div className="stat-icon-wrapper red">
            <AlertCircle size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{overdueTasks}</span>
            <span className="stat-label">Công Việc Trễ Hạn</span>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="analytics-section">
        {/* Left Chart */}
        <div className="chart-card glass-panel">
          <h3 className="chart-title">Trạng Thái Công Việc</h3>
          <div className="chart-container">
            <Bar data={statusChartData} options={statusChartOptions} />
          </div>
        </div>

        {/* Right Chart */}
        <div className="chart-card glass-panel">
          <h3 className="chart-title">Mức Độ Ưu Tiên</h3>
          <div className="chart-container">
            <Doughnut data={priorityChartData} options={priorityChartOptions} />
          </div>
        </div>
      </div>

      {/* Activity Feed Section */}
      <div className="activity-card glass-panel">
        <div className="activity-header">
          <Activity size={20} className="activity-icon" />
          <h3 className="chart-title">Hoạt Động Gần Đây</h3>
        </div>
        <div className="activity-list">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="activity-item">
                <div className="activity-user-avatar">
                  {act.user.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="activity-body">
                  <p className="activity-text">
                    <span className="bold-user">{act.user}</span> {act.text}{' '}
                    <span className="bold-task">"{act.taskTitle}"</span>
                  </p>
                  <span className="activity-time">{act.time}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-activity">Chưa có hoạt động nào được ghi lại.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
