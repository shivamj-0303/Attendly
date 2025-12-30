# Attendly - Smart Attendance & Timetable Management System

A comprehensive attendance and timetable management solution designed for educational institutions. Built with Spring Boot backend, React web dashboard, and React Native mobile application.

## 📋 Overview

Attendly streamlines academic administration by providing:
- **Attendance Tracking**: Mark and monitor student attendance efficiently
- **Timetable Management**: Create and manage class schedules with conflict detection
- **Multi-Role Access**: Separate interfaces for administrators, teachers, and students
- **Mobile-First Design**: Native mobile app for students to view schedules and attendance
- **Real-Time Updates**: Instant synchronization across web and mobile platforms

## 🏗️ Architecture

### Tech Stack

**Backend**
- Java 17
- Spring Boot 3.x
- Spring Security with JWT authentication
- JPA/Hibernate for ORM
- MySQL database
- Maven for dependency management

**Web Dashboard (Admin Panel)**
- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- React Query for data fetching
- Tailwind CSS for styling
- Axios for API communication

**Mobile Application**
- React Native with Expo SDK 51
- React Navigation for routing
- AsyncStorage for local data
- Expo EAS Build for APK generation

## 🚀 Features

### Admin Dashboard
- **Department Management**: Create and organize academic departments
- **Class Management**: Set up classes with semester and year information
- **Teacher Management**: Add and manage teaching staff
- **Student Management**: Enroll students and assign to classes
- **Timetable Editor**: Google Calendar-style interface for schedule creation
  - Drag-and-click interface
  - Time conflict detection
  - Visual weekly grid view
  - Subject, teacher, and room assignment

### Mobile Student App
- **Daily Schedule**: View today's classes with timeline
- **Weekly Timetable**: Browse full week schedule
- **Attendance Status**: Track attendance history
- **Profile Management**: View student details and class information
- **Offline Support**: Cache data for offline viewing

### Teacher Features (Coming Soon)
- Mark attendance for classes
- View teaching schedule
- Generate attendance reports

## 📁 Project Structure

```
Attendly/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/attendly/
│   │   │   │   ├── config/         # Security, CORS, JWT config
│   │   │   │   ├── controller/     # REST API endpoints
│   │   │   │   ├── dto/            # Data Transfer Objects
│   │   │   │   ├── entity/         # JPA entities
│   │   │   │   ├── repository/     # Database repositories
│   │   │   │   ├── security/       # JWT & authentication
│   │   │   │   ├── service/        # Business logic
│   │   │   │   └── exception/      # Custom exceptions
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── landing-page/               # React web dashboard
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── store/              # Zustand state management
│   │   ├── lib/                # API client & utilities
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── mobile-app/                 # React Native mobile app
│   ├── src/
│   │   ├── screens/            # Screen components
│   │   ├── context/            # React Context (Auth)
│   │   ├── services/           # API services
│   │   └── config/             # Configuration
│   ├── app.json
│   ├── package.json
│   └── eas.json
│
└── README.md
```

## 🛠️ Local Development Setup

### Prerequisites

- **Java Development Kit (JDK) 17+**
- **Node.js 18+ and npm**
- **MySQL 8.0+**
- **Maven 3.8+**
- **Git**

For mobile development:
- **Expo CLI**: `npm install -g expo-cli`
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator)

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE attendly;

# Create user (optional but recommended)
CREATE USER 'attendly_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON attendly.* TO 'attendly_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Configure database connection
# Edit src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/attendly
spring.datasource.username=attendly_user
spring.datasource.password=your_password

# Install dependencies and run
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

**Default Admin Account** (Auto-created on first run):
- Email: `admin@attendly.com`
- Password: `admin123`

### 3. Web Dashboard Setup

```bash
# Navigate to landing-page directory
cd landing-page

# Install dependencies
npm install

# Create environment file
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:8080/api
EOF

# Start development server
npm run dev
```

The web dashboard will be available at `http://localhost:5173`

### 4. Mobile App Setup

```bash
# Navigate to mobile-app directory
cd mobile-app

# Install dependencies
npm install

# Start development server
npx expo start

# Options:
# Press 'a' for Android emulator
# Press 'i' for iOS simulator
# Scan QR code with Expo Go app on physical device
```

**Configure API URL for Mobile App:**

For local testing on physical device, update the fallback URL in `mobile-app/src/config/api.config.ts`:
```typescript
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://YOUR_LOCAL_IP:8080/api';
// Example: 'http://192.168.1.100:8080/api'
```

Find your local IP:
- **Windows**: `ipconfig` (Look for IPv4 Address)
- **Mac/Linux**: `ifconfig` or `ip addr show`

## 📱 Building APK

### Development Build

```bash
cd mobile-app

# Build for Android
npx eas build --platform android --profile development --local

# The APK will be in the build output directory
```

### Production Build

```bash
# Production build (requires EAS account)
npx eas build --platform android --profile production
```

## 🔐 API Authentication

All API endpoints (except `/auth/**`) require JWT authentication.

**Login Flow:**
1. POST `/auth/login` with credentials
2. Receive JWT token in response
3. Include token in subsequent requests: `Authorization: Bearer <token>`

**Token Expiration:** 24 hours

## 📚 API Documentation

### Admin Endpoints

**Authentication**
- `POST /auth/signup` - Register new admin
- `POST /auth/login` - Admin login

**Departments**
- `GET /admin/departments` - List all departments
- `POST /admin/departments` - Create department
- `PUT /admin/departments/{id}` - Update department
- `DELETE /admin/departments/{id}` - Delete department

**Classes**
- `GET /admin/classes` - List all classes
- `GET /admin/classes/department/{id}` - Get classes by department
- `POST /admin/classes` - Create class
- `PUT /admin/classes/{id}` - Update class
- `DELETE /admin/classes/{id}` - Delete class

**Teachers**
- `GET /admin/teachers` - List all teachers
- `POST /admin/teachers` - Create teacher
- `PUT /admin/teachers/{id}` - Update teacher
- `DELETE /admin/teachers/{id}` - Delete teacher

**Students**
- `GET /admin/students` - List all students
- `GET /admin/students/class/{id}` - Get students by class
- `POST /admin/students` - Create student
- `PUT /admin/students/{id}` - Update student
- `DELETE /admin/students/{id}` - Delete student

**Timetable**
- `GET /admin/timetable/class/{classId}` - Get class timetable
- `GET /admin/timetable/class/{classId}/day/{day}` - Get day-specific timetable
- `POST /admin/timetable` - Create timetable slot
- `PUT /admin/timetable/{id}` - Update timetable slot
- `DELETE /admin/timetable/{id}` - Delete timetable slot

**Attendance**
- `POST /admin/attendance/mark` - Mark single attendance
- `POST /admin/attendance/mark/bulk` - Mark bulk attendance
- `GET /admin/attendance/student/{id}` - Get student attendance
- `GET /admin/attendance/slot/{id}` - Get slot attendance

### Student Endpoints

**Authentication**
- `POST /auth/user/login` - Student/Teacher login

**Timetable**
- `GET /student/timetable` - Get weekly timetable
- `GET /student/timetable?date=YYYY-MM-DD` - Get timetable for specific day

**Attendance**
- `GET /student/attendance/today` - Get today's attendance
- `GET /student/attendance` - Get attendance history

## 🎨 User Guide

### Admin: Creating a Timetable

1. **Login** to admin dashboard
2. **Navigate** to Departments → Select Department → Select Class
3. **Click** on the Calendar icon on the class card
4. **Click** any time slot on the timetable grid
5. **Fill** in the form:
   - Subject name
   - Select teacher
   - Day is pre-filled (locked)
   - Select start and end times
   - Optional: room number and notes
6. **Save** - The slot will appear spanning the selected time range
7. **Edit** - Click on any filled slot to modify
8. **Delete** - Use the delete button in the edit modal

### Student: Viewing Schedule

1. **Login** to mobile app
2. **Today Tab**: View today's classes with time and teacher
3. **Week Tab**: 
   - Select day from Mon-Sat
   - View full day schedule
4. **Profile**: View your details, department, and class info

## 🔧 Configuration

### Backend Configuration

`backend/src/main/resources/application.properties`:

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/attendly
spring.datasource.username=your_username
spring.datasource.password=your_password

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT
jwt.secret=your-secret-key-min-256-bits
jwt.expiration=86400000

# CORS
cors.allowed-origins=http://localhost:5173,http://localhost:8081
```

### Environment Variables

**Backend:**
- `JWT_SECRET` - Secret key for JWT signing
- `DB_URL` - Database connection URL
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password

**Web Dashboard:**
- `VITE_API_BASE_URL` - Backend API URL

**Mobile App:**
- `EXPO_PUBLIC_API_URL` - Backend API URL for mobile

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Web Dashboard Tests
```bash
cd landing-page
npm run test
```

### Linting
```bash
cd landing-page
npm run lint
```

## 🚢 Deployment

### Backend Deployment (Production)

**Prepare for deployment:**
```bash
cd backend
mvn clean package -DskipTests
```

The JAR file will be in `target/attendly-backend-1.0.0.jar`

**Run in production:**
```bash
java -jar target/attendly-backend-1.0.0.jar \
  --spring.datasource.url=jdbc:mysql://production-db:3306/attendly \
  --spring.datasource.username=prod_user \
  --spring.datasource.password=prod_password \
  --jwt.secret=your-production-secret-key
```

**Docker Deployment:**
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/attendly-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Web Dashboard Deployment

```bash
cd landing-page

# Build for production
npm run build

# Deploy the 'dist' folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Any static hosting service
```

**Environment Variables for Production:**
- Set `VITE_API_BASE_URL` to production backend URL

### Mobile App Deployment

**Build APK:**
```bash
cd mobile-app

# Update app.json with version info
# Update eas.json with production API URL

# Build
npx eas build --platform android --profile production

# Submit to Play Store
npx eas submit -p android
```

## 🔒 Security Best Practices

1. **Change default admin credentials** immediately after first login
2. **Use strong JWT secret** (minimum 256 bits)
3. **Enable HTTPS** in production
4. **Regular database backups**
5. **Keep dependencies updated**: `npm audit fix` and `mvn versions:display-dependency-updates`
6. **Use environment variables** for sensitive configuration
7. **Implement rate limiting** on authentication endpoints
8. **Regular security audits**

## 🐛 Troubleshooting

### Backend won't start
- **Check**: MySQL is running and database exists
- **Check**: Port 8080 is not in use
- **Check**: Java 17+ is installed: `java -version`
- **Check**: Database credentials in `application.properties`

### Web dashboard API errors
- **Check**: Backend is running on correct port
- **Check**: `.env.local` has correct API URL
- **Check**: CORS is configured correctly in backend
- **Clear browser cache** and retry

### Mobile app 401 errors
- **Check**: API URL is correct in `api.config.ts`
- **Check**: Device/emulator can reach backend (use local IP, not localhost)
- **Check**: JWT token is valid (login again)
- **Clear app data** in Expo Go

### Timetable not showing
- **Check**: Student is enrolled in a class
- **Check**: Timetable slots are created for the class
- **Check**: Slots have `isActive=true`
- **Check**: Network requests in browser/app dev tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Coding Standards:**
- Backend: Follow Java naming conventions, use Lombok
- Frontend: ESLint rules, TypeScript strict mode
- Mobile: React Native best practices
- Write tests for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Lead Developer**: [Your Name]
- **Backend**: Spring Boot, MySQL
- **Frontend**: React, TypeScript
- **Mobile**: React Native, Expo

## 📞 Support

For issues and questions:
- **GitHub Issues**: [Create an issue](https://github.com/shivamj-0303/Attendly/issues)
- **Email**: support@attendly.com
- **Documentation**: [Wiki](https://github.com/shivamj-0303/Attendly/wiki)

## 🗺️ Roadmap

- [x] Multi-role authentication (Admin, Teacher, Student)
- [x] Department, Class, Teacher, Student management
- [x] Timetable management with conflict detection
- [x] Student mobile app with timetable view
- [ ] Attendance marking by teachers
- [ ] Attendance reports and analytics
- [ ] Push notifications for schedule changes
- [ ] Export attendance as PDF/Excel
- [ ] Teacher mobile app
- [ ] Parent portal
- [ ] Leave management system
- [ ] Integration with LMS platforms

## 📊 Database Schema

```
Admin
├── Departments
│   ├── Teachers
│   └── Classes
│       └── Students
│
Timetable
├── TimetableSlot (belongs to Class)
└── Attendance (links Student to TimetableSlot)
```

## 🎯 Performance Tips

- **Backend**: Enable JPA query caching for frequently accessed data
- **Database**: Add indexes on frequently queried columns (email, roll_number)
- **Frontend**: Use React Query caching to minimize API calls
- **Mobile**: Implement pagination for large student lists

---

**Made with ❤️ for educational institutions**

*Version: 1.0.0*
