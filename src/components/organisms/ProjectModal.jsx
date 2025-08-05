import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const ProjectModal = ({ isOpen, onClose, onSave, project = null, title = "Create New Project" }) => {
const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "active",
    priority: "Medium",
    startDate: "",
    endDate: "",
    projectOwner: "",
    manager: "",
    teamMembers: "",
    tags: "",
    progress: 0,
    phase: "Initiation"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        status: project.status || "active",
        priority: project.priority || "Medium",
        startDate: project.startDate ? project.startDate.split('T')[0] : "",
        endDate: project.endDate ? project.endDate.split('T')[0] : "",
        projectOwner: project.projectOwner || "",
        manager: project.manager || "",
        teamMembers: project.teamMembers || "",
        tags: project.tags || "",
        progress: project.progress || 0,
        phase: project.phase || "Initiation"
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "active",
        priority: "Medium",
        startDate: "",
        endDate: "",
        projectOwner: "",
        manager: "",
        teamMembers: "",
        tags: "",
        progress: 0,
        phase: "Initiation"
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Project title is required";
    }
    if (formData.title.trim().length < 3) {
      newErrors.title = "Project title must be at least 3 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving project:", error);
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

<form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <Input
            label="Project Title"
            placeholder="Enter project title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            error={errors.title}
            disabled={isSubmitting}
          />

          <Textarea
            label="Description"
            placeholder="Describe your project (optional)"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-2 gap-4">
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
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              disabled={isSubmitting}
            />

            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Project Owner"
              placeholder="Enter project owner name"
              value={formData.projectOwner}
              onChange={(e) => handleInputChange("projectOwner", e.target.value)}
              disabled={isSubmitting}
            />

            <Input
              label="Manager"
              placeholder="Enter manager name"
              value={formData.manager}
              onChange={(e) => handleInputChange("manager", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <Input
            label="Team Members"
            placeholder="Enter team member names (comma-separated)"
            value={formData.teamMembers}
            onChange={(e) => handleInputChange("teamMembers", e.target.value)}
            disabled={isSubmitting}
          />

          <Input
            label="Tags"
            placeholder="Enter tags (comma-separated)"
            value={formData.tags}
            onChange={(e) => handleInputChange("tags", e.target.value)}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Progress (%)"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => handleInputChange("progress", parseInt(e.target.value) || 0)}
              disabled={isSubmitting}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phase
              </label>
              <select
                value={formData.phase}
                onChange={(e) => handleInputChange("phase", e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Initiation">Initiation</option>
                <option value="Planning">Planning</option>
                <option value="Execution">Execution</option>
                <option value="Closure">Closure</option>
              </select>
            </div>
          </div>

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
                  {project ? "Update" : "Create"} Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;