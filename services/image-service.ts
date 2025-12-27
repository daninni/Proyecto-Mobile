import { API_URL } from '@/constants/config';
import axios from 'axios';

interface ImageData {
  url: string;
  key: string;
  size: number;
  contentType: string;
}

interface ImageUploadResponse {
  success: boolean;
  data: ImageData;
}

function getImageUploadService({ token }: { token: string }) {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    uploadImage: async (formData: FormData): Promise<string> => {
      try {
        const response = await client.post<ImageUploadResponse>('/images', formData);
        return response.data.data.url;
      } catch (error) {
        throw new Error(`Error al subir la imagen: ${(error as Error).message}`);
      }
    },
  };
}

export const imageService = {
  getImageUploadService,
};
