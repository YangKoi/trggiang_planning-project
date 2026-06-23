import React, { useContext } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { AlertTriangle, Monitor, Cloud, Download, Upload } from 'lucide-react';
import './ConflictModal.css';

const ConflictModal = () => {
  const {
    conflictData,
    setConflictData,
    applyRemoteData,
    forceUploadLocalData
  } = useContext(ProjectContext);

  if (!conflictData) return null;

  const { localData, remoteData } = conflictData;

  const localTime = new Date(localData.lastUpdated).toLocaleString('vi-VN');
  const remoteTime = new Date(remoteData.lastUpdated).toLocaleString('vi-VN');

  const isLocalNewer = localData.lastUpdated > remoteData.lastUpdated;
  const isRemoteNewer = remoteData.lastUpdated > localData.lastUpdated;

  // Helper to get stats summary
  const getStats = (data) => {
    return {
      projectsCount: data.projects?.length || 0,
      tasksCount: data.tasks?.length || 0,
      membersCount: data.members?.length || 0,
      activitiesCount: data.activities?.length || 0
    };
  };

  const localStats = getStats(localData);
  const remoteStats = getStats(remoteData);

  return (
    <div className="conflict-modal-overlay">
      <div className="conflict-modal-content">
        {/* Header */}
        <div className="conflict-modal-header">
          <h2 className="conflict-modal-title">
            <AlertTriangle className="conflict-warning-icon" size={24} />
            Xung đột dữ liệu Google Drive
          </h2>
          <p className="conflict-modal-subtitle">
            Phát hiện sự khác biệt giữa dữ liệu trên thiết bị này và dữ liệu được lưu trên tài khoản Google Drive của bạn. Vui lòng chọn bản dữ liệu bạn muốn sử dụng.
          </p>
        </div>

        {/* Body comparisons */}
        <div className="conflict-modal-body">
          <div className="conflict-cards-container">
            {/* Local Data Card */}
            <div className={`conflict-card ${isLocalNewer ? 'newer' : ''}`}>
              {isLocalNewer && <span className="newer-badge">Mới hơn</span>}
              <h3 className="conflict-card-title">
                <Monitor size={18} />
                Dữ liệu trên máy này
              </h3>
              <div className="conflict-meta-info">
                <div className="conflict-meta-item">
                  <span>Cập nhật lúc:</span>
                  <span className="conflict-meta-value">{localTime}</span>
                </div>
              </div>
              <div className="conflict-stats">
                <div className="conflict-stat-row">
                  <div className="conflict-stat-dot" />
                  <span>Dự án: <strong style={{ color: 'var(--text-main)' }}>{localStats.projectsCount}</strong></span>
                </div>
                <div className="conflict-stat-row">
                  <div className="conflict-stat-dot" />
                  <span>Công việc: <strong style={{ color: 'var(--text-main)' }}>{localStats.tasksCount}</strong></span>
                </div>
                <div className="conflict-stat-row">
                  <div className="conflict-stat-dot" />
                  <span>Thành viên: <strong style={{ color: 'var(--text-main)' }}>{localStats.membersCount}</strong></span>
                </div>
                <div className="conflict-stat-row">
                  <div className="conflict-stat-dot" />
                  <span>Hoạt động: <strong style={{ color: 'var(--text-main)' }}>{localStats.activitiesCount}</strong></span>
                </div>
              </div>
              <button 
                className="conflict-card-action-btn clickable"
                onClick={forceUploadLocalData}
              >
                <Upload size={14} />
                Ghi đè bản máy lên Drive
              </button>
            </div>

            {/* Remote Data Card */}
            <div className={`conflict-card ${isRemoteNewer ? 'newer' : ''}`}>
              {isRemoteNewer && <span className="newer-badge">Mới hơn</span>}
              <h3 className="conflict-card-title">
                <Cloud size={18} />
                Dữ liệu trên Drive
              </h3>
              <div className="conflict-meta-info">
                <div className="conflict-meta-item">
                  <span>Cập nhật lúc:</span>
                  <span className="conflict-meta-value">{remoteTime}</span>
                </div>
              </div>
              <div className="conflict-stats">
                <div className="conflict-stat-row">
                  <div className="conflict-stat-dot" />
                  <span>Dự án: <strong style={{ color: 'var(--text-main)' }}>{remoteStats.projectsCount}</strong></span>
                </div>
                <div className="conflict-stat-row">
                  <div className="conflict-stat-dot" />
                  <span>Công việc: <strong style={{ color: 'var(--text-main)' }}>{remoteStats.tasksCount}</strong></span>
                </div>
                <div className="conflict-stat-row">
                  <div className="conflict-stat-dot" />
                  <span>Thành viên: <strong style={{ color: 'var(--text-main)' }}>{remoteStats.membersCount}</strong></span>
                </div>
                <div className="conflict-stat-row">
                  <div className="conflict-stat-dot" />
                  <span>Hoạt động: <strong style={{ color: 'var(--text-main)' }}>{remoteStats.activitiesCount}</strong></span>
                </div>
              </div>
              <button 
                className="conflict-card-action-btn clickable"
                onClick={() => applyRemoteData(remoteData)}
              >
                <Download size={14} />
                Tải bản Drive về máy
              </button>
            </div>
          </div>
        </div>

        {/* Cancel/Dismiss */}
        <div className="conflict-footer-actions">
          <button 
            className="conflict-cancel-btn clickable"
            onClick={() => setConflictData(null)}
          >
            Đồng bộ sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
