import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format, differenceInDays } from "date-fns";
import StatCard from "@/components/molecules/StatCard";
import ProgressBar from "@/components/molecules/ProgressBar";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";
import taskService from "@/services/api/taskService";
import transactionService from "@/services/api/transactionService";
import weatherService from "@/services/api/weatherService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    farms: [],
    crops: [],
    tasks: [],
    transactions: [],
    weather: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [farms, crops, tasks, transactions, weather] = await Promise.all([
        farmService.getAll(),
        cropService.getAll(),
        taskService.getAll(),
        transactionService.getAll(),
        weatherService.getCurrentWeather()
      ]);

      setData({ farms, crops, tasks, transactions, weather });
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Dashboard data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getFinancialSummary = () => {
    const income = data.transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = data.transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses, profit: income - expenses };
  };

  const getPendingTasks = () => {
    return data.tasks.filter(task => !task.completed);
  };

  const getActiveCrops = () => {
    return data.crops.filter(crop => crop.status !== "Harvested");
  };

  const getCropProgress = (crop) => {
    const plantingDate = new Date(crop.plantingDate);
    const expectedHarvest = new Date(crop.expectedHarvest);
    const today = new Date();
    
    const totalDays = differenceInDays(expectedHarvest, plantingDate);
    const daysPassed = differenceInDays(today, plantingDate);
    
    return Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);
  };

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "seedling": return "info";
      case "growing": return "primary";
      case "flowering": return "warning";
      case "mature": return "success";
      case "harvested": return "default";
      default: return "default";
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority.toLowerCase()) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "info";
      default: return "default";
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const financialSummary = getFinancialSummary();
  const pendingTasks = getPendingTasks();
  const activeCrops = getActiveCrops();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to FarmFlow</h1>
            <p className="text-primary-100 text-lg">
              Manage your farm operations efficiently and effectively
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {data.weather && (
              <div className="text-center">
                <ApperIcon name={data.weather.icon} size={40} className="mx-auto mb-2" />
                <p className="text-2xl font-bold">{data.weather.high}°F</p>
                <p className="text-sm text-primary-100">{data.weather.condition}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Farms"
          value={data.farms.length}
          subtitle={`${data.farms.reduce((sum, f) => sum + f.size, 0)} total acres`}
          icon="MapPin"
          gradient={true}
        />
        
        <StatCard
          title="Active Crops"
          value={activeCrops.length}
          subtitle={`${data.crops.length} total crops`}
          icon="Wheat"
          trend={activeCrops.length > 0 ? "up" : "down"}
          trendValue={`${Math.round((activeCrops.length / data.crops.length) * 100) || 0}% active`}
        />
        
        <StatCard
          title="Pending Tasks"
          value={pendingTasks.length}
          subtitle={`${data.tasks.length} total tasks`}
          icon="CheckSquare"
          trend={pendingTasks.length > 5 ? "up" : "down"}
          trendValue={`${Math.round(((data.tasks.length - pendingTasks.length) / data.tasks.length) * 100) || 0}% completed`}
        />
        
        <StatCard
          title="Monthly Profit"
          value={`$${financialSummary.profit.toLocaleString()}`}
          subtitle={`$${financialSummary.income.toLocaleString()} income`}
          icon="DollarSign"
          trend={financialSummary.profit > 0 ? "up" : "down"}
          trendValue={`$${Math.abs(financialSummary.profit).toLocaleString()}`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Crops */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <ApperIcon name="Wheat" size={24} className="text-primary-500" />
              <span>Active Crops</span>
            </h2>
            <Button
              variant="outline"
              size="sm"
              icon="Plus"
              onClick={() => navigate("/crops")}
            >
              View All
            </Button>
          </div>

          {activeCrops.length === 0 ? (
            <Empty
              title="No Active Crops"
              description="Start by adding your first crop to track its progress"
              action={() => navigate("/crops")}
              actionLabel="Add Crop"
              icon="Seedling"
            />
          ) : (
            <div className="space-y-4">
              {activeCrops.slice(0, 4).map((crop) => (
                <div key={crop.Id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{crop.name}</h3>
                      <p className="text-sm text-gray-500">{crop.variety}</p>
                    </div>
                    <Badge variant={getStatusVariant(crop.status)}>
                      {crop.status}
                    </Badge>
                  </div>
                  
                  <ProgressBar
                    value={getCropProgress(crop)}
                    label="Growth Progress"
                    variant="primary"
                    size="sm"
                  />
                  
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                    <span>Planted: {format(new Date(crop.plantingDate), "MMM d")}</span>
                    <span>Expected: {format(new Date(crop.expectedHarvest), "MMM d")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <ApperIcon name="CheckSquare" size={24} className="text-primary-500" />
              <span>Pending Tasks</span>
            </h2>
            <Button
              variant="outline"
              size="sm"
              icon="Plus"
              onClick={() => navigate("/tasks")}
            >
              View All
            </Button>
          </div>

          {pendingTasks.length === 0 ? (
            <Empty
              title="No Pending Tasks"
              description="All tasks are completed! Great job managing your farm."
              action={() => navigate("/tasks")}
              actionLabel="Add Task"
              icon="CheckCircle"
            />
          ) : (
            <div className="space-y-3">
              {pendingTasks.slice(0, 5).map((task) => (
                <div key={task.Id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <ApperIcon name="Clock" size={16} className="text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {format(new Date(task.dueDate), "MMM d, h:mm a")}
                    </p>
                  </div>
                  
                  <Badge
                    variant={getPriorityVariant(task.priority)}
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <ApperIcon name="Zap" size={24} className="text-primary-600" />
          <span className="text-primary-800">Quick Actions</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            className="justify-start"
            icon="MapPin"
            onClick={() => navigate("/farms")}
          >
            Add New Farm
          </Button>
          
          <Button
            variant="secondary"
            className="justify-start"
            icon="Seedling"
            onClick={() => navigate("/crops")}
          >
            Plant New Crop
          </Button>
          
          <Button
            variant="secondary"
            className="justify-start"
            icon="Plus"
            onClick={() => navigate("/tasks")}
          >
            Create Task
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;