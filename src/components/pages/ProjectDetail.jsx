import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Textarea from '@/components/atoms/Textarea';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { projectService } from '@/services/api/projectService';
import { taskService } from '@/services/api/taskService';
import { commentService } from '@/services/api/commentService';
import { toast } from 'react-toastify';
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectData, allTasks] = await Promise.all([
        projectService.getById(parseInt(id)),
        taskService.getAll()
      ]);
      
      if (!projectData) {
        setError('Project not found');
        return;
      }
      
      setProject(projectData);
      setTasks(allTasks.filter(task => task.projectId === parseInt(id)));
    } catch (err) {
      console.error('Error loading project data:', err);
      setError('Failed to load project details');
      toast.error('Error loading project details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    const variants = {
      'active': 'success',
      'completed': 'primary',
      'on-hold': 'warning',
      'not-started': 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Active',
      'completed': 'Completed', 
      'on-hold': 'On Hold',
      'not-started': 'Not Started'
    };
    return labels[status] || status;
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadProjectData}
      />
    );
  }

  if (!project) {
    return (
      <Empty 
        message="Project not found"
        description="The requested project could not be found."
      />
    );
  }

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <button
          onClick={handleBackToProjects}
          className="flex items-center space-x-1 hover:text-primary-600 transition-colors"
        >
          <ApperIcon name="Home" size={16} />
          <span>Projects</span>
        </button>
        <ApperIcon name="ChevronRight" size={16} />
        <span className="text-gray-900 font-medium">{project.title}</span>
      </nav>

      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {project.title}
              </h1>
              <Badge variant={getStatusVariant(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>
            </div>
            
            <p className="text-gray-600 mb-4 leading-relaxed">
              {project.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <ApperIcon name="Calendar" size={16} />
                <span>Created: {format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
              </div>
              {project.updatedAt && project.updatedAt !== project.createdAt && (
                <div className="flex items-center gap-2">
                  <ApperIcon name="Clock" size={16} />
                  <span>Updated: {format(new Date(project.updatedAt), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={handleBackToProjects}
            className="shrink-0"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Projects
          </Button>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Project Tasks
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
            
            {totalTasks > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {tasks.length === 0 ? (
            <Empty 
              message="No tasks found"
              description="This project doesn't have any tasks assigned yet."
            />
          ) : (
<div className="space-y-4">
              {tasks.map((task) => (
                <TaskWithComments key={task.Id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskWithComments = ({ task }) => {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  const loadComments = async () => {
    if (!expanded) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await commentService.getAll(task.Id);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded) {
      loadComments();
    }
  }, [expanded]);

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
      loadComments();
    } catch (err) {
      console.error('Error adding comment:', err);
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
      loadComments();
    } catch (err) {
      console.error('Error updating comment:', err);
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
      loadComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="pt-1">
          {task.completed ? (
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <ApperIcon name="Check" size={12} className="text-white" />
            </div>
          ) : (
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                {task.commentCount > 0 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full flex items-center gap-1">
                    <ApperIcon name="MessageSquare" size={10} />
                    {task.commentCount}
                  </span>
                )}
              </div>
              
              {task.description && (
                <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <ApperIcon name="Calendar" size={12} />
                  <span>Created {format(new Date(task.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                
                {task.completed && (
                  <Badge variant="success" className="text-xs">
                    Completed
                  </Badge>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpanded}
              className="text-gray-400 hover:text-gray-600"
            >
              <ApperIcon name={expanded ? "ChevronUp" : "MessageSquare"} size={16} />
            </Button>
          </div>

          {/* Comments Section */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Comments</h4>
                <span className="text-xs text-gray-500">{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="mb-2"
                  rows={2}
                />
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={!newComment.trim()}
                  >
                    Add Comment
                  </Button>
                </div>
              </form>

              {/* Comments List */}
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-600 text-sm py-2">{error}</div>
              ) : comments.length === 0 ? (
                <div className="text-gray-500 text-sm py-2">No comments yet</div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.Id} className="bg-gray-50 rounded-lg p-3">
                      {editingComment === comment.Id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(comment.Id)}
                              disabled={!editText.trim()}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-gray-900 flex-1">{comment.text}</p>
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditComment(comment)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                              >
                                <ApperIcon name="Edit" size={12} />
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
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(comment.timestamp), 'MMM dd, yyyy \'at\' h:mm a')}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProjectDetail;