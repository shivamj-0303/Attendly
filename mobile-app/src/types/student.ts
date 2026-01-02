export interface Student {
  email: string;
  id: number;
  name: string;
}

export interface StudentDetails extends Student {
  attendancePercentage: number;
  classCount: number;
  presentCount: number;
}
