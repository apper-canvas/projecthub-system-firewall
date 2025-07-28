import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format, differenceInDays } from "date-fns";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import ProgressBar from "@/components/molecules/ProgressBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import cropService from "@/services/api/cropService";
import farmService from "@/services/api/farmService";

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [formData, setFormData] = useState({
    farmId: "",
    name: "",
    variety: "",
    plantingDate: "",
    expectedHarvest: "",
    status: "Seedling",
    area: "",
    notes: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const cropStatuses = ["Seedling", "Growing", "Flowering", "Mature", "Harvested"];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [cropsData, farmsData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ]);

      setCrops(cropsData);
      setFarms(farmsData);
    } catch (err) {
      setError("Failed to load crops data. Please try again.");
      console.error("Crops loading error:", err);
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

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getFarmName(crop.farmId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || crop.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const validateForm = () => {
    const errors = {};

    if (!formData.farmId) {
      errors.farmId = "Please select a farm";
    }

    if (!formData.name.trim()) {
      errors.name = "Crop name is required";
    }

    if (!formData.variety.trim()) {
      errors.variety = "Variety is required";
    }

    if (!formData.plantingDate) {
      errors.plantingDate = "Planting date is required";
    }

    if (!formData.expectedHarvest) {
      errors.expectedHarvest = "Expected harvest date is required";
    }

    if (formData.plantingDate && formData.expectedHarvest) {
      const planting = new Date(formData.plantingDate);
      const harvest = new Date(formData.expectedHarvest);
      if (harvest <= planting) {
        errors.expectedHarvest = "Harvest date must be after planting date";
      }
    }

    if (!formData.area || formData.area <= 0) {
      errors.area = "Valid area is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const cropData = {
        ...formData,
        area: parseFloat(formData.area)
      };

      if (editingCrop) {
        const updatedCrop = await cropService.update(editingCrop.Id, cropData);
        setCrops(crops.map(crop => 
          crop.Id === editingCrop.Id ? updatedCrop : crop
        ));
        toast.success("Crop updated successfully!");
      } else {
        const newCrop = await cropService.create(cropData);
        setCrops([...crops, newCrop]);
        toast.success("Crop added successfully!");
      }

      handleCloseModal();
    } catch (err) {
      toast.error("Failed to save crop. Please try again.");
      console.error("Crop save error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (crop) => {
    if (!window.confirm(`Are you sure you want to delete "${crop.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await cropService.delete(crop.Id);
      setCrops(crops.filter(c => c.Id !== crop.Id));
      toast.success("Crop deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete crop. Please try again.");
      console.error("Crop delete error:", err);
    }
  };

  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setFormData({
      farmId: crop.farmId,
      name: crop.name,
      variety: crop.variety,
      plantingDate: crop.plantingDate.split("T")[0],
      expectedHarvest: crop.expectedHarvest.split("T")[0],
      status: crop.status,
      area: crop.area.toString(),
      notes: crop.notes || ""
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCrop(null);
    setFormData({
      farmId: "",
      name: "",
      variety: "",
      plantingDate: "",
      expectedHarvest: "",
      status: "Seedling",
      area: "",
      notes: ""
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
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crop Management</h1>
          <p className="text-gray-600">Track your crops from planting to harvest</p>
        </div>
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowModal(true)}
          disabled={farms.length === 0}
        >
          Add Crop
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search crops by name, variety, or farm..."
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status"
          >
            <option value="">All Statuses</option>
            {cropStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
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
              You need to add a farm before you can add crops. 
              <Button variant="ghost" size="sm" className="ml-2 text-yellow-800 underline">
                Add Farm First
              </Button>
            </p>
          </div>
        </div>
      )}

      {/* Crops Table */}
      {filteredCrops.length === 0 ? (
        <Empty
          title={searchTerm || statusFilter ? "No crops found" : "No crops yet"}
          description={searchTerm || statusFilter ? "Try adjusting your search or filter criteria" : "Add your first crop to start tracking your agricultural production"}
          action={(!searchTerm && !statusFilter && farms.length > 0) ? () => setShowModal(true) : undefined}
          actionLabel="Add Crop"
          icon="Wheat"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Crop</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Farm</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Progress</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Dates</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Area</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCrops.map((crop) => (
                  <tr key={crop.Id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
                          <ApperIcon name="Wheat" size={20} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{crop.name}</p>
                          <p className="text-sm text-gray-500">{crop.variety}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{getFarmName(crop.farmId)}</p>
                    </td>
                    
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(crop.status)}>
                        {crop.status}
                      </Badge>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="w-24">
                        <ProgressBar
                          value={getCropProgress(crop)}
                          variant="primary"
                          size="sm"
                          showValue={false}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round(getCropProgress(crop))}%
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          Planted: {format(new Date(crop.plantingDate), "MMM d")}
                        </p>
                        <p className="text-gray-500">
                          Harvest: {format(new Date(crop.expectedHarvest), "MMM d")}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{crop.area} acres</p>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Edit"
                          onClick={() => handleEdit(crop)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Trash2"
                          onClick={() => handleDelete(crop)}
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
                  {editingCrop ? "Edit Crop" : "Add New Crop"}
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
                  <FormField
                    label="Crop Name"
                    required
                    error={formErrors.name}
                  >
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g., Tomatoes"
                      error={formErrors.name}
                    />
                  </FormField>

                  <FormField
                    label="Variety"
                    required
                    error={formErrors.variety}
                  >
                    <Input
                      value={formData.variety}
                      onChange={(e) => handleInputChange("variety", e.target.value)}
                      placeholder="e.g., Cherry Tomatoes"
                      error={formErrors.variety}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Planting Date"
                    required
                    error={formErrors.plantingDate}
                  >
                    <Input
                      type="date"
                      value={formData.plantingDate}
                      onChange={(e) => handleInputChange("plantingDate", e.target.value)}
                      error={formErrors.plantingDate}
                    />
                  </FormField>

                  <FormField
                    label="Expected Harvest"
                    required
                    error={formErrors.expectedHarvest}
                  >
                    <Input
                      type="date"
                      value={formData.expectedHarvest}
                      onChange={(e) => handleInputChange("expectedHarvest", e.target.value)}
                      error={formErrors.expectedHarvest}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Status">
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                    >
                      {cropStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField
                    label="Area (acres)"
                    required
                    error={formErrors.area}
                  >
                    <Input
                      type="number"
                      value={formData.area}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      error={formErrors.area}
                    />
                  </FormField>
                </div>

                <FormField label="Notes">
                  <Input
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Optional notes about this crop"
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
                    icon={submitting ? "Loader2" : editingCrop ? "Save" : "Plus"}
                  >
                    {submitting ? "Saving..." : editingCrop ? "Update Crop" : "Add Crop"}
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

export default Crops;