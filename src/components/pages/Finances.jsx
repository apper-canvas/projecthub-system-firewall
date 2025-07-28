import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Chart from "react-apexcharts";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import transactionService from "@/services/api/transactionService";
import farmService from "@/services/api/farmService";

const Finances = () => {
  const [transactions, setTransactions] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [farmFilter, setFarmFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    farmId: "",
    type: "expense",
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const expenseCategories = ["Seeds", "Fertilizer", "Pest Control", "Equipment", "Fuel", "Labor", "Utilities", "Other"];
  const incomeCategories = ["Vegetable Sales", "Fruit Sales", "Grain Sales", "Livestock Sales", "Other"];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [transactionsData, farmsData] = await Promise.all([
        transactionService.getAll(),
        farmService.getAll()
      ]);

      setTransactions(transactionsData);
      setFarms(farmsData);
    } catch (err) {
      setError("Failed to load financial data. Please try again.");
      console.error("Finances loading error:", err);
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

  const getFinancialSummary = () => {
    const filteredData = getFilteredTransactions();
    
    const income = filteredData
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredData
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expenses,
      profit: income - expenses,
      transactionCount: filteredData.length
    };
  };

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           getFarmName(transaction.farmId).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !typeFilter || transaction.type === typeFilter;
      const matchesCategory = !categoryFilter || transaction.category === categoryFilter;
      const matchesFarm = !farmFilter || transaction.farmId.toString() === farmFilter;
      
      return matchesSearch && matchesType && matchesCategory && matchesFarm;
    });
  };

  const getChartData = () => {
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize months
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear, i, 1).toISOString().slice(0, 7);
      monthlyData[month] = { income: 0, expenses: 0 };
    }

    // Aggregate data
    transactions.forEach(transaction => {
      const month = transaction.date.slice(0, 7);
      if (monthlyData[month]) {
        if (transaction.type === "income") {
          monthlyData[month].income += transaction.amount;
        } else {
          monthlyData[month].expenses += transaction.amount;
        }
      }
    });

    const months = Object.keys(monthlyData).sort();
    const incomeData = months.map(month => monthlyData[month].income);
    const expenseData = months.map(month => monthlyData[month].expenses);
    const monthLabels = months.map(month => format(new Date(month + "-01"), "MMM"));

    return {
      series: [
        {
          name: "Income",
          data: incomeData,
          color: "#22c55e"
        },
        {
          name: "Expenses", 
          data: expenseData,
          color: "#ef4444"
        }
      ],
      categories: monthLabels
    };
  };

  const chartOptions = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif"
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4
      }
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"]
    },
    xaxis: {
      categories: getChartData().categories,
      title: { text: "Month" }
    },
    yaxis: {
      title: { text: "Amount ($)" },
      labels: {
        formatter: (value) => `$${value.toLocaleString()}`
      }
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val) => `$${val.toLocaleString()}`
      }
    },
    legend: {
      position: "top",
      horizontalAlign: "right"
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 3
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.farmId) {
      errors.farmId = "Please select a farm";
    }

    if (!formData.category) {
      errors.category = "Please select a category";
    }

    if (!formData.amount || formData.amount <= 0) {
      errors.amount = "Valid amount is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.date) {
      errors.date = "Date is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingTransaction) {
        const updatedTransaction = await transactionService.update(editingTransaction.Id, transactionData);
        setTransactions(transactions.map(transaction => 
          transaction.Id === editingTransaction.Id ? updatedTransaction : transaction
        ));
        toast.success("Transaction updated successfully!");
      } else {
        const newTransaction = await transactionService.create(transactionData);
        setTransactions([...transactions, newTransaction]);
        toast.success("Transaction added successfully!");
      }

      handleCloseModal();
    } catch (err) {
      toast.error("Failed to save transaction. Please try again.");
      console.error("Transaction save error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (transaction) => {
    if (!window.confirm(`Are you sure you want to delete this transaction? This action cannot be undone.`)) {
      return;
    }

    try {
      await transactionService.delete(transaction.Id);
      setTransactions(transactions.filter(t => t.Id !== transaction.Id));
      toast.success("Transaction deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete transaction. Please try again.");
      console.error("Transaction delete error:", err);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      farmId: transaction.farmId,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      date: transaction.date.split("T")[0],
      description: transaction.description
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setFormData({
      farmId: "",
      type: "expense",
      category: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: ""
    });
    setFormErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear category when type changes
    if (field === "type") {
      setFormData(prev => ({
        ...prev,
        type: value,
        category: ""
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

  const filteredTransactions = getFilteredTransactions().sort((a, b) => new Date(b.date) - new Date(a.date));
  const summary = getFinancialSummary();

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600">Track income and expenses across your farm operations</p>
        </div>
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowModal(true)}
          disabled={farms.length === 0}
        >
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={`$${summary.income.toLocaleString()}`}
          icon="TrendingUp"
          gradient={true}
          className="text-green-600"
        />
        
        <StatCard
          title="Total Expenses"
          value={`$${summary.expenses.toLocaleString()}`}
          icon="TrendingDown"
          className="text-red-600"
        />
        
        <StatCard
          title="Net Profit"
          value={`$${summary.profit.toLocaleString()}`}
          icon="DollarSign"
          trend={summary.profit > 0 ? "up" : "down"}
          trendValue={`${summary.profit > 0 ? '+' : ''}$${Math.abs(summary.profit).toLocaleString()}`}
        />
        
        <StatCard
          title="Transactions"
          value={summary.transactionCount}
          subtitle="Total records"
          icon="FileText"
        />
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-6 flex items-center space-x-2">
          <ApperIcon name="BarChart3" size={20} className="text-primary-500" />
          <span>Monthly Income vs Expenses</span>
        </h2>
        
        <Chart
          options={chartOptions}
          series={getChartData().series}
          type="bar"
          height={300}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions by description, category, or farm..."
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={farmFilter}
            onChange={(e) => setFarmFilter(e.target.value)}
            placeholder="Filter by farm"
          >
            <option value="">All Farms</option>
            {farms.map(farm => (
              <option key={farm.Id} value={farm.Id}>{farm.name}</option>
            ))}
          </Select>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            placeholder="Filter by type"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Filter by category"
          >
            <option value="">All Categories</option>
            {[...expenseCategories, ...incomeCategories].sort().map(category => (
              <option key={category} value={category}>{category}</option>
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
              You need to add a farm before you can record transactions.
            </p>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <Empty
          title={searchTerm || typeFilter || categoryFilter || farmFilter ? "No transactions found" : "No transactions yet"}
          description={searchTerm || typeFilter || categoryFilter || farmFilter ? "Try adjusting your search or filter criteria" : "Start tracking your farm's financial activity by adding your first transaction"}
          action={(!searchTerm && !typeFilter && !categoryFilter && !farmFilter && farms.length > 0) ? () => setShowModal(true) : undefined}
          actionLabel="Add Transaction"
          icon="DollarSign"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Farm</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.Id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {format(new Date(transaction.date), "MMM d, yyyy")}
                      </p>
                    </td>
                    
                    <td className="px-6 py-4">
                      <Badge variant={transaction.type === "income" ? "success" : "danger"}>
                        {transaction.type}
                      </Badge>
                    </td>
                    
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{transaction.category}</p>
                    </td>
                    
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{transaction.description}</p>
                    </td>
                    
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{getFarmName(transaction.farmId)}</p>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <p className={`text-sm font-medium ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                      </p>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Edit"
                          onClick={() => handleEdit(transaction)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Trash2"
                          onClick={() => handleDelete(transaction)}
                          className="text-red-600 hover:bg-red-50"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Type" required>
                    <Select
                      value={formData.type}
                      onChange={(e) => handleInputChange("type", e.target.value)}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </Select>
                  </FormField>

                  <FormField
                    label="Category"
                    required
                    error={formErrors.category}
                  >
                    <Select
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      placeholder="Select category"
                      error={formErrors.category}
                    >
                      {(formData.type === "income" ? incomeCategories : expenseCategories).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </Select>
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Amount"
                    required
                    error={formErrors.amount}
                  >
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      error={formErrors.amount}
                    />
                  </FormField>

                  <FormField
                    label="Date"
                    required
                    error={formErrors.date}
                  >
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      error={formErrors.date}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Description"
                  required
                  error={formErrors.description}
                >
                  <Input
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter transaction description"
                    error={formErrors.description}
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
                    icon={submitting ? "Loader2" : editingTransaction ? "Save" : "Plus"}
                  >
                    {submitting ? "Saving..." : editingTransaction ? "Update Transaction" : "Add Transaction"}
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

export default Finances;