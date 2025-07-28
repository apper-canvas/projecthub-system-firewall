import tasksData from "@/services/mockData/tasks.json";

class TaskService {
  constructor() {
    this.tasks = [...tasksData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.tasks];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.tasks.find(task => task.Id === id);
  }

  async getByFarmId(farmId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.tasks.filter(task => task.farmId === farmId.toString());
  }

  async create(taskData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newTask = {
      ...taskData,
      Id: Math.max(...this.tasks.map(t => t.Id)) + 1,
      farmId: taskData.farmId.toString(),
      cropId: taskData.cropId?.toString() || null,
      completed: false
    };
    this.tasks.push(newTask);
    return { ...newTask };
  }

  async update(id, taskData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    const index = this.tasks.findIndex(task => task.Id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...taskData };
      return { ...this.tasks[index] };
    }
    throw new Error("Task not found");
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const index = this.tasks.findIndex(task => task.Id === id);
    if (index !== -1) {
      const deletedTask = this.tasks.splice(index, 1)[0];
      return { ...deletedTask };
    }
    throw new Error("Task not found");
  }

  async toggleComplete(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = this.tasks.findIndex(task => task.Id === id);
    if (index !== -1) {
      this.tasks[index].completed = !this.tasks[index].completed;
      return { ...this.tasks[index] };
    }
    throw new Error("Task not found");
  }
}

export default new TaskService();