export interface Teacher {
  email: string;
  id: number;
  name: string;
}

export interface TeacherDetails extends Teacher {
  classCount: number;
  studentCount: number;
}
