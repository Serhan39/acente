import { apiClient } from "./client";
import { DashboardSummary } from "../types/models";

export function getDashboardSummary(months = 6) {
  return apiClient.get<DashboardSummary>("/dashboard/summary", { params: { months } }).then((r) => r.data);
}
