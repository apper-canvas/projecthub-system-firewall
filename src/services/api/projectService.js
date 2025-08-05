import { toast } from 'react-toastify';

class ProjectService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'project_c';
  }

async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "startDate_c" } },
          { field: { Name: "endDate_c" } },
          { field: { Name: "projectOwner_c" } },
          { field: { Name: "manager_c" } },
          { field: { Name: "progress_c" } },
          { field: { Name: "phase_c" } },
          { field: { Name: "createdAt_c" } },
          { field: { Name: "updatedAt_c" } }
        ],
        orderBy: [
          {
            fieldName: "updatedAt_c",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

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
      return response.data.map(project => ({
        ...project,
        title: project.title_c || project.Name || '',
        description: project.description_c || '',
        status: project.status_c || 'active',
        priority: project.priority_c || 'Medium',
        startDate: project.startDate_c || '',
        endDate: project.endDate_c || '',
        projectOwner: project.projectOwner_c?.Name || '',
        manager: project.manager_c?.Name || '',
        progress: project.progress_c || 0,
        phase: project.phase_c || 'Initiation',
        tags: project.Tags || '',
        createdAt: project.createdAt_c || project.CreatedOn,
        updatedAt: project.updatedAt_c || project.ModifiedOn
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching projects:", error?.response?.data?.message);
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
          { field: { Name: "status_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "startDate_c" } },
          { field: { Name: "endDate_c" } },
          { field: { Name: "projectOwner_c" } },
          { field: { Name: "manager_c" } },
          { field: { Name: "progress_c" } },
          { field: { Name: "phase_c" } },
          { field: { Name: "createdAt_c" } },
          { field: { Name: "updatedAt_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);

      if (!response || !response.data) {
        throw new Error("Project not found");
      }

      // Map database field names to UI field names for backward compatibility
      const project = response.data;
      return {
        ...project,
        title: project.title_c || project.Name || '',
        description: project.description_c || '',
        status: project.status_c || 'active',
        priority: project.priority_c || 'Medium',
        startDate: project.startDate_c || '',
        endDate: project.endDate_c || '',
        projectOwner: project.projectOwner_c?.Name || '',
        manager: project.manager_c?.Name || '',
        progress: project.progress_c || 0,
        phase: project.phase_c || 'Initiation',
        tags: project.Tags || '',
        createdAt: project.createdAt_c || project.CreatedOn,
        updatedAt: project.updatedAt_c || project.ModifiedOn
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching project with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw new Error("Project not found");
    }
  }

async create(projectData) {
    try {
      // Only include Updateable fields in create operation
      const params = {
        records: [
          {
            Name: projectData.title || projectData.Name || '',
            Tags: projectData.tags || '',
            title_c: projectData.title || '',
            description_c: projectData.description || '',
            status_c: projectData.status || 'active',
            priority_c: projectData.priority || 'Medium',
            startDate_c: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
            endDate_c: projectData.endDate ? new Date(projectData.endDate).toISOString() : null,
            projectOwner_c: projectData.projectOwner || null,
            manager_c: projectData.manager || null,
            progress_c: parseInt(projectData.progress) || 0,
            phase_c: projectData.phase || 'Initiation',
            createdAt_c: new Date().toISOString(),
            updatedAt_c: new Date().toISOString()
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
          console.error(`Failed to create project ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create project");
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          const project = successfulRecord.data;
          toast.success('Project created successfully!');
          return {
            ...project,
            title: project.title_c || project.Name || '',
            description: project.description_c || '',
            status: project.status_c || 'active',
            priority: project.priority_c || 'Medium',
            startDate: project.startDate_c || '',
            endDate: project.endDate_c || '',
            projectOwner: project.projectOwner_c?.Name || '',
            manager: project.manager_c?.Name || '',
            progress: project.progress_c || 0,
            phase: project.phase_c || 'Initiation',
            tags: project.Tags || '',
            createdAt: project.createdAt_c || project.CreatedOn,
            updatedAt: project.updatedAt_c || project.ModifiedOn
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating project:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

async update(id, projectData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: projectData.title || projectData.Name || '',
            Tags: projectData.tags || '',
            title_c: projectData.title || '',
            description_c: projectData.description || '',
            status_c: projectData.status || 'active',
            priority_c: projectData.priority || 'Medium',
            startDate_c: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
            endDate_c: projectData.endDate ? new Date(projectData.endDate).toISOString() : null,
            projectOwner_c: projectData.projectOwner || null,
            manager_c: projectData.manager || null,
            progress_c: parseInt(projectData.progress) || 0,
            phase_c: projectData.phase || 'Initiation',
            updatedAt_c: new Date().toISOString()
          }
        ]
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
          console.error(`Failed to update project ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update project");
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          const project = successfulRecord.data;
          toast.success('Project updated successfully!');
          return {
            ...project,
            title: project.title_c || project.Name || '',
            description: project.description_c || '',
            status: project.status_c || 'active',
            priority: project.priority_c || 'Medium',
            startDate: project.startDate_c || '',
            endDate: project.endDate_c || '',
            projectOwner: project.projectOwner_c?.Name || '',
            manager: project.manager_c?.Name || '',
            progress: project.progress_c || 0,
            phase: project.phase_c || 'Initiation',
            tags: project.Tags || '',
            createdAt: project.createdAt_c || project.CreatedOn,
            updatedAt: project.updatedAt_c || project.ModifiedOn
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating project:", error?.response?.data?.message);
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
          console.error(`Failed to delete project ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        toast.success('Project deleted successfully!');
        return true;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting project:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }
}

export const projectService = new ProjectService();