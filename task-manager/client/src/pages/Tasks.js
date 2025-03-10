import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const navigate = useNavigate();
  
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchTasks();
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    const headers = getAuthHeader();
    
    if (!headers) {
      setError('Please log in to view tasks');
      navigate('/login');
      return;
    }
    
    try {
      const res = await axios.get(`${apiUrl}/api/tasks`, { headers });
      setTasks(res.data);
    } catch (err) {
      console.error('Fetch tasks error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to fetch tasks: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = getAuthHeader();
    if (!headers) {
      setError('Please log in to add tasks');
      navigate('/login');
      return;
    }
    
    try {
      await axios.post(
        `${apiUrl}/api/tasks`,
        { title, description },
        { headers }
      );
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (err) {
      console.error('Add task error:', err.response?.data || err.message);
      setError('Failed to add task: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleComplete = async (task) => {
    const headers = getAuthHeader();
    if (!headers) return;
    
    try {
      await axios.put(
        `${apiUrl}/api/tasks/${task._id}`,
        { ...task, completed: !task.completed },
        { headers }
      );
      fetchTasks();
    } catch (err) {
      console.error('Toggle task error:', err.response?.data || err.message);
      setError('Failed to update task: ' + (err.response?.data?.message || err.message));
    }
  };

  const deleteTask = async (id) => {
    const headers = getAuthHeader();
    if (!headers) return;
    
    try {
      await axios.delete(`${apiUrl}/api/tasks/${id}`, { headers });
      fetchTasks();
    } catch (err) {
      console.error('Delete task error:', err.response?.data || err.message);
      setError('Failed to delete task: ' + (err.response?.data?.message || err.message));
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const saveEdit = async (id) => {
    const headers = getAuthHeader();
    if (!headers) return;
    
    try {
      await axios.put(
        `${apiUrl}/api/tasks/${id}`,
        { 
          title: editTitle, 
          description: editDescription, 
          completed: tasks.find(t => t._id === id).completed 
        },
        { headers }
      );
      setEditingTaskId(null);
      setEditTitle('');
      setEditDescription('');
      fetchTasks();
    } catch (err) {
      console.error('Update task error:', err.response?.data || err.message);
      setError('Failed to update task: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Task Manager</h1>
        <button onClick={handleLogout} className="task-button logout">
          Logout
        </button>
      </div>
      
      {error && <p className="error">{error}</p>}
      
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
        <button type="submit" className="task-button primary">Add Task</button>
      </form>
      
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="task-list">
          {tasks.length === 0 ? (
            <p>No tasks found. Create your first task above!</p>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className={`task-card ${task.completed ? 'completed' : ''}`}>
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
                    <div className="task-actions">
                      <button onClick={() => saveEdit(task._id)} className="task-button save">
                        Save
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
                    <div className="task-actions">
                      <button
                        onClick={() => toggleComplete(task)}
                        className={`task-button ${task.completed ? 'undo' : 'complete'}`}
                      >
                        {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                      </button>
                      <button onClick={() => startEditing(task)} className="task-button edit">
                        Edit
                      </button>
                      <button onClick={() => deleteTask(task._id)} className="task-button delete">
                        Delete
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
  );
};

export default Tasks;