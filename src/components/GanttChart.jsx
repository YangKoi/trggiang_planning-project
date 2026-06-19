import React, { useContext, useMemo } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { Calendar, AlertCircle, Info, Link2 } from 'lucide-react';
import './GanttChart.css';

const GanttChart = ({ onSelectTask }) => {
  const { tasks, activeProjectId, projects } = useContext(ProjectContext);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // 1. Calculate min and max dates for the timeline range
  const { minDate, maxDate, totalDuration } = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 3, 1);
      return { minDate: start, maxDate: end, totalDuration: end - start };
    }

    const allDates = [];
    tasks.forEach(t => {
      if (t.planStartDate) allDates.push(new Date(t.planStartDate));
      if (t.planEndDate) allDates.push(new Date(t.planEndDate));
      if (t.actualStartDate) allDates.push(new Date(t.actualStartDate));
      if (t.actualEndDate) allDates.push(new Date(t.actualEndDate));
    });

    let min = new Date(Math.min(...allDates));
    let max = new Date(Math.max(...allDates));

    // Pad by 20 days on both sides for visual breathing room
    min.setDate(min.getDate() - 20);
    max.setDate(max.getDate() + 20);

    return { minDate: min, maxDate: max, totalDuration: max - min };
  }, [tasks]);

  // 2. Set Assessment Date (Vertical timeline indicator line)
  const assessmentDate = useMemo(() => {
    // If it is the default mock project, use July 2, 2014 as in the user's image
    if (activeProjectId === 'p1') {
      return new Date('2014-07-02');
    }
    // Otherwise use current date, clamped within min and max
    const today = new Date();
    if (today < minDate) return minDate;
    if (today > maxDate) return maxDate;
    return today;
  }, [activeProjectId, minDate, maxDate]);

  const assessmentPos = useMemo(() => {
    const left = ((assessmentDate - minDate) / totalDuration) * 100;
    return `${left}%`;
  }, [assessmentDate, minDate, totalDuration]);

  // 3. Generate monthly grid columns
  const months = useMemo(() => {
    const list = [];
    let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);

    while (current <= end) {
      const monthStart = new Date(Math.max(minDate, new Date(current.getFullYear(), current.getMonth(), 1)));
      const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      const monthEnd = new Date(Math.min(maxDate, nextMonth));

      if (monthEnd > monthStart) {
        const width = ((monthEnd - monthStart) / totalDuration) * 100;
        list.push({
          label: `${current.getMonth() + 1}/${current.getFullYear()}`,
          width: `${width}%`
        });
      }
      current.setMonth(current.getMonth() + 1);
    }
    return list;
  }, [minDate, maxDate, totalDuration]);

  // 4. Calculate Bar positions for each task
  const taskRows = useMemo(() => {
    return tasks.map((task, index) => {
      // Plan Bar (Golden Yellow)
      const pStart = new Date(task.planStartDate);
      const pEnd = new Date(task.planEndDate);
      const planLeft = ((pStart - minDate) / totalDuration) * 100;
      const planWidth = ((pEnd - pStart) / totalDuration) * 100;

      // Actual Bar (Emerald Green / Purple)
      let actualLeft = 0;
      let actualWidth = 0;
      let showActual = false;

      if (task.actualStartDate) {
        const aStart = new Date(task.actualStartDate);
        // If done, use actualEndDate. If in_progress, go up to assessmentDate
        const aEndStr = task.actualEndDate || assessmentDate.toISOString().split('T')[0];
        const aEnd = new Date(aEndStr);
        
        if (aEnd >= aStart) {
          actualLeft = ((aStart - minDate) / totalDuration) * 100;
          actualWidth = ((aEnd - aStart) / totalDuration) * 100;
          showActual = true;
        }
      }

      return {
        task,
        index,
        planLeft,
        planWidth,
        actualLeft,
        actualWidth,
        showActual
      };
    });
  }, [tasks, minDate, totalDuration, assessmentDate]);

  // 5. Calculate SVG Dependency Lines
  const dependencyLines = useMemo(() => {
    const lines = [];
    const N = tasks.length;
    if (N === 0) return lines;

    taskRows.forEach((row) => {
      const { task, index: rowIndex, planLeft, planWidth } = row;
      const planEndPct = planLeft + planWidth;

      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((depId) => {
          // Find the prerequisite task row
          const preDepRow = taskRows.find(r => r.task.id === depId);
          if (preDepRow) {
            const preRowIndex = preDepRow.index;
            const prePlanEndPct = preDepRow.planLeft + preDepRow.planWidth;

            // Coordinates in percentage of SVG container
            const x1 = prePlanEndPct;
            // Plan bar vertical center is at (rowIndex + 0.3) / N * 100
            const y1 = ((preRowIndex + 0.3) / N) * 100;

            const x2 = planLeft;
            const y2 = ((rowIndex + 0.3) / N) * 100;

            lines.push({
              id: `${depId}-${task.id}`,
              x1,
              y1,
              x2,
              y2,
              // intermediate point for step line
              xMid: prePlanEndPct
            });
          }
        });
      }
    });

    return lines;
  }, [taskRows, tasks.length]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div className="gantt-view fade-in">
      {/* View Header */}
      <div className="view-header">
        <h1 className="view-title">Kế Hoạch - Tiến Độ Thực Hiện</h1>
        <p className="view-subtitle">
          So sánh khách quan giữa kế hoạch ban đầu và tiến độ thực tế đã triển khai.
        </p>
      </div>

      {/* Gantt Legend */}
      <div className="gantt-legend glass-panel">
        <div className="legend-item">
          <span className="legend-bar plan-color" />
          <span>Kế hoạch</span>
        </div>
        <div className="legend-item">
          <span className="legend-bar actual-color" />
          <span>Đã Thực hiện</span>
        </div>
        <div className="legend-info">
          <Info size={14} className="info-icon" />
          <span>Thời điểm đánh giá: <strong>{formatDate(assessmentDate)}</strong></span>
        </div>
      </div>

      {/* Main Gantt Grid Board */}
      <div className="gantt-wrapper glass-panel">
        <div className="gantt-container-scrollable">
          {/* Left panel: Task Names Column */}
          <div className="gantt-sidebar">
            <div className="sidebar-header-cell">CÔNG VIỆC</div>
            {tasks.map((t) => (
              <div 
                key={t.id} 
                className="sidebar-task-cell clickable"
                onClick={() => onSelectTask(t.id)}
              >
                <span className="task-row-name" title={t.title}>{t.title}</span>
                {t.dependencies && t.dependencies.length > 0 && (
                  <span className="dependency-tag" title="Có liên kết phụ thuộc">
                    <Link2 size={10} /> Link
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Right panel: Timeline Area */}
          <div className="gantt-timeline-area">
            {/* Months Header row */}
            <div className="timeline-months-row">
              {months.map((m, idx) => (
                <div 
                  key={idx} 
                  className="timeline-month-label"
                  style={{ width: m.width }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            {/* Timeline Rows Area with Grid Lines */}
            <div className="timeline-rows-container">
              {/* Vertical Month Boundary Lines */}
              <div className="month-lines-bg">
                {months.map((m, idx) => (
                  <div 
                    key={idx} 
                    className="month-vertical-line" 
                    style={{ width: m.width }}
                  />
                ))}
              </div>

              {/* Assessment Vertical Line */}
              <div 
                className="assessment-vertical-line"
                style={{ left: assessmentPos }}
              >
                <span className="assessment-label">Thời điểm Đã hoàn thành ({formatDate(assessmentDate)})</span>
              </div>

              {/* SVG Dependencies Canvas */}
              {tasks.length > 0 && (
                <svg className="dependencies-svg">
                  <defs>
                    <marker 
                      id="arrow" 
                      viewBox="0 0 10 10" 
                      refX="6" 
                      refY="5" 
                      markerWidth="6" 
                      markerHeight="6" 
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-primary)" />
                    </marker>
                  </defs>
                  
                  {dependencyLines.map((line) => (
                    <g key={line.id}>
                      {/* Vertical line from end of task 1 down to task 2 row */}
                      <line 
                        x1={`${line.x1}%`} 
                        y1={`${line.y1}%`} 
                        x2={`${line.xMid}%`} 
                        y2={`${line.y2}%`} 
                        stroke="var(--color-primary)" 
                        strokeWidth="1.5"
                        strokeDasharray="2,2"
                        opacity="0.6"
                      />
                      {/* Horizontal line ending with arrow at start of task 2 */}
                      <line 
                        x1={`${line.xMid}%`} 
                        y1={`${line.y2}%`} 
                        x2={`${line.x2}%`} 
                        y2={`${line.y2}%`} 
                        stroke="var(--color-primary)" 
                        strokeWidth="1.5"
                        markerEnd="url(#arrow)"
                        opacity="0.8"
                      />
                    </g>
                  ))}
                </svg>
              )}

              {/* Task Bars Render */}
              {taskRows.map((row) => (
                <div key={row.task.id} className="timeline-task-row">
                  {/* Plan Bar */}
                  <div 
                    className="gantt-bar plan-bar clickable"
                    style={{ 
                      left: `${row.planLeft}%`, 
                      width: `${row.planWidth}%` 
                    }}
                    onClick={() => onSelectTask(row.task.id)}
                    title={`Kế hoạch: ${formatDate(row.task.planStartDate)} - ${formatDate(row.task.planEndDate)}`}
                  >
                    <span className="bar-date-label start">{formatDate(row.task.planStartDate)}</span>
                    <span className="bar-date-label end">{formatDate(row.task.planEndDate)}</span>
                  </div>

                  {/* Actual Bar */}
                  {row.showActual && (
                    <div 
                      className={`gantt-bar actual-bar clickable ${row.task.status === 'done' ? 'finished' : 'in-progress'}`}
                      style={{ 
                        left: `${row.actualLeft}%`, 
                        width: `${row.actualWidth}%` 
                      }}
                      onClick={() => onSelectTask(row.task.id)}
                      title={`Đã thực hiện: ${formatDate(row.task.actualStartDate)} - ${row.task.actualEndDate ? formatDate(row.task.actualEndDate) : 'Đang làm'}`}
                    >
                      <span className="bar-progress-text">
                        {row.task.status === 'done' ? '100%' : `${row.task.progress}%`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
