import cropsData from "@/services/mockData/crops.json";

class CropService {
  constructor() {
    this.crops = [...cropsData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.crops];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.crops.find(crop => crop.Id === id);
  }

  async getByFarmId(farmId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.crops.filter(crop => crop.farmId === farmId.toString());
  }

  async create(cropData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newCrop = {
      ...cropData,
      Id: Math.max(...this.crops.map(c => c.Id)) + 1,
      farmId: cropData.farmId.toString()
    };
    this.crops.push(newCrop);
    return { ...newCrop };
  }

  async update(id, cropData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    const index = this.crops.findIndex(crop => crop.Id === id);
    if (index !== -1) {
      this.crops[index] = { ...this.crops[index], ...cropData };
      return { ...this.crops[index] };
    }
    throw new Error("Crop not found");
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const index = this.crops.findIndex(crop => crop.Id === id);
    if (index !== -1) {
      const deletedCrop = this.crops.splice(index, 1)[0];
      return { ...deletedCrop };
    }
    throw new Error("Crop not found");
  }
}

export default new CropService();