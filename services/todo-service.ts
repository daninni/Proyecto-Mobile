import { API_URL } from "@/constants/config";
import axios from "axios";

export interface Location {
    latitude: number;
    longitude: number;
}

export interface Todo {
    id: string;
    userId: string;
    title: string;
    completed: boolean;
    location?: Location;
    photoUri?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTodoPayload {
    title: string;
    completed?: boolean;
    location?: Location;
    photoUri?: string;
}

export interface UpdateTodoPayload {
    title?: string;
    completed?: boolean;
    location?: Location;
    photoUri?: string;
}

const createClient = (token: string) => {
    return axios.create({
        baseURL: `${API_URL}`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

async function getTodos(token: string): Promise<Todo[]> {
    try {
        const client = createClient(token);
        const response = await client.get<{ success: boolean; data: Todo[] }>("/todos");
        return response.data.data;
    } catch (error) {
        console.log("GET TODOS ERROR:", error);
        throw new Error("Error al cargar las tareas");
    }
}

async function createTodo(token: string, payload: CreateTodoPayload): Promise<Todo> {
    try {
        const client = createClient(token);
        const response = await client.post<{ success: boolean; data: Todo }>("/todos", payload);
        return response.data.data;
    } catch (error) {
        console.log("CREATE TODO ERROR:", error);
        throw new Error("Error al crear la tarea");
    }
}

async function updateTodo(token: string, id: string, payload: UpdateTodoPayload): Promise<Todo> {
    try {
        const client = createClient(token);
        const response = await client.patch<{ success: boolean; data: Todo }>(`/todos/${id}`, payload);
        return response.data.data;
    } catch (error) {
        console.log("UPDATE TODO ERROR:", error);
        throw new Error("Error al actualizar la tarea");
    }
}

async function deleteTodo(token: string, id: string): Promise<void> {
    try {
        const client = createClient(token);
        await client.delete(`/todos/${id}`);
    } catch (error) {
        console.log("DELETE TODO ERROR:", error);
        throw new Error("Error al eliminar la tarea");
    }
}

export const todoService = {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
};