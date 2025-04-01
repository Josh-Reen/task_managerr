import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, FaCheck, FaUndo, FaEdit, FaTrash, FaSignOutAlt, 
  FaTasks, FaCheckCircle, FaTimesCircle, FaAngleDown, FaAngleUp, FaArchive
} from 'react-icons/fa';
import '../index.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [stats, setStats] = useState({ completed: 0, incomplete: 0, archived: 0, total: 0 });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });
  const [expandedYear, setExpandedYear] = useState(new Date().getFullYear());
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchTasks(selectedMonth);
  }, [selectedMonth, showArchived]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : null;
  };

  const fetchTasks = async (monthFilter = selectedMonth) => {
    setLoading(true);
    setError('');
    const headers = getAuthHeader();
    if (!headers) {
      setError('Please log in to view tasks');
      navigate('/login');
      return;
    }
    try {
      const res = await axios.get(`${apiUrl}/api/tasks`, { 
        headers, 
        params: { includeArchived: showArchived ? 'true' : 'false' } 
      });
      const allTasks = res.data;
      const filteredTasks = filterByMonth(allTasks, monthFilter);
      setTasks(filteredTasks);
      updateStats(allTasks);
    } catch (err) {
      console.error('Fetch tasks error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to fetch tasks');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (allTasks) => {
    const completed = allTasks.filter(t => t.completed && !t.isArchived).length;
    const incomplete = allTasks.filter(t => !t.completed && !t.isArchived).length;
    const archived = allTasks.filter(t => t.isArchived).length;
    const total = allTasks.length;
    setStats({ completed, incomplete, archived, total });
  };

  const filterByMonth = (tasks, { month, year }) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate.getMonth() === month && taskDate.getFullYear() === year;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      await axios.post(`${apiUrl}/api/tasks`, { title, description, endDate }, { headers });
      setTitle('');
      setDescription('');
      setEndDate('');
      fetchTasks(selectedMonth);
    } catch (err) {
      console.error('Create task error:', err.response?.data || err.message);
      setError('Failed to add task: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleComplete = async (task) => {
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      await axios.put(`${apiUrl}/api/tasks/${task._id}`, { ...task, completed: !task.completed }, { headers });
      fetchTasks(selectedMonth);
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const archiveTask = async (id) => {
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      await axios.put(`${apiUrl}/api/tasks/archive/${id}`, {}, { headers }); // Updated to PUT
      fetchTasks(selectedMonth);
    } catch (err) {
      console.error('Archive task error:', err.response?.data || err.message);
      setError('Failed to archive task');
    }
  };

  const restoreTask = async (id) => {
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      await axios.put(`${apiUrl}/api/tasks/restore/${id}`, {}, { headers });
      fetchTasks(selectedMonth);
    } catch (err) {
      setError('Failed to restore task');
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditEndDate(task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '');
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDescription('');
    setEditEndDate('');
  };

  const saveEdit = async (id) => {
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      await axios.put(`${apiUrl}/api/tasks/${id}`, { 
        title: editTitle, 
        description: editDescription, 
        endDate: editEndDate || null,
        completed: tasks.find(t => t._id === id).completed 
      }, { headers });
      setEditingTaskId(null);
      fetchTasks(selectedMonth);
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const toggleYear = (year) => {
    setExpandedYear(expandedYear === year ? null : year);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="stats">
          <h2>Task Statistics</h2>
          <p><FaTasks /> Total Tasks: {stats.total}</p>
          <p><FaCheckCircle /> Completed: {stats.completed}</p>
          <p><FaTimesCircle /> Incomplete: {stats.incomplete}</p>
          <p><FaArchive /> Archived: {stats.archived}</p>
        </div>
        <div className="task-form-container">
          <form onSubmit={handleSubmit} className="task-form">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
              required
              className="task-input"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="task-textarea"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="task-input"
            />
            <button type="submit" className="task-button primary">
              <FaPlus /> Add Task
            </button>
          </form>
        </div>
        <div className="month-filter">
          <h3>Filter by Month</h3>
          <button 
            onClick={() => { 
              const now = new Date();
              setSelectedMonth({ month: now.getMonth(), year: now.getFullYear() }); 
              fetchTasks({ month: now.getMonth(), year: now.getFullYear() }); 
            }} 
            className={`month-button ${selectedMonth?.month === new Date().getMonth() && selectedMonth?.year === new Date().getFullYear() ? 'active' : ''}`}
          >
            Current Month
          </button>
          {years.map(year => (
            <div key={year} className="year-section">
              <button 
                onClick={() => toggleYear(year)} 
                className="year-toggle"
              >
                {year} {expandedYear === year ? <FaAngleUp /> : <FaAngleDown />}
              </button>
              {expandedYear === year && (
                <div className="month-list">
                  {months.map((month, index) => (
                    <button
                      key={`${year}-${index}`}
                      onClick={() => { 
                        setSelectedMonth({ month: index, year }); 
                        fetchTasks({ month: index, year }); 
                      }}
                      className={`month-button ${selectedMonth?.month === index && selectedMonth?.year === year ? 'active' : ''}`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <button 
          onClick={() => setShowArchived(!showArchived)} 
          className="task-button"
        >
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
      </div>
      <div className="main-content">
        <div className="header">
          <h1 className="title">Ketase Task Manager</h1>
          <button onClick={handleLogout} className="task-button logout">
            <FaSignOutAlt /> Logout
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <div className="task-list">
            {tasks.length === 0 ? (
              <p>No tasks found for {months[selectedMonth.month]} {selectedMonth.year}.</p>
            ) : (
              tasks.map((task) => (
                <div key={task._id} className={`task-card ${task.completed ? 'completed' : ''} ${task.isArchived ? 'archived' : ''}`}>
                  {editingTaskId === task._id ? (
                    <>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Task Title"
                        className="task-input edit-input"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                        className="task-textarea edit-textarea"
                      />
                      <input
                        type="date"
                        value={editEndDate}
                        onChange={(e) => setEditEndDate(e.target.value)}
                        className="task-input edit-input"
                      />
                      <div className="task-actions">
                        <button onClick={() => saveEdit(task._id)} className="task-button save">
                          <FaCheck /> Save
                        </button>
                        <button onClick={cancelEditing} className="task-button cancel">
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="task-title">{task.title}</h3>
                      <p className="task-desc">{task.description || 'No description'}</p>
                      <p className="task-date">Created: {new Date(task.createdAt).toLocaleDateString()}</p>
                      {task.endDate && (
                        <p className="task-date">End Date: {new Date(task.endDate).toLocaleDateString()}</p>
                      )}
                      <div className="task-actions">
                        {!task.isArchived && (
                          <>
                            <button
                              onClick={() => toggleComplete(task)}
                              className={`task-button ${task.completed ? 'undo' : 'complete'}`}
                            >
                              {task.completed ? <FaUndo /> : <FaCheck />} 
                              {task.completed ? ' Mark Incomplete' : ' Mark Complete'}
                            </button>
                            <button onClick={() => startEditing(task)} className="task-button edit">
                              <FaEdit /> Edit
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => task.isArchived ? restoreTask(task._id) : archiveTask(task._id)} 
                          className="task-button delete"
                        >
                          {task.isArchived ? <FaUndo /> : <FaArchive />} 
                          {task.isArchived ? ' Restore' : ' Archive'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;