export interface Employee {
  id: string;
  email: string;
  name: string;
  role: 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN';
  mustChangePassword: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  oldPassword?: string;
  newPassword: string;
}
