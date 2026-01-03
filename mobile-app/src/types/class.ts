export interface Class {
  id: number;
  name: string;
  teacherId: number;
  teacherName: string;
}

export interface ClassStudent {
  id: number;
  name: string;
  studentId: number;
}

export interface ClassWithStudents extends Class {
  students: ClassStudent[];
}
