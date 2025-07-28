import farmsData from "@/services/mockData/farms.json";

class FarmService {
  constructor() {
    this.farms = [...farmsData];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.farms];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.farms.find(farm => farm.Id === id);
  }

  async create(farmData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newFarm = {
      ...farmData,
      Id: Math.max(...this.farms.map(f => f.Id)) + 1,
      createdAt: new Date().toISOString()
    };
    this.farms.push(newFarm);
    return { ...newFarm };
  }

  async update(id, farmData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    const index = this.farms.findIndex(farm => farm.Id === id);
    if (index !== -1) {
      this.farms[index] = { ...this.farms[index], ...farmData };
      return { ...this.farms[index] };
    }
    throw new Error("Farm not found");
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const index = this.farms.findIndex(farm => farm.Id === id);
    if (index !== -1) {
      const deletedFarm = this.farms.splice(index, 1)[0];
      return { ...deletedFarm };
    }
    throw new Error("Farm not found");
  }
}

export default new FarmService();