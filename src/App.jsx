import React, { useContext, useState } from 'react';
import { ProjectContext } from './context/ProjectContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import ListView from './components/ListView';
import GanttChart from './components/GanttChart';
import TaskDetailModal from './components/TaskDetailModal';
import './App.css';

function App() {
  const { activeTab } = useContext(ProjectContext);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'kanban':
        return <KanbanBoard onSelectTask={setSelectedTaskId} />;
      case 'list':
        return <ListView onSelectTask={setSelectedTaskId} />;
      case 'gantt':
        return <GanttChart onSelectTask={setSelectedTaskId} />;
      default:
        return <GanttChart onSelectTask={setSelectedTaskId} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content display */}
      <main className="main-content-wrapper">
        {renderActiveView()}
      </main>

      {/* Task Detail Modal Overlay */}
      {selectedTaskId && (
        <TaskDetailModal 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
        />
      )}
    </div>
  );
}

export default App;
