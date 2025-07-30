import { toast } from 'react-toastify';

class CommentService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'comment_c';
  }

  async getAll(taskId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "text_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "taskId_c" } }
        ],
        where: taskId ? [
          {
            FieldName: "taskId_c",
            Operator: "EqualTo",
            Values: [taskId.toString()]
          }
        ] : [],
        orderBy: [
          {
            fieldName: "timestamp_c",
            sorttype: "DESC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data?.map(comment => ({
        Id: comment.Id,
        name: comment.Name || '',
        tags: comment.Tags || '',
        owner: comment.Owner || null,
        createdOn: comment.CreatedOn,
        createdBy: comment.CreatedBy || null,
        modifiedOn: comment.ModifiedOn,
        modifiedBy: comment.ModifiedBy || null,
        text: comment.text_c || '',
        timestamp: comment.timestamp_c || comment.CreatedOn,
        taskId: comment.taskId_c || null
      })) || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching comments:", error?.response?.data?.message);
      } else {
        console.error("Error fetching comments:", error.message);
      }
      throw error;
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
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "text_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "taskId_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        return null;
      }

      const comment = response.data;
      return {
        Id: comment.Id,
        name: comment.Name || '',
        tags: comment.Tags || '',
        owner: comment.Owner || null,
        createdOn: comment.CreatedOn,
        createdBy: comment.CreatedBy || null,
        modifiedOn: comment.ModifiedOn,
        modifiedBy: comment.ModifiedBy || null,
        text: comment.text_c || '',
        timestamp: comment.timestamp_c || comment.CreatedOn,
        taskId: comment.taskId_c || null
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching comment with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching comment with ID ${id}:`, error.message);
      }
      throw error;
    }
  }

  async create(commentData) {
    try {
      const params = {
        records: [
          {
            text_c: commentData.text || '',
            timestamp_c: new Date().toISOString(),
            taskId_c: commentData.taskId ? commentData.taskId.toString() : null
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
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create comment ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          toast.success('Comment added successfully');
          return successfulRecords[0].data;
        }
      }

      throw new Error('Failed to create comment');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating comment:", error?.response?.data?.message);
      } else {
        console.error("Error creating comment:", error.message);
      }
      throw error;
    }
  }

  async update(id, commentData) {
    try {
      const params = {
        records: [
          {
            Id: id,
            text_c: commentData.text || '',
            timestamp_c: commentData.timestamp || new Date().toISOString()
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
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update comment ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          toast.success('Comment updated successfully');
          return successfulUpdates[0].data;
        }
      }

      throw new Error('Failed to update comment');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating comment:", error?.response?.data?.message);
      } else {
        console.error("Error updating comment:", error.message);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete comment ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulDeletions.length > 0) {
          toast.success('Comment deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting comment:", error?.response?.data?.message);
      } else {
        console.error("Error deleting comment:", error.message);
      }
      throw error;
    }
  }
}

export const commentService = new CommentService();