import axios from "axios";

export async function fetchAdmissionAnalytics() {
  const { data } = await axios.get("/api/v1/analytics/admissions");
  return data;
}
