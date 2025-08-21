import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const TaskModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  projects = [], 
  task = null, 
  title = "Create New Task" 
}) => {
const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    status: 'to-do',
    dueDate: '',
    category: 'General'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (task) {
setFormData({
        title: task.title || '',
        description: task.description || '',
        projectId: task.projectId || '',
        status: task.status || 'to-do',
        dueDate: task.dueDate || '',
        category: task.category || 'General'
      });
    } else {
setFormData({
        title: '',
        description: '',
        projectId: '',
        status: 'to-do',
        dueDate: '',
        category: 'General'
      });
    }
    setFormErrors({});
  }, [task, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.projectId) {
      errors.projectId = 'Project is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="X" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
              Project *
            </label>
            <select
              id="projectId"
              value={formData.projectId}
              onChange={(e) => handleInputChange('projectId', e.target.value)}
              disabled={isSubmitting}
              className={cn(
                "w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                formErrors.projectId ? 'border-red-300' : 'border-gray-300'
              )}
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

          <Input
            label="Task Title"
            placeholder="Enter task title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            error={formErrors.title}
            disabled={isSubmitting}
          />

          <Textarea
            label="Description"
            placeholder="Enter task description (optional)"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            disabled={isSubmitting}
/>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="General">General</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Testing">Testing</option>
              <option value="Documentation">Documentation</option>
              <option value="Planning">Planning</option>
              <option value="Bug Fix">Bug Fix</option>
              <option value="Feature">Feature</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="to-do">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange("dueDate", e.target.value)}
            disabled={isSubmitting}
          />

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                  {task ? "Update" : "Create"} Task
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;