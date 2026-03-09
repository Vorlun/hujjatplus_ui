/**
 * Central type re-exports for the application.
 * Domain types are defined in api/*; this file re-exports for convenience.
 */

export type { RequestStatus, RequestPriority, RequestListItem, CreateRequestBody } from "../api/requests";
export type { Department } from "../api/departments";
export type { DocumentItem } from "../api/documents";
export type { RegisterBody, RegisterResponse, LoginBody, LoginResponse } from "../api/auth";
export type { Role, AuthUser } from "../auth/AuthProvider";
