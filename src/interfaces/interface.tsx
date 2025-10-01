export interface LoginParams {
  email: string;
  contraseña: string;
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}
