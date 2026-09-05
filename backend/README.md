# VOYAGO Backend - Spring Boot REST API

This is the backend service for VOYAGO travel management platform built with Spring Boot 3.2.3 and MongoDB.

## 🏗️ Architecture

The backend follows a layered architecture:

```
Controller Layer → Service Layer → Repository Layer → MongoDB
```

### Key Components

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Data access layer using Spring Data MongoDB
- **Models**: MongoDB document entities
- **DTOs**: Data Transfer Objects for API requests/responses
- **Security**: JWT-based authentication and authorization

## 🔧 Configuration

### Application Properties

Located at `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/voyago
spring.data.mongodb.database=voyago

# JWT Configuration
app.jwt.secret=VoyagoSuperSecretKey2026XYZ!@#$%^&*PlatformAdminJwtToken
app.jwt.expiration-ms=86400000  # 24 hours

# CORS Configuration
app.cors.allowed-origins=http://localhost:5173,http://localhost:3000
```

### Environment Variables

You can override properties using environment variables:

```powershell
$env:SPRING_DATA_MONGODB_URI="mongodb://your-host:27017/voyago"
$env:JWT_SECRET="your-super-secret-key"
```

## 📦 Dependencies

Key dependencies defined in `pom.xml`:

- **Spring Boot Starter Web** - REST API support
- **Spring Boot Starter Data MongoDB** - MongoDB integration
- **Spring Boot Starter Security** - Authentication and authorization
- **JJWT** (0.11.5) - JWT token generation and validation
- **Lombok** - Reduce boilerplate code
- **Spring Boot Starter Validation** - Request validation

## 🚀 Running the Backend

### Using Maven
```powershell
mvn spring-boot:run
```

### Using Packaged JAR
```powershell
mvn clean package
java -jar target/voyago-backend-1.0.0.jar
```

### Development Mode with Auto-Reload
```powershell
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"
```

## 🗄️ Database Schema

### Collections

#### users
- `_id`: ObjectId
- `name`: String
- `email`: String (unique)
- `passwordHash`: String
- `role`: String (CUSTOMER, HOTEL_PARTNER, VEHICLE_PARTNER, ADMIN)
- `phone`: String
- `avatar`: String
- `partnerBusinessName`: String (for partners)
- `partnerStatus`: String (PENDING, APPROVED, REJECTED, SUSPENDED)
- `isActive`: Boolean
- `createdAt`: LocalDateTime

#### destinations
- `_id`: ObjectId
- `name`: String
- `country`: String
- `tagline`: String
- `description`: String
- `imageUrl`: String
- `isTrending`: Boolean
- `idealDays`: Integer
- `averageBudget`: Double
- `highlights`: List<String>

#### hotels
- `_id`: ObjectId
- `name`: String
- `destinationId`: String
- `rating`: Double
- `address`: String
- `description`: String
- `heroImage`: String
- `gallery`: List<String>
- `amenities`: List<String>
- `partnerId`: String
- `rooms`: List<HotelRoom>
- `status`: String

#### vehicles
- `_id`: ObjectId
- `name`: String
- `type`: String (CAR, BIKE, SCOOTER)
- `destinationId`: String
- `dailyRate`: Double
- `transmission`: String
- `seats`: Integer
- `fuelType`: String
- `rating`: Double
- `partnerId`: String
- `isAvailable`: Boolean

#### bookings
- `_id`: ObjectId (converted to VOY-YYYY-XXXXX format)
- `userId`: String
- `customerName`: String
- `customerEmail`: String
- `destination`: String
- `departureDate`: String
- `returnDate`: String
- `travelersCount`: Integer
- `transport`: TravelOption
- `hotel`: BookedHotel
- `vehicle`: BookedVehicle
- `payment`: PaymentDetails
- `totalCost`: Double
- `status`: String (CONFIRMED, COMPLETED, CANCELLED)
- `createdAt`: LocalDateTime

## 🔐 Security

### JWT Authentication Flow

1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server validates credentials and generates JWT token
3. Client stores token and includes it in subsequent requests
4. `JwtAuthenticationFilter` validates token on each request
5. `SecurityConfig` enforces role-based access control

### Password Security

- Passwords are hashed using BCrypt (strength: 10)
- Plain text passwords are never stored
- Password validation on registration

### Role-Based Access Control

- **Public**: Destinations, Hotels, Vehicles (GET requests)
- **Authenticated**: Bookings, User profile
- **ADMIN**: User management, Analytics, Platform settings
- **HOTEL_PARTNER**: Hotel management
- **VEHICLE_PARTNER**: Vehicle management

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "CUSTOMER",
  "phone": "1234567890"
}

Response: 200 OK
{
  "token": "eyJhbGc...",
  "tokenType": "Bearer",
  "userId": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "token": "eyJhbGc...",
  "tokenType": "Bearer",
  "userId": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer eyJhbGc...

Response: 200 OK
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER",
  "phone": "1234567890",
  "isActive": true,
  "createdAt": "2026-09-05T10:30:00"
}
```

### Booking Endpoints

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "1234567890",
  "destination": "Goa",
  "departureDate": "2026-12-20",
  "returnDate": "2026-12-25",
  "travelersCount": 2,
  "durationDays": 5,
  "transportId": "65a1b2c3d4e5f6789",
  "selectedSeats": ["2A", "2B"],
  "hotelId": "65a1b2c3d4e5f6790",
  "roomId": "65a1b2c3d4e5f6791",
  "vehicleId": "65a1b2c3d4e5f6792",
  "placeIds": ["65a1b2c3d4e5f6793"],
  "paymentMethod": "UPI"
}

Response: 200 OK
{
  "id": "VOY-2026-89412",
  "userId": "507f1f77bcf86cd799439011",
  ...
  "status": "CONFIRMED"
}
```

## 🌱 Data Seeding

The application automatically seeds initial data on startup via `DataSeeder.java`:

- **Admin User**: `admin@voyago.com` / `admin123`
- **Sample Destinations**: Goa, Kerala, Manali, etc.
- **Sample Hotels**: Multiple hotels per destination
- **Sample Vehicles**: Cars, bikes, scooters
- **Sample Transport Options**: Flights, trains, buses

## 🧪 Testing

### Manual Testing with cURL

```powershell
# Test health
curl http://localhost:8080/api/destinations

# Test authentication
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@voyago.com","password":"admin123"}'

# Test authenticated endpoint
curl http://localhost:8080/api/users/me `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Common Issues

### Issue: MongoDB Connection Failed
**Error**: `MongoSocketOpenException: Exception opening socket`

**Solution**: 
1. Ensure MongoDB is running: `net start MongoDB` or `mongod`
2. Check connection string in `application.properties`

### Issue: Port 8080 Already in Use
**Error**: `Web server failed to start. Port 8080 was already in use`

**Solution**:
1. Stop process using port 8080
2. Or change port in `application.properties`: `server.port=8081`

### Issue: JWT Token Invalid
**Error**: `401 Unauthorized`

**Solution**:
1. Ensure token is in header: `Authorization: Bearer {token}`
2. Check token expiration (24 hours by default)
3. Verify JWT secret matches between environments

## 📈 Performance Tips

1. **Connection Pooling**: MongoDB connection pool is managed by Spring
2. **Caching**: Consider adding Spring Cache for frequently accessed data
3. **Indexing**: Add MongoDB indexes on frequently queried fields
4. **Pagination**: Implement pagination for large datasets

## 🔄 Future Enhancements

- [ ] Add Redis caching layer
- [ ] Implement real-time notifications with WebSocket
- [ ] Add pagination for all list endpoints
- [ ] Implement rate limiting
- [ ] Add Swagger/OpenAPI documentation
- [ ] Add unit and integration tests
- [ ] Implement email notifications
- [ ] Add file upload support for images

## 📞 Support

For backend-specific issues, check the logs:
```powershell
# View logs in real-time
mvn spring-boot:run | Tee-Object -FilePath backend.log
```

---

**Built with ❤️ using Spring Boot**
