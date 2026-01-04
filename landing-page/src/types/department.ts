// Department and Class types
export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  isActive: boolean;
  adminId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Class {
  id: number;
  name: string;
  year: number;
  semester: number;
  section?: string;
  departmentId: number;
  departmentName?: string;
  capacity?: number;
  currentStrength?: number;
  isActive: boolean;
  adminId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
}

export interface CreateClassRequest {
  name: string;
  year: number;
  semester: number;
  section?: string;
  departmentId: number;
  capacity?: number;
}
