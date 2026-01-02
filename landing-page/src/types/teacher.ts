// Teacher types
export interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  departmentId: number;
  departmentName?: string;
  isActive: boolean;
  adminId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeacherRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  departmentId: number;
}

export interface UpdateTeacherRequest {
  name?: string;
  email?: string;
  phone?: string;
  departmentId?: number;
  isActive?: boolean;
}
