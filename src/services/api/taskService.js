import { toast } from 'react-toastify';

class TaskService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'task_c';
  }

  async getAll(projectId = null) {
    try {
      const params = {
fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "projectId_c" } },
          { field: { Name: "completed_c" } },
          { field: { Name: "createdAt_c" } },
          { field: { Name: "commentCount_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "dueDate_c" } },
          { field: { Name: "category_c" } }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      // Add project filter if specified
      if (projectId) {
        params.where = [
          {
            FieldName: "projectId_c",
            Operator: "EqualTo",
            Values: [projectId.toString()]
          }
        ];
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Handle empty results
      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Map database field names to UI field names for backward compatibility
// Map database field names to UI field names for backward compatibility
      return response.data.map(task => ({
        ...task,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        projectId: task.projectId_c?.Id || task.projectId_c,
        completed: task.completed_c || false,
        createdAt: task.createdAt_c || task.CreatedOn,
        commentCount: task.commentCount_c || 0,
        status: task.status_c || 'to-do',
        category: task.category_c || 'General',
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching tasks:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getById(id) {
    try {
const params = {
fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "projectId_c" } },
          { field: { Name: "completed_c" } },
          { field: { Name: "createdAt_c" } },
          { field: { Name: "commentCount_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "dueDate_c" } },
          { field: { Name: "category_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);

      if (!response || !response.data) {
        return null;
      }

      // Map database field names to UI field names for backward compatibility
      const task = response.data;
return {
        ...task,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        projectId: task.projectId_c?.Id || task.projectId_c,
        completed: task.completed_c || false,
        createdAt: task.createdAt_c || task.CreatedOn,
        commentCount: task.commentCount_c || 0,
        status: task.status_c || 'to-do',
        dueDate: task.dueDate_c || null,
        category: task.category_c || 'General'
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching task with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async create(taskData) {
    try {
      // Only include Updateable fields in create operation
      const params = {
records: [
          {
            Name: taskData.title || '',
            Tags: taskData.tags || '',
            title_c: taskData.title || '',
            description_c: taskData.description || '',
            projectId_c: parseInt(taskData.projectId), // Send as integer ID for lookup field
            completed_c: false,
            createdAt_c: new Date().toISOString(),
            status_c: taskData.status || 'to-do',
            dueDate_c: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
            category_c: taskData.category || 'General'
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create task ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create task");
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          const task = successfulRecord.data;
          toast.success('Task created successfully!');
return {
            ...task,
            title: task.title_c || task.Name || '',
            description: task.description_c || '',
            projectId: task.projectId_c?.Id || task.projectId_c,
            completed: task.completed_c || false,
            createdAt: task.createdAt_c || task.CreatedOn,
            status: task.status_c || 'to-do',
            dueDate: task.dueDate_c || null,
            category: task.category_c || 'General'
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating task:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async update(id, taskData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };

// Only include fields that are being updated
      if (taskData.title !== undefined) {
        updateData.Name = taskData.title;
        updateData.title_c = taskData.title;
      }
      if (taskData.description !== undefined) {
        updateData.description_c = taskData.description;
      }
      if (taskData.projectId !== undefined) {
        updateData.projectId_c = parseInt(taskData.projectId);
      }
      if (taskData.completed !== undefined) {
        updateData.completed_c = taskData.completed;
      }
      if (taskData.status !== undefined) {
        updateData.status_c = taskData.status;
      }
      if (taskData.dueDate !== undefined) {
        updateData.dueDate_c = taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null;
      }
      if (taskData.category !== undefined) {
        updateData.category_c = taskData.category;
      }

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update task ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update task");
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          const task = successfulRecord.data;
          toast.success('Task updated successfully!');
return {
            ...task,
            title: task.title_c || task.Name || '',
            description: task.description_c || '',
            projectId: task.projectId_c?.Id || task.projectId_c,
            completed: task.completed_c || false,
            createdAt: task.createdAt_c || task.CreatedOn,
            status: task.status_c || 'to-do',
            dueDate: task.dueDate_c || null,
            category: task.category_c || 'General'
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating task:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete task ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        toast.success('Task deleted successfully!');
        return true;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting task:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }

  async toggleComplete(id) {
    try {
      // First get current task state to toggle
      const currentTask = await this.getById(id);
      if (!currentTask) {
        throw new Error('Task not found');
      }

      const newCompletedState = !currentTask.completed;
      const updatedTask = await this.update(id, { completed: newCompletedState });
      
      const status = newCompletedState ? 'completed' : 'pending';
      toast.success(`Task marked as ${status}!`);
      return updatedTask;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error toggling task completion:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
}

export const taskService = new TaskService();