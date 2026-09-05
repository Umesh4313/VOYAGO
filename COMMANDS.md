# VOYAGO - Useful Commands Reference

Quick reference for commonly used commands during development.

## 🚀 Starting the Application

### Start Everything (Recommended)
```powershell
.\start-dev.ps1
```

### Start Backend Only
```powershell
.\start-backend.ps1
# OR
cd backend
mvn spring-boot:run
```

### Start Frontend Only
```powershell
.\start-frontend.ps1
# OR
npm run dev
```

### Start MongoDB
```powershell
# As Windows service
net start MongoDB

# Manually
mongod

# Check if running
Get-Process mongod
```

## 🛑 Stopping Services

### Stop Backend/Frontend
- Press `Ctrl + C` in the PowerShell window
- Confirm with `Y`

### Stop MongoDB
```powershell
# Stop Windows service
net stop MongoDB

# Or kill process
Get-Process mongod | Stop-Process
```

## 📦 Dependency Management

### Frontend (npm)
```powershell
# Install dependencies
npm install

# Install specific package
npm install package-name

# Update dependencies
npm update

# Clean install
Remove-Item -Recurse -Force node_modules
npm install
```

### Backend (Maven)
```powershell
cd backend

# Download dependencies
mvn dependency:resolve

# Clean and rebuild
mvn clean install

# Skip tests
mvn clean install -DskipTests

# Update dependencies
mvn versions:use-latest-versions
```

## 🔨 Building

### Frontend Build
```powershell
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run lint
```

### Backend Build
```powershell
cd backend

# Compile
mvn compile

# Package as JAR
mvn package

# Clean and package
mvn clean package

# Run the JAR
java -jar target/voyago-backend-1.0.0.jar
```

## 🗄️ MongoDB Commands

### Connect to MongoDB
```powershell
# Using mongosh (new shell)
mongosh

# Using mongo (legacy shell)
mongo
```

### Database Operations
```javascript
// Switch to voyago database
use voyago

// Show all collections
show collections

// Count documents
db.users.countDocuments()
db.bookings.countDocuments()
db.destinations.countDocuments()

// View all users
db.users.find().pretty()

// Find admin user
db.users.findOne({ email: "admin@voyago.com" })

// View all bookings
db.bookings.find().pretty()

// View latest booking
db.bookings.find().sort({ createdAt: -1 }).limit(1).pretty()

// Count confirmed bookings
db.bookings.countDocuments({ status: "CONFIRMED" })

// View all destinations
db.destinations.find().pretty()

// Find trending destinations
db.destinations.find({ isTrending: true }).pretty()

// Drop a collection (CAREFUL!)
db.users.drop()

// Drop entire database (VERY CAREFUL!)
db.dropDatabase()

// Create index for performance
db.bookings.createIndex({ userId: 1 })
db.bookings.createIndex({ createdAt: -1 })

// View indexes
db.bookings.getIndexes()
```

### Backup and Restore
```powershell
# Backup database
mongodump --db voyago --out C:\backup

# Restore database
mongorestore --db voyago C:\backup\voyago

# Export collection to JSON
mongoexport --db voyago --collection users --out users.json --pretty

# Import collection from JSON
mongoimport --db voyago --collection users --file users.json
```

## 🧪 Testing

### Test Backend Endpoints with cURL
```powershell
# Test destinations (public)
curl http://localhost:8080/api/destinations

# Test login
$body = '{"email":"admin@voyago.com","password":"admin123"}'
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d $body

# Save token and test authenticated endpoint
$token = "YOUR_TOKEN_HERE"
curl http://localhost:8080/api/users/me `
  -H "Authorization: Bearer $token"

# Test booking creation
$bookingData = Get-Content booking.json
curl -X POST http://localhost:8080/api/bookings `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d $bookingData
```

### Test with Invoke-RestMethod (PowerShell)
```powershell
# Get destinations
Invoke-RestMethod -Uri "http://localhost:8080/api/destinations" -Method Get

# Login
$loginBody = @{
    email = "admin@voyago.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$token = $response.token

# Get user profile
$headers = @{
    Authorization = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:8080/api/users/me" `
    -Method Get `
    -Headers $headers
```

## 🔍 Debugging

### View Logs

**Backend Logs:**
```powershell
# Real-time logs (backend already running)
# Just watch the PowerShell window where backend is running

# Save logs to file
cd backend
mvn spring-boot:run | Tee-Object -FilePath backend.log
```

**Frontend Logs:**
- Open browser Developer Tools (F12)
- Go to Console tab

### Check Ports in Use
```powershell
# Check if port 8080 is in use (backend)
netstat -ano | findstr :8080

# Check if port 3000 is in use (frontend)
netstat -ano | findstr :3000

# Check if port 27017 is in use (MongoDB)
netstat -ano | findstr :27017
```

### Kill Process by Port
```powershell
# Find process using port
$port = 8080
$processId = (Get-NetTCPConnection -LocalPort $port).OwningProcess
Stop-Process -Id $processId -Force

# Or one-liner
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force
```

## 🧹 Cleaning

### Frontend Cleanup
```powershell
# Remove build artifacts
Remove-Item -Recurse -Force dist

# Remove dependencies
Remove-Item -Recurse -Force node_modules

# Remove lock file
Remove-Item bun.lock
# OR
Remove-Item package-lock.json

# Full clean reinstall
Remove-Item -Recurse -Force node_modules,dist
npm install
```

### Backend Cleanup
```powershell
cd backend

# Clean Maven build
mvn clean

# Remove target directory
Remove-Item -Recurse -Force target

# Clean and rebuild
mvn clean install
```

### Database Cleanup
```javascript
// Connect to MongoDB shell
mongosh

// Switch to voyago
use voyago

// Drop all bookings (reset bookings)
db.bookings.deleteMany({})

// Reset to just admin user
db.users.deleteMany({ role: { $ne: "ADMIN" } })

// Full database reset (CAREFUL!)
db.dropDatabase()
```

## 🔄 Git Commands

### Common Git Operations
```powershell
# Check status
git status

# Stage changes
git add .
git add specific-file.txt

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push

# Pull from remote
git pull

# Create new branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# View commit history
git log --oneline

# Discard local changes
git checkout -- filename
git restore filename
```

## 📊 Performance Monitoring

### Backend Performance
```powershell
# Run with JMX monitoring
cd backend
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dcom.sun.management.jmxremote"
```

### Database Performance
```javascript
// MongoDB shell - explain query
db.bookings.find({ userId: "123" }).explain("executionStats")

// Check collection stats
db.bookings.stats()

// View current operations
db.currentOp()
```

## 🔧 Configuration Changes

### Change Backend Port
Edit `backend/src/main/resources/application.properties`:
```properties
server.port=8081
```

Then update frontend `.env`:
```
VITE_API_URL=http://localhost:8081/api
```

### Change Frontend Port
Edit `package.json`:
```json
"scripts": {
  "dev": "vite --port=3001"
}
```

Then update backend CORS in `application.properties`:
```properties
app.cors.allowed-origins=http://localhost:3001
```

### Change MongoDB Connection
Edit `backend/src/main/resources/application.properties`:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/voyago_dev
spring.data.mongodb.database=voyago_dev
```

## 📝 Quick Reference

| Task | Command |
|------|---------|
| Start all | `.\start-dev.ps1` |
| Start backend | `.\start-backend.ps1` |
| Start frontend | `.\start-frontend.ps1` |
| Start MongoDB | `net start MongoDB` |
| Build backend | `mvn package` |
| Build frontend | `npm run build` |
| Install npm deps | `npm install` |
| Clean npm | `Remove-Item -Recurse node_modules; npm install` |
| Clean Maven | `mvn clean install` |
| Test API | `curl http://localhost:8080/api/destinations` |
| Connect to DB | `mongosh` |
| View DB | `use voyago; show collections;` |
| Kill port 8080 | `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force` |

## 💡 Pro Tips

1. **Keep MongoDB running** - Start it once and leave it running
2. **Use separate terminals** - One for backend, one for frontend
3. **Watch backend logs** - They show all API requests and errors
4. **Use browser DevTools** - Network tab shows all API calls
5. **Clear localStorage** - If authentication issues occur
6. **Check ports first** - Before starting servers, ensure ports are free
7. **Backup database** - Before testing destructive operations

---

**Save this file for quick reference during development!**
