import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format, isPast, isToday } from "date-fns";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import taskService from "@/services/api/taskService";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    farmId: "",
    cropId: "",
    title: "",
    dueDate: "",
    priority: "Medium",
    notes: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const priorities = ["High", "Medium", "Low"];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [tasksData, farmsData, cropsData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ]);

      setTasks(tasksData);
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError("Failed to load tasks data. Please try again.");
      console.error("Tasks loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id.toString() === farmId.toString());
    return farm ? farm.name : "Unknown Farm";
  };

  const getCropName = (cropId) => {
    if (!cropId) return "General Task";
    const crop = crops.find(c => c.Id.toString() === cropId.toString());
    return crop ? `${crop.name} (${crop.variety})` : "Unknown Crop";
  };

  const getFarmCrops = (farmId) => {
    return crops.filter(crop => crop.farmId.toString() === farmId.toString());
  };

  const getPriorityVariant = (priority) => {
    switch (priority.toLowerCase()) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "info";
      default: return "default";
    }
  };

  const getTaskUrgency = (task) => {
    const dueDate = new Date(task.dueDate);
    if (task.completed) return "completed";
    if (isPast(dueDate) && !isToday(dueDate)) return "overdue";
    if (isToday(dueDate)) return "due-today";
    return "upcoming";
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "completed": return "text-green-600";
      case "overdue": return "text-red-600";
      case "due-today": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getFarmName(task.farmId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getCropName(task.cropId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      (statusFilter === "completed" && task.completed) ||
      (statusFilter === "pending" && !task.completed);
    
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    // Sort by completion status first (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then by due date
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const validateForm = () => {
    const errors = {};

    if (!formData.farmId) {
      errors.farmId = "Please select a farm";
    }

    if (!formData.title.trim()) {
      errors.title = "Task title is required";
    }

    if (!formData.dueDate) {
      errors.dueDate = "Due date is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const taskData = {
        ...formData,
        cropId: formData.cropId || null
      };

      if (editingTask) {
        const updatedTask = await taskService.update(editingTask.Id, taskData);
        setTasks(tasks.map(task => 
          task.Id === editingTask.Id ? updatedTask : task
        ));
        toast.success("Task updated successfully!");
      } else {
        const newTask = await taskService.create(taskData);
        setTasks([...tasks, newTask]);
        toast.success("Task added successfully!");
      }

      handleCloseModal();
    } catch (err) {
      toast.error("Failed to save task. Please try again.");
      console.error("Task save error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await taskService.toggleComplete(task.Id);
      setTasks(tasks.map(t => t.Id === task.Id ? updatedTask : t));
      toast.success(updatedTask.completed ? "Task completed!" : "Task marked as pending");
    } catch (err) {
      toast.error("Failed to update task status.");
      console.error("Task toggle error:", err);
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await taskService.delete(task.Id);
      setTasks(tasks.filter(t => t.Id !== task.Id));
      toast.success("Task deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete task. Please try again.");
      console.error("Task delete error:", err);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      farmId: task.farmId,
      cropId: task.cropId || "",
      title: task.title,
      dueDate: task.dueDate.split("T")[0] + "T" + task.dueDate.split("T")[1].substring(0, 5),
      priority: task.priority,
      notes: task.notes || ""
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      farmId: "",
      cropId: "",
      title: "",
      dueDate: "",
      priority: "Medium",
      notes: ""
    });
    setFormErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear cropId when farm changes
    if (field === "farmId") {
      setFormData(prev => ({
        ...prev,
        farmId: value,
        cropId: ""
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">Organize and track your farm tasks efficiently</p>
        </div>
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowModal(true)}
          disabled={farms.length === 0}
        >
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks by title, farm, or crop..."
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status"
          >
            <option value="">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </Select>
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            placeholder="Filter by priority"
          >
            <option value="">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* No Farms Warning */}
      {farms.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <ApperIcon name="AlertTriangle" size={20} className="text-yellow-600" />
            <p className="text-yellow-800">
              You need to add a farm before you can create tasks.
            </p>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {sortedTasks.length === 0 ? (
        <Empty
          title={searchTerm || statusFilter || priorityFilter ? "No tasks found" : "No tasks yet"}
          description={searchTerm || statusFilter || priorityFilter ? "Try adjusting your search or filter criteria" : "Create your first task to start organizing your farm work"}
          action={(!searchTerm && !statusFilter && !priorityFilter && farms.length > 0) ? () => setShowModal(true) : undefined}
          actionLabel="Add Task"
          icon="CheckSquare"
        />
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => {
            const urgency = getTaskUrgency(task);
            return (
              <div
                key={task.Id}
                className={`card ${task.completed ? 'opacity-60' : ''} ${urgency === 'overdue' ? 'border-l-4 border-red-500' : urgency === 'due-today' ? 'border-l-4 border-orange-500' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-primary-500'
                      }`}
                    >
                      {task.completed && (
                        <ApperIcon name="Check" size={14} className="text-white" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="MapPin" size={14} />
                            <span>{getFarmName(task.farmId)}</span>
                          </div>
                          
                          {task.cropId && (
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="Wheat" size={14} />
                              <span>{getCropName(task.cropId)}</span>
                            </div>
                          )}
                        </div>

                        {task.notes && (
                          <p className="text-sm text-gray-600 mt-2">{task.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 ml-4">
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getUrgencyColor(urgency)}`}>
                            {format(new Date(task.dueDate), "MMM d, h:mm a")}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {urgency === "overdue" && "Overdue"}
                            {urgency === "due-today" && "Due Today"}
                            {urgency === "upcoming" && "Upcoming"}
                            {urgency === "completed" && "Completed"}
                          </div>
                        </div>

                        <Badge variant={getPriorityVariant(task.priority)} size="sm">
                          {task.priority}
                        </Badge>

                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon="Edit"
                            onClick={() => handleEdit(task)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon="Trash2"
                            onClick={() => handleDelete(task)}
                            className="text-red-600 hover:bg-red-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCloseModal}
          />
          
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {editingTask ? "Edit Task" : "Add New Task"}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="X"
                  onClick={handleCloseModal}
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Farm"
                  required
                  error={formErrors.farmId}
                >
                  <Select
                    value={formData.farmId}
                    onChange={(e) => handleInputChange("farmId", e.target.value)}
                    placeholder="Select a farm"
                    error={formErrors.farmId}
                  >
                    {farms.map(farm => (
                      <option key={farm.Id} value={farm.Id}>
                        {farm.name} ({farm.size} {farm.unit})
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Related Crop (Optional)">
                  <Select
                    value={formData.cropId}
                    onChange={(e) => handleInputChange("cropId", e.target.value)}
                    placeholder="Select a crop (optional)"
                    disabled={!formData.farmId}
                  >
                    <option value="">General Task</option>
                    {formData.farmId && getFarmCrops(formData.farmId).map(crop => (
                      <option key={crop.Id} value={crop.Id}>
                        {crop.name} ({crop.variety})
                      </option>
                    ))}
                  </Select>
                  {!formData.farmId && (
                    <p className="text-xs text-gray-500 mt-1">Select a farm first to see crops</p>
                  )}
                </FormField>

                <FormField
                  label="Task Title"
                  required
                  error={formErrors.title}
                >
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Water tomato plants"
                    error={formErrors.title}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Due Date & Time"
                    required
                    error={formErrors.dueDate}
                  >
                    <Input
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                      error={formErrors.dueDate}
                    />
                  </FormField>

                  <FormField label="Priority">
                    <Select
                      value={formData.priority}
                      onChange={(e) => handleInputChange("priority", e.target.value)}
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </Select>
                  </FormField>
                </div>

                <FormField label="Notes">
                  <Input
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Optional notes about this task"
                  />
                </FormField>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    icon={submitting ? "Loader2" : editingTask ? "Save" : "Plus"}
                  >
                    {submitting ? "Saving..." : editingTask ? "Update Task" : "Add Task"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;