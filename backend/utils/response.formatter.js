// src/utils/response.formatter.js
class ResponseFormatter {
  static success(message, data = null, pagination = null) {
    const response = {
      success: true,
      message: message || "Operation completed successfully",
    };

    if (data !== null) response.data = data;

    if (pagination !== null) {
      // If pagination object has current_page property, it's pagination metadata
      if (pagination.current_page !== undefined) {
        response.pagination = pagination;
      } else {
        // Otherwise, it's just total_record_count for non-paginated response
        response.total_record_count = pagination;
      }
    }

    return response;
  }

  static error(message, error = null) {
    const response = {
      success: false,
      error: message || "An error occurred",
    };

    if (error) response.error_details = error;
    return response;
  }

  // Dynamic message generators
  static messages = {
    // Create operations
    CREATE_SUCCESS: (resource) => `${resource} created successfully`,
    BULK_CREATE_SUCCESS: (resource, count) =>
      `${count} ${resource}(s) created successfully`,

    // Read operations
    FETCH_ALL_SUCCESS: (resource) => `${resource} list fetched successfully`,
    FETCH_ONE_SUCCESS: (resource) => `${resource} details fetched successfully`,
    SEARCH_SUCCESS: (resource) => `${resource} search completed successfully`,

    // Update operations
    UPDATE_SUCCESS: (resource) => `${resource} updated successfully`,
    BULK_UPDATE_SUCCESS: (resource, count) =>
      `${count} ${resource}(s) updated successfully`,

    // Delete operations
    DELETE_SUCCESS: (resource) => `${resource} deleted successfully`,
    SOFT_DELETE_SUCCESS: (resource) => `${resource} soft deleted successfully`,
    RESTORE_SUCCESS: (resource) => `${resource} restored successfully`,
    BULK_DELETE_SUCCESS: (resource, count) =>
      `${count} ${resource}(s) deleted successfully`,

    // Count operations
    COUNT_SUCCESS: (resource, count) => `${count} ${resource}(s) found`,

    // Export operations
    EXPORT_SUCCESS: (resource, count) =>
      `${count} ${resource}(s) exported successfully`,

    // Import operations
    IMPORT_SUCCESS: (resource, count) =>
      `${count} ${resource}(s) imported successfully`,

    // Status operations
    STATUS_CHANGE_SUCCESS: (resource) =>
      `${resource} status changed successfully`,

    // Auth operations
    LOGIN_SUCCESS: "Logged in successfully",
    LOGOUT_SUCCESS: "Logged out successfully",
    REGISTER_SUCCESS: "Registered successfully",
    PASSWORD_RESET_SUCCESS: "Password reset successfully",
    EMAIL_VERIFIED_SUCCESS: "Email verified successfully",

    // General operations
    ACTION_COMPLETED: (action, resource) =>
      `${resource} ${action} completed successfully`,
    SETTINGS_SAVED: "Settings saved successfully",
    PROFILE_UPDATED: "Profile updated successfully",
    PREFERENCES_SAVED: "Preferences saved successfully",
    NOTIFICATION_SENT: "Notification sent successfully",

    // Error messages
    VALIDATION_ERROR: "Validation failed. Please check your input",
    NOT_FOUND: (resource) => `${resource} not found`,
    ALREADY_EXISTS: (resource) => `${resource} already exists`,
    UNAUTHORIZED: "Unauthorized access. Please login",
    FORBIDDEN: "Access forbidden. You don't have permission",
    INVALID_CREDENTIALS: "Invalid email or password",
    TOKEN_EXPIRED: "Session expired. Please login again",
    SERVER_ERROR: "Internal server error. Please try again later",
    NETWORK_ERROR: "Network error. Please check your connection",
    DATABASE_ERROR: "Database error occurred",
    FILE_UPLOAD_ERROR: "File upload failed",
    FILE_SIZE_EXCEEDED: "File size exceeds limit",
    INVALID_FILE_TYPE: "Invalid file type",
    RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later",
    MAINTENANCE_MODE: "System is under maintenance. Please try again later",
  };

  // Helper method to get resource name in proper format
  static getResourceName(model) {
    if (!model || !model.modelName) return "Record";

    const name = model.modelName;
    // Convert from PascalCase to proper spaced words
    return name.replace(/([A-Z])/g, " $1").trim();
  }

  // Static success response methods for common operations
  static createSuccess(model, data) {
    const resource = this.getResourceName(model);
    return this.success(this.messages.CREATE_SUCCESS(resource), data);
  }

  static fetchAllSuccess(model, data, pagination = null) {
    const resource = this.getResourceName(model);
    return this.success(
      this.messages.FETCH_ALL_SUCCESS(resource),
      data,
      pagination
    );
  }

  static fetchOneSuccess(model, data) {
    const resource = this.getResourceName(model);
    return this.success(this.messages.FETCH_ONE_SUCCESS(resource), data);
  }

  static updateSuccess(model, data) {
    const resource = this.getResourceName(model);
    return this.success(this.messages.UPDATE_SUCCESS(resource), data);
  }

  static deleteSuccess(model, data = null) {
    const resource = this.getResourceName(model);
    return this.success(this.messages.DELETE_SUCCESS(resource), data);
  }

  static paginate(total, page = 1, limit = 20) {
    return {
      current_page: parseInt(page),
      limit: parseInt(limit),
      total_record_count: total,
      total_pages: Math.ceil(total / limit),
    };
  }

  // Batch operation helpers
  static getBatchMessage(resource, action, count) {
    const actions = {
      create: this.messages.BULK_CREATE_SUCCESS,
      update: this.messages.BULK_UPDATE_SUCCESS,
      delete: this.messages.BULK_DELETE_SUCCESS,
      import: this.messages.IMPORT_SUCCESS,
      export: this.messages.EXPORT_SUCCESS,
    };

    const messageFunc = actions[action] || this.messages.ACTION_COMPLETED;
    return typeof messageFunc === "function"
      ? messageFunc(resource, count)
      : `${action} completed for ${count} ${resource}(s)`;
  }
}

module.exports = ResponseFormatter;
