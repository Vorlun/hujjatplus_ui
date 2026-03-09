/**
 * Centralized API client. All backend requests should go through this module.
 * Actual implementation lives in services/apiClient to keep auth and fetch logic in one place.
 */
export {
  apiClient,
  ApiError,
  API_URL,
  setOnUnauthorized,
} from "../services/apiClient";
