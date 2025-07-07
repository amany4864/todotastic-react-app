
import axios from 'axios';

export interface Todo {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  due_date?: string;
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  due_date?: string;
  completed?: boolean;
}

const API_BASE_URL = 'https://your-backend-url.com'; // Replace with your actual backend URL

export const todoService = {
  async getTodos(): Promise<Todo[]> {
    const response = await axios.get(`${API_BASE_URL}/todos`);
    return response.data;
  },

  async createTodo(data: CreateTodoData): Promise<Todo> {
    const response = await axios.post(`${API_BASE_URL}/addtodo`, data);
    return response.data;
  },

  async updateTodo(id: number, data: UpdateTodoData): Promise<Todo> {
    const response = await axios.put(`${API_BASE_URL}/todos/${id}`, data);
    return response.data;
  },

  async deleteTodo(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/todos/${id}`);
  }
};
