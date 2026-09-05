# VOYAGO - Smart Trip Planner and Travel Management System

A comprehensive travel booking platform built with **React (TypeScript)** frontend and **Spring Boot + MongoDB** backend. VOYAGO enables users to plan trips, book hotels, rent vehicles, and explore tourist destinations with an intelligent trip planning system.

## 🚀 Features

### Customer Features
- 🔐 User authentication with JWT
- 🌍 Browse trending destinations
- 🎯 Smart trip planner with budget categories
- ✈️ Book flights, trains, and buses with seat selection
- 🏨 Hotel booking with room selection
- 🚗 Vehicle rental (cars, bikes, scooters)
- 📍 Explore tourist places and attractions
- 📋 View and manage bookings
- 💳 Multiple payment methods (UPI, Card, Net Banking)

### Partner Features
- 🏢 Hotel partner dashboard
- 🚙 Vehicle partner dashboard
- 📊 Revenue and booking analytics
- 🛎️ Manage inventory (rooms/vehicles)

### Admin Features
- 👥 User management
- 📈 Platform analytics and GMV tracking
- 🔍 Audit logs
- ⚙️ Platform settings
- ✅ Partner approval workflow

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Recharts** for analytics visualization
- **Lucide React** for icons
- **Motion** for animations

### Backend
- **Spring Boot 3.2.3** (Java 17)
- **Spring Security** with JWT authentication
- **Spring Data MongoDB**
- **Lombok** for reducing boilerplate
- **Maven** for dependency management

### Database
- **MongoDB** for data storage

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Java 17** - [Download](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
3. **Maven** (v3.8+) - [Download](https://maven.apache.org/download.cgi)
4. **MongoDB** (v6.0+) - [Download](https://www.mongodb.com/try/download/community)
5. **npm** or **bun** package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
cd "c:\Users\MANISH\Desktop\sem5 pro"
```

### 2. Setup MongoDB
Start MongoDB service:
```powershell
# Option 1: Start as Windows service
net start MongoDB

# Option 2: Run mongod directly
mongod
```

MongoDB will run on `mongodb://localhost:27017/voyago`

### 3. Configure Environment Variables

The `.env` file has already been created with the following configuration:
```env
VITE_API_URL=http://localhost:8080/api
```

### 4. Install Frontend Dependencies
```powershell
npm install
```

### 5. Install Backend Dependencies
Backend dependencies will be automatically downloaded by Maven when you first run the application.

## 🎯 Running the Application

### Option 1: Run Everything Together (Recommended)
```powershell
.\start-dev.ps1
```
This will open two PowerShell windows:
- Backend (Spring Boot) on `http://localhost:8080`
- Frontend (React + Vite) on `http://localhost:3000`

### Option 2: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```powershell
.\start-backend.ps1
```

**Terminal 2 - Frontend:**
```powershell
.\start-frontend.ps1
```

### Manual Start (Alternative)

**Backend:**
```powershell
cd backend
mvn spring-boot:run
```

**Frontend:**
```powershell
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **MongoDB**: mongodb://localhost:27017/voyago

## 📁 Project Structure

```
voyago/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/voyago/
│   │       │   ├── config/        # Security, CORS, Data seeding
│   │       │   ├── controller/    # REST API endpoints
│   │       │   ├── dto/           # Data Transfer Objects
│   │       │   ├── model/         # MongoDB entities
│   │       │   ├── repository/    # MongoDB repositories
│   │       │   ├── security/      # JWT authentication
│   │       │   └── service/       # Business logic
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml                # Maven dependencies
│
├── src/                       # React frontend
│   ├── components/           # React components
│   ├── context/              # React Context (Auth, etc.)
│   ├── services/             # API service layers
│   ├── types.ts              # TypeScript type definitions
│   └── utils/                # Utility functions
│
├── .env                      # Environment variables
├── start-dev.ps1            # Start both backend & frontend
├── start-backend.ps1        # Start backend only
├── start-frontend.ps1       # Start frontend only
└── README.md                # This file
```

## 🔑 Default Admin Credentials

The application seeds a default admin user on first startup:

- **Email**: `admin@voyago.com`
- **Password**: `admin123`

You can create additional users through the registration page.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Destinations
- `GET /api/destinations` - Get all destinations
- `GET /api/destinations/{id}` - Get destination by ID
- `GET /api/destinations/trending` - Get trending destinations

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/{id}` - Get hotel by ID
- `GET /api/hotels/destination/{destinationId}` - Hotels by destination

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/{id}` - Get vehicle by ID
- `GET /api/vehicles/destination/{destinationId}` - Vehicles by destination

### Transport
- `GET /api/transport` - Get all travel options
- `GET /api/transport/search?from={city}&to={city}&mode={mode}` - Search transport

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user/{userId}` - Get user bookings
- `GET /api/bookings/{id}` - Get booking by ID
- `PATCH /api/bookings/{id}/cancel` - Cancel booking

### Admin (Requires ADMIN role)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get platform analytics
- `PATCH /api/admin/users/{id}/status` - Toggle user status

## 🧪 Testing the Connection

Once both servers are running, test the connection:

1. Open browser to `http://localhost:3000`
2. Try registering a new user
3. Login with the credentials
4. Browse destinations and create a trip

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running with `net start MongoDB` or `mongod`

### Port Already in Use
```
Error: Port 8080 is already in use
```
**Solution**: Stop the process using port 8080 or change the port in `application.properties`

### CORS Errors
**Solution**: The backend is configured to allow `http://localhost:3000` and `http://localhost:5173`. If you use a different port, update `application.properties`:
```properties
app.cors.allowed-origins=http://localhost:YOUR_PORT
```

### JWT Token Issues
**Solution**: Clear browser localStorage and login again:
```javascript
localStorage.clear()
```

## 📦 Build for Production

### Frontend
```powershell
npm run build
```
Output will be in the `dist/` folder.

### Backend
```powershell
cd backend
mvn clean package
```
The JAR file will be in `backend/target/voyago-backend-1.0.0.jar`

Run the JAR:
```powershell
java -jar backend/target/voyago-backend-1.0.0.jar
```

## 🔐 Security Notes

- JWT secret key is configured in `application.properties` - change it for production
- Passwords are hashed using BCrypt
- CORS is enabled for development - restrict origins in production
- Use HTTPS in production environments

## 📝 License

This project is for educational purposes.

## 👥 Contributors

Built as a semester project for smart trip planning and travel management.

## 🤝 Support

For issues or questions, please create an issue in the repository.

---

**Happy Traveling with VOYAGO! ✈️🌍**
