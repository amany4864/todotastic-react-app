import axios from "axios";

const API_BASE_URL = 'https://aitodo.onrender.com';

export interface ChatMessage {
  role: string;
  content: string;
}

export interface TaskData {
  title: string;
  scheduled_for: string;
  expected_time_minutes: number;
  status: string;
}

export interface StructuredPlan {
  user_id: string;
  tasks: TaskData[];
}

export const aiService = {
  async chatPlan(userId: string, messages: ChatMessage[]): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/ai/chat-plan`, {
      user_id: userId,
      messages
    });
    return response.data;
  },

  async saveStructuredPlan(plan: StructuredPlan): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/ai/save-structured-plan`, plan);
    return response.data.message;
  },

  async getPlans(userId: string): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/ai/plans/${userId}`);
    return response.data;
  }
};

// Keep backwards compatibility
export async function getAIPlan(prompt: string): Promise<string> {
  const res = await axios.post("/plan", { prompt });
  return res.data.plan;
}
