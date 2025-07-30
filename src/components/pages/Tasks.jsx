import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { commentService } from "@/services/api/commentService";
import { format } from "date-fns";
import { taskService } from "@/services/api/taskService";
import { projectService } from "@/services/api/projectService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Projects from "@/components/pages/Projects";
import Textarea from "@/components/atoms/Textarea";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const Tasks = () => {
const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: ''
  });
const [formErrors, setFormErrors] = useState({});
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('');
useEffect(() => {
    loadProjects();
    loadTasks();
  }, []);

  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId) {
      setSelectedProjectFilter(projectId);
    }
  }, [searchParams]);

const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectId = selectedProjectFilter || searchParams.get('projectId');
      const data = await taskService.getAll(projectId ? parseInt(projectId) : null);
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };
const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.projectId) {
      errors.projectId = 'Project is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

try {
      const newTask = await taskService.create(formData);
      setTasks(prev => [...prev, newTask]);
      setFormData({ title: '', description: '', projectId: '' });
      setFormErrors({});
      setShowForm(false);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

const handleToggleComplete = async (taskId) => {
    try {
      const updatedTask = await taskService.toggleComplete(taskId);
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error toggling task completion:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
    } catch (err) {
console.error('Error deleting task:', err);
    }
  };

  const handleProjectFilterChange = (projectId) => {
    setSelectedProjectFilter(projectId);
    loadTasks();
  };

  // Filter tasks based on selected project
  const filteredTasks = selectedProjectFilter 
    ? tasks.filter(task => task.projectId === parseInt(selectedProjectFilter))
    : tasks;

  const completedTasks = filteredTasks.filter(task => task.completed);
  const pendingTasks = filteredTasks.filter(task => !task.completed);

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.Id === projectId);
    return project ? project.title : 'Unknown Project';
  };
if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadTasks} />;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage your project tasks and to-dos
          </p>
{filteredTasks.length > 0 && (
            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              <span>{pendingTasks.length} pending</span>
              <span>{completedTasks.length} completed</span>
              <span>{filteredTasks.length} total</span>
            </div>
          )}

          {/* Project Filter */}
          <div className="mt-4">
            <label htmlFor="projectFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Project
            </label>
            <select
              id="projectFilter"
              value={selectedProjectFilter}
              onChange={(e) => handleProjectFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.Id} value={project.Id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          Add Task
        </Button>
      </div>

{showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                Project *
              </label>
              <select
                id="projectId"
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formErrors.projectId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.Id} value={project.Id}>
                    {project.title}
                  </option>
                ))}
              </select>
              {formErrors.projectId && (
                <p className="text-red-600 text-sm mt-1">{formErrors.projectId}</p>
              )}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task title"
                className={formErrors.title ? 'border-red-300' : ''}
              />
              {formErrors.title && (
                <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', description: '', projectId: '' });
                  setFormErrors({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Task
              </Button>
            </div>
          </form>
        </Card>
      )}

{filteredTasks.length === 0 ? (
        <Empty
          title="No tasks yet"
          message="Create your first task to get started with managing your to-dos."
          icon="CheckSquare"
          actionLabel="Add Task"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-4">
          {pendingTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Pending Tasks ({pendingTasks.length})
              </h2>
              <div className="space-y-3">
{pendingTasks.map(task => (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    projectName={getProjectName(task.projectId)}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                    onCommentUpdate={loadTasks}
                  />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Completed Tasks ({completedTasks.length})
              </h2>
              <div className="space-y-3">
{completedTasks.map(task => (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    projectName={getProjectName(task.projectId)}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                    onCommentUpdate={loadTasks}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ task, projectName, onToggleComplete, onDelete, onCommentUpdate }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  const loadComments = async () => {
    if (!expanded) return;
    
    try {
      setLoading(true);
      const data = await commentService.getAll(task.Id);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded) {
      loadComments();
    }
  }, [expanded, task.Id]);

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentService.create({
        text: newComment.trim(),
        taskId: task.Id
      });
      setNewComment('');
      await loadComments();
      if (onCommentUpdate) {
        await onCommentUpdate();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.Id);
    setEditText(comment.text);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await commentService.update(commentId, {
        text: editText.trim()
      });
      setEditingComment(null);
      setEditText('');
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentService.delete(commentId);
      await loadComments();
      if (onCommentUpdate) {
        await onCommentUpdate();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <Card className={`p-4 transition-all duration-200 ${task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task.Id)}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300 hover:border-emerald-500'
          }`}
        >
          {task.completed && <ApperIcon name="Check" size={12} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {projectName && (
              <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                {projectName}
              </span>
            )}
<button 
              onClick={handleToggleExpanded}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full flex items-center gap-1 hover:bg-gray-200 transition-colors"
            >
              <ApperIcon name="MessageSquare" size={10} />
              {task.commentCount > 0 ? task.commentCount : 'Add Comment'}
            </button>
          </div>
          {task.description && (
            <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
          </p>

          {/* Comments Section */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Comments</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpanded}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name="X" size={14} />
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <>
                  {/* Comments List */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {comments.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No comments yet. Be the first to add one!</p>
                    ) : (
                      comments.map(comment => (
                        <div key={comment.Id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              {editingComment === comment.Id ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    rows={2}
                                    className="text-sm"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveEdit(comment.Id)}
                                      className="text-xs"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleCancelEdit}
                                      className="text-xs"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.text}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {format(new Date(comment.timestamp), 'MMM d, yyyy h:mm a')}
                                    {comment.createdBy?.Name && ` • ${comment.createdBy.Name}`}
                                  </p>
                                </>
                              )}
                            </div>
                            {editingComment !== comment.Id && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditComment(comment)}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                  <ApperIcon name="Edit2" size={12} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteComment(comment.Id)}
                                  className="text-gray-400 hover:text-red-600 p-1"
                                >
                                  <ApperIcon name="Trash2" size={12} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="mt-4">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      className="text-sm"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newComment.trim()}
                        className="text-xs"
                      >
                        Add Comment
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.Id)}
            className="text-gray-400 hover:text-red-600"
          >
            <ApperIcon name="Trash2" size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Tasks;