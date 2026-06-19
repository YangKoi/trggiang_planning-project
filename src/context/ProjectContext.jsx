import React, { createContext, useState, useEffect } from 'react';

export const ProjectContext = createContext();

const initialMembers = [
  { id: 'm1', name: 'Trần Giang', role: 'Project Manager', avatar: 'TG', color: '#6366f1' },
  { id: 'm2', name: 'Nguyễn Hùng', role: 'Lead Developer', avatar: 'NH', color: '#10b981' },
  { id: 'm3', name: 'Lê Na', role: 'UI/UX Designer', avatar: 'LN', color: '#ec4899' },
  { id: 'm4', name: 'Phạm Minh', role: 'QA Tester', avatar: 'PM', color: '#f59e0b' }
];

const initialProjects = [
  { id: 'p1', name: 'CIC_PLAN - Tiến độ thực hiện', description: 'Kế hoạch và tiến độ thực hiện dự án hạ tầng công nghệ thông tin CIC.' },
  { id: 'p2', name: 'Website Cổng thông tin', description: 'Xây dựng lại cổng thông tin điện tử tích hợp dịch vụ công trực tuyến.' }
];

const initialTasks = [
  // Tasks for Project p1 (matching the user's reference image exactly)
  {
    id: 't1',
    projectId: 'p1',
    title: 'Giải phóng mặt bằng',
    description: 'Bàn giao và giải tỏa mặt bằng khu vực thi công dự án.',
    status: 'done',
    priority: 'high',
    assigneeId: 'm1',
    planStartDate: '2014-01-05',
    planEndDate: '2014-02-20',
    actualStartDate: '2014-01-05',
    actualEndDate: '2014-02-20',
    progress: 100,
    checklist: [
      { id: 'c1', text: 'Ký biên bản bàn giao đất', isCompleted: true },
      { id: 'c2', text: 'Đền bù giải phóng mặt bằng đợt 1', isCompleted: true }
    ],
    dependencies: [],
    tags: ['Pháp lý', 'Mặt bằng']
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Xây dựng cơ bản',
    description: 'Thi công móng, đổ bê tông và hoàn thiện khung nhà trạm.',
    status: 'done',
    priority: 'high',
    assigneeId: 'm2',
    planStartDate: '2014-02-20',
    planEndDate: '2014-05-16',
    actualStartDate: '2014-02-20',
    actualEndDate: '2014-05-16',
    progress: 100,
    checklist: [
      { id: 'c3', text: 'Đào móng và đổ bê tông lót', isCompleted: true },
      { id: 'c4', text: 'Xây dựng tường bao và lợp mái', isCompleted: true },
      { id: 'c5', text: 'Sơn nước và hoàn thiện hệ thống điện âm', isCompleted: true }
    ],
    dependencies: ['t1'],
    tags: ['Thi công', 'Xây dựng']
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'Lắp đặt Thiết bị',
    description: 'Vận chuyển máy móc và lắp đặt hệ thống máy chủ, mạng core.',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 'm2',
    planStartDate: '2014-05-16',
    planEndDate: '2014-08-22',
    actualStartDate: '2014-05-16',
    actualEndDate: '',
    progress: 60, // July 2, 2014 is mid-way (about 60% of the duration)
    checklist: [
      { id: 'c6', text: 'Vận chuyển thiết bị về kho dự án', isCompleted: true },
      { id: 'c7', text: 'Lắp đặt tủ Rack và hệ thống làm mát', isCompleted: true },
      { id: 'c8', text: 'Cấu hình thiết bị mạng Core', isCompleted: false },
      { id: 'c9', text: 'Đấu nối dây cáp quang trục chính', isCompleted: false }
    ],
    dependencies: ['t2'],
    tags: ['Thiết bị', 'Mạng']
  },
  {
    id: 't4',
    projectId: 'p1',
    title: 'Bảo hành Công trình',
    description: 'Giám sát vận hành thử nghiệm và bàn giao gói bảo hành 12 tháng.',
    status: 'todo',
    priority: 'low',
    assigneeId: 'm4',
    planStartDate: '2014-08-22',
    planEndDate: '2014-12-22',
    actualStartDate: '',
    actualEndDate: '',
    progress: 0,
    checklist: [
      { id: 'c10', text: 'Lập biên bản vận hành thử nghiệm', isCompleted: false },
      { id: 'c11', text: 'Ký hợp đồng bảo trì kỹ thuật', isCompleted: false }
    ],
    dependencies: ['t3'],
    tags: ['Bảo hành', 'Bàn giao']
  },
  // Extra tasks for Project p2
  {
    id: 't2-1',
    projectId: 'p2',
    title: 'Thiết kế giao diện Figma',
    description: 'Vẽ Wireframe và thiết kế UI Mockup cho trang chủ và các trang con.',
    status: 'done',
    priority: 'medium',
    assigneeId: 'm3',
    planStartDate: '2026-06-01',
    planEndDate: '2026-06-10',
    actualStartDate: '2026-06-01',
    actualEndDate: '2026-06-09',
    progress: 100,
    checklist: [
      { id: 'c2-1', text: 'Khảo sát yêu cầu khách hàng', isCompleted: true },
      { id: 'c2-2', text: 'Thiết kế Moodboard & bảng màu', isCompleted: true },
      { id: 'c2-3', text: 'Thiết kế UI độ nét cao (Hi-Fi)', isCompleted: true }
    ],
    dependencies: [],
    tags: ['UI/UX', 'Figma']
  },
  {
    id: 't2-2',
    projectId: 'p2',
    title: 'Xây dựng Frontend React',
    description: 'Cắt HTML/CSS và xây dựng các components React cho Website.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'm2',
    planStartDate: '2026-06-11',
    planEndDate: '2026-06-25',
    actualStartDate: '2026-06-12',
    actualEndDate: '',
    progress: 50,
    checklist: [
      { id: 'c2-4', text: 'Cài đặt Boilerplate & Router', isCompleted: true },
      { id: 'c2-5', text: 'Lập trình UI Home Page & Dashboard', isCompleted: true },
      { id: 'c2-6', text: 'Tích hợp API và quản lý State', isCompleted: false }
    ],
    dependencies: ['t2-1'],
    tags: ['Frontend', 'React']
  }
];

const initialActivities = [
  { id: 'a1', text: 'đã hoàn thành công việc', taskTitle: 'Xây dựng cơ bản', user: 'Nguyễn Hùng', time: '1 giờ trước' },
  { id: 'a2', text: 'đã bắt đầu thực hiện', taskTitle: 'Lắp đặt Thiết bị', user: 'Nguyễn Hùng', time: '3 giờ trước' },
  { id: 'a3', text: 'đã giao công việc', taskTitle: 'Bảo hành Công trình', user: 'Trần Giang', time: '1 ngày trước' }
];

export const ProjectProvider = ({ children }) => {
  // Load data from LocalStorage or fallback to initials
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('nexus_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('nexus_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [members] = useState(initialMembers);

  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('nexus_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [activeProjectId, setActiveProjectId] = useState(() => {
    const saved = localStorage.getItem('nexus_active_project_id');
    return saved ? JSON.parse(saved) : 'p1';
  });

  const [activeTab, setActiveTab] = useState('gantt'); // Default to Gantt view because it is the requested signature tab!
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('nexus_theme');
    return saved ? saved : 'dark'; // Dark mode default as requested!
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nexus_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('nexus_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('nexus_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('nexus_active_project_id', JSON.stringify(activeProjectId));
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem('nexus_theme', theme);
    // Apply class to body
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Log an activity helper
  const logActivity = (text, taskTitle, user = 'Trần Giang') => {
    const newAct = {
      id: 'act_' + Date.now(),
      text,
      taskTitle,
      user,
      time: 'Vừa xong'
    };
    setActivities(prev => [newAct, ...prev.slice(0, 19)]);
  };

  // Actions
  const addProject = (name, description) => {
    const newProj = {
      id: 'proj_' + Date.now(),
      name,
      description: description || ''
    };
    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    logActivity('đã tạo dự án mới', name);
  };

  const addTask = (taskData) => {
    const newTask = {
      id: 'task_' + Date.now(),
      projectId: activeProjectId,
      status: 'todo',
      progress: 0,
      checklist: [],
      dependencies: [],
      tags: [],
      actualStartDate: '',
      actualEndDate: '',
      ...taskData
    };
    setTasks(prev => [...prev, newTask]);
    logActivity('đã thêm công việc mới', newTask.title);
  };

  const updateTask = (taskId, updatedFields) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        // Log custom start/end date updates
        if (updatedFields.status && updatedFields.status !== t.status) {
          logActivity(`đã chuyển trạng thái sang "${updatedFields.status.toUpperCase()}"`, t.title);
        } else if (updatedFields.progress !== undefined && updatedFields.progress !== t.progress) {
          logActivity(`đã cập nhật tiến độ lên ${updatedFields.progress}%`, t.title);
        }
        
        // Handle auto actual date filling
        let actualDates = {};
        if (updatedFields.status === 'in_progress' && !t.actualStartDate && !updatedFields.actualStartDate) {
          actualDates.actualStartDate = new Date().toISOString().split('T')[0];
        }
        if (updatedFields.status === 'done' && !t.actualEndDate && !updatedFields.actualEndDate) {
          actualDates.actualEndDate = new Date().toISOString().split('T')[0];
          if (!t.actualStartDate) {
            actualDates.actualStartDate = t.planStartDate;
          }
        }
        
        return { ...t, ...updatedFields, ...actualDates };
      }
      return t;
    }));
  };

  const deleteTask = (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      logActivity('đã xóa công việc', taskToDelete.title);
    }
  };

  const moveTask = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ projects, tasks, activities }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nexus_pm_export_${activeProjectId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.projects && data.tasks) {
        setProjects(data.projects);
        setTasks(data.tasks);
        if (data.activities) setActivities(data.activities);
        if (data.projects.length > 0) setActiveProjectId(data.projects[0].id);
        alert('Nhập dữ liệu thành công!');
      } else {
        alert('File dữ liệu không hợp lệ!');
      }
    } catch (e) {
      alert('Lỗi phân tích file dữ liệu JSON!');
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      tasks: tasks.filter(t => t.projectId === activeProjectId),
      allTasks: tasks, // To check cross-project dependencies if needed
      members,
      activities,
      activeProjectId,
      setActiveProjectId,
      activeTab,
      setActiveTab,
      theme,
      setTheme,
      addProject,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      exportData,
      importData
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
