import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [cropCounts, setCropCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    size: "",
    unit: "acres",
    location: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadFarms = async () => {
    try {
      setLoading(true);
      setError("");

      const [farmsData, cropsData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll()
      ]);

      // Count active crops per farm
      const counts = {};
      cropsData.forEach(crop => {
        if (crop.status !== "Harvested") {
          counts[crop.farmId] = (counts[crop.farmId] || 0) + 1;
        }
      });

      setFarms(farmsData);
      setCropCounts(counts);
    } catch (err) {
      setError("Failed to load farms. Please try again.");
      console.error("Farms loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const filteredFarms = farms.filter(farm =>
    farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Farm name is required";
    }

    if (!formData.size || formData.size <= 0) {
      errors.size = "Valid size is required";
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const farmData = {
        ...formData,
        size: parseFloat(formData.size)
      };

      if (editingFarm) {
        const updatedFarm = await farmService.update(editingFarm.Id, farmData);
        setFarms(farms.map(farm => 
          farm.Id === editingFarm.Id ? updatedFarm : farm
        ));
        toast.success("Farm updated successfully!");
      } else {
        const newFarm = await farmService.create(farmData);
        setFarms([...farms, newFarm]);
        toast.success("Farm added successfully!");
      }

      handleCloseModal();
    } catch (err) {
      toast.error("Failed to save farm. Please try again.");
      console.error("Farm save error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (farm) => {
    if (!window.confirm(`Are you sure you want to delete "${farm.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await farmService.delete(farm.Id);
      setFarms(farms.filter(f => f.Id !== farm.Id));
      toast.success("Farm deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete farm. Please try again.");
      console.error("Farm delete error:", err);
    }
  };

  const handleEdit = (farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name,
      size: farm.size.toString(),
      unit: farm.unit,
      location: farm.location
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFarm(null);
    setFormData({
      name: "",
      size: "",
      unit: "acres",
      location: ""
    });
    setFormErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadFarms} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farm Management</h1>
          <p className="text-gray-600">Manage your farm properties and details</p>
        </div>
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowModal(true)}
        >
          Add Farm
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search farms by name or location..."
          />
        </div>
      </div>

      {/* Farms Grid */}
      {filteredFarms.length === 0 ? (
        <Empty
          title={searchTerm ? "No farms found" : "No farms yet"}
          description={searchTerm ? "Try adjusting your search terms" : "Add your first farm to start managing your agricultural operations"}
          action={searchTerm ? undefined : () => setShowModal(true)}
          actionLabel="Add Farm"
          icon="MapPin"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarms.map((farm) => (
            <div key={farm.Id} className="card group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
                    <ApperIcon name="MapPin" size={24} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{farm.name}</h3>
                    <p className="text-sm text-gray-500">{farm.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Edit"
                    onClick={() => handleEdit(farm)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Trash2"
                    onClick={() => handleDelete(farm)}
                    className="text-red-600 hover:bg-red-50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Size:</span>
                  <span className="font-medium">{farm.size} {farm.unit}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Active Crops:</span>
                  <span className="font-medium text-primary-600">
                    {cropCounts[farm.Id.toString()] || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">
                    {format(new Date(farm.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Farm ID: {farm.Id}</span>
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <ApperIcon name="Calendar" size={12} />
                    <span>{format(new Date(farm.createdAt), "MMM yyyy")}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCloseModal}
          />
          
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {editingFarm ? "Edit Farm" : "Add New Farm"}
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
                  label="Farm Name"
                  required
                  error={formErrors.name}
                >
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter farm name"
                    error={formErrors.name}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Size"
                    required
                    error={formErrors.size}
                  >
                    <Input
                      type="number"
                      value={formData.size}
                      onChange={(e) => handleInputChange("size", e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      error={formErrors.size}
                    />
                  </FormField>

                  <FormField label="Unit">
                    <Select
                      value={formData.unit}
                      onChange={(e) => handleInputChange("unit", e.target.value)}
                    >
                      <option value="acres">Acres</option>
                      <option value="hectares">Hectares</option>
                      <option value="sq ft">Square Feet</option>
                      <option value="sq m">Square Meters</option>
                    </Select>
                  </FormField>
                </div>

                <FormField
                  label="Location"
                  required
                  error={formErrors.location}
                >
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Enter farm location"
                    error={formErrors.location}
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
                    icon={submitting ? "Loader2" : editingFarm ? "Save" : "Plus"}
                  >
                    {submitting ? "Saving..." : editingFarm ? "Update Farm" : "Add Farm"}
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

export default Farms;