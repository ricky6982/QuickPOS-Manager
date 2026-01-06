/**
 * Interface para la respuesta de login
 */
export interface LoginResponse {
  token?: string;
  accessToken?: string;
  user?: {
    id: string | number;
    username: string;
    email?: string;
    name?: string;
  };
  message?: string;
  success?: boolean;
}
