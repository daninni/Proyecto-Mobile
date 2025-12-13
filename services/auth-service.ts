import { API_URL } from "@/constants/config";
import axios, { isAxiosError } from "axios";

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    data: {
        token: string;
    };
}

export type RegisterPayload = LoginPayload;
export type RegisterResponse = LoginResponse;

const client = axios.create({
    baseURL: `${API_URL}/auth`,
});

async function login(payload: LoginPayload): Promise<LoginResponse> {
    try {
        console.log('LOGIN REQUEST:', payload);
        const response = await client.post<LoginResponse>("/login", payload);
        console.log('LOGIN RESPONSE:', response.data);
        return response.data;
    } catch (error) {
        console.log('LOGIN ERROR:', error);
        if (isAxiosError(error) && error.response) {
            console.log('API Error Status:', error.response.status);
            console.log('API Error Data:', error.response.data);
            if (error.response.status === 401) {
                throw new Error("Credenciales inválidas.");
            }
        }
        throw new Error("Error al conectar con el servidor.");
    }
}

async function register(payload: RegisterPayload): Promise<RegisterResponse> {
    try {
        console.log('REGISTER REQUEST:', payload);
        const response = await client.post<RegisterResponse>("/register", payload);
        console.log('REGISTER RESPONSE:', response.data);
        return response.data;
    } catch (error) {
        console.log('REGISTER ERROR:', error);
        if (isAxiosError(error) && error.response) {
            console.log('API Error Status:', error.response.status);
            console.log('API Error Data:', error.response.data);
            if (error.response.status === 409) {
                throw new Error("El email ya está en uso.");
            }
        }
        throw new Error("Error al conectar con el servidor.");
    }
}

export const authService = {
    login,
    register,
};
