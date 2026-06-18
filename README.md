# FraudShield - Event-Driven Payment Fraud Detection System

FraudShield is a full-stack banking payment and fraud detection platform designed to simulate secure digital banking operations with JWT authentication, role-based access control, account management, secure transfers, beneficiary management, fraud detection, audit logging, notifications, reports, and event-driven processing using Apache Kafka in the local environment.

## Live Demo

Frontend Application:
https://fraudshield-event-driven-payment-sy.vercel.app

Backend API:
https://fraudshield-event-driven-payment-system-production.up.railway.app

GitHub Repository:
https://github.com/chandu7000/fraudshield-event-driven-payment-system

## Demo Credentials

Use the following demo account to explore the application:

### Admin Demo

Email:

```txt
admin@gmail.com
```

Password:

```txt
Admin@123
```

Admin can access:

* Dashboard
* Accounts Management
* Users Management
* Transactions Management
* Fraud Alerts
* Audit Logs
* Reports and Analytics
* Notifications
* Profile

### Demo Notes

* This is a live demonstration environment.
* Admin can create customer bank accounts.
* Users can register only after the admin creates a bank account with the same email.
* Apache Kafka is used in the local environment for event-driven processing.
* In the Railway live deployment, Kafka listeners are disabled to keep the production demo stable.

## Project Overview

FraudShield represents a banking system where the bank brand is **FraudShield**, and the technical project domain is an **Event-Driven Payment and Fraud Detection System**.

The application supports both **Admin** and **User** roles. Admin users can manage accounts, users, transactions, fraud alerts, reports, audit logs, and notifications. Normal users can manage their own accounts, beneficiaries, profile, transfers, notifications, and statements.

## Key Highlights

* Full Stack Banking Application
* JWT Authentication and Role-Based Authorization
* Event-Driven Architecture with Apache Kafka in Local Environment
* Fraud Detection and Fraud Alert Resolution
* OTP-Based Registration and Password Recovery
* Secure Account and Transaction Management
* Admin and User Dashboards
* Railway Cloud Backend Deployment
* Vercel Frontend Deployment
* Responsive Banking Dashboard

## Tech Stack

### Backend

* Java 21
* Spring Boot
* Spring Security
* JWT Authentication
* Spring Data JPA
* Hibernate
* MySQL 8
* Apache Kafka
* Gmail SMTP
* Maven

### Frontend

* React
* Vite
* Tailwind CSS
* Axios
* React Router
* Lucide React
* Recharts
* HTML2PDF

### Infrastructure

* Docker
* Docker Compose
* MySQL Docker Container
* Kafka Docker Container
* Zookeeper Docker Container
* Railway
* Vercel

## Main Features

### Authentication and Security

* JWT based login
* Role based access control
* USER and ADMIN roles
* OTP based registration
* Forgot password OTP
* Password reset
* Change password
* Session isolated login using `sessionStorage`
* Device tracking
* Location tracking

### Account Management

* Admin account creation
* Auto account number generation
* Account freeze and unfreeze
* User-specific account visibility
* Admin account management
* Account status tracking

### Transactions

* Secure money transfer flow
* User transfers from own account only
* Admin transaction monitoring
* Transaction history
* Sent and received transaction classification
* Daily transfer limit
* Monthly transfer limit

### Beneficiary Management

* User-only beneficiary management
* Beneficiary activation waiting period
* Active and pending beneficiary status
* Admin does not use beneficiaries

### Fraud Detection

* Event-driven fraud monitoring using Apache Kafka in the local environment
* High amount transaction detection
* Repeated transaction detection
* Daily transfer threshold detection
* Fraud alert generation
* Fraud alert resolution by admin

### Notifications

* User notifications
* Admin notifications
* Mark notification as read
* Unread notification count
* Email notification support using Gmail SMTP

### Audit Logs

* Login audit logs
* Money transfer audit logs
* Fraud event audit logs
* Admin activity tracking

### Reports and Analytics

* Transaction summary report
* Fraud analytics report
* Account analytics report
* Monthly transaction trend
* CSV export
* PDF export
* Responsive charts

### UI and Responsiveness

* Professional banking dashboard UI
* Admin dashboard
* User dashboard
* Mobile responsive layout
* Tablet responsive layout
* Desktop responsive layout
* Sidebar drawer for mobile
* Responsive tables with horizontal scroll
* Auto-hide messages

## User Roles

### Admin

Admin can access:

* Dashboard
* Accounts Management
* Users Management
* Transactions Management
* Fraud Alerts
* Audit Logs
* Reports and Analytics
* Notifications
* Profile

### User

User can access:

* Dashboard
* My Accounts
* My Transactions
* Beneficiaries
* Notifications
* Profile
* Account Statement
* CSV and PDF statement exports

## Project Structure

```txt
fraudshield-event-driven-payment-system/
│
├── backend/
│   ├── src/main/java/com/sekhar/payment_fraud_system/
│   ├── src/main/resources/
│   ├── docker-compose.yml
│   ├── pom.xml
│   └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

## Docker Services Used Locally

```txt
monolith-mysql-db      → MySQL 8
monolith-zookeeper     → Zookeeper
monolith-kafka         → Apache Kafka
```

Local ports:

```txt
Backend      → 9000
MySQL        → 3308
Kafka        → 9095
Zookeeper    → 2182
Frontend     → Vite default port
```

## Environment Variables

The project does not expose real secrets in GitHub. Sensitive values are configured using environment variables.

Backend `application.properties` uses:

```properties
server.port=${SERVER_PORT:9000}

spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3308/payment_fraud_system_db}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}

spring.kafka.bootstrap-servers=${KAFKA_BOOTSTRAP_SERVERS:localhost:9095}
app.kafka.enabled=${APP_KAFKA_ENABLED:true}

spring.mail.username=${MAIL_USERNAME:}
spring.mail.password=${MAIL_PASSWORD:}
```

Create a local `backend/.env` file for development secrets. This file must not be pushed to GitHub.

Example:

```env
DB_URL=jdbc:mysql://localhost:3308/payment_fraud_system_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

KAFKA_BOOTSTRAP_SERVERS=localhost:9095
APP_KAFKA_ENABLED=true

MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
```

For Railway production deployment:

```env
APP_KAFKA_ENABLED=false
```

## How to Run Locally

### 1. Clone Repository

```bash
git clone https://github.com/chandu7000/fraudshield-event-driven-payment-system.git
cd fraudshield-event-driven-payment-system
```

### 2. Start Docker Services

```bash
cd backend
docker compose up -d
```

This starts MySQL, Kafka, and Zookeeper.

### 3. Run Backend

```bash
.\mvnw.cmd spring-boot:run
```

Backend runs on:

```txt
http://localhost:9000
```

### 4. Run Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on the Vite local URL shown in the terminal.

## Build Commands

### Frontend Build

```bash
cd frontend
npm run build
```

### Backend Build

```bash
cd backend
.\mvnw.cmd clean package
```

## Build Status

The project has been verified with:

```txt
Frontend production build  → Passed
Backend Maven build        → Passed
Backend API verification   → Passed
Multi-user login test      → Passed
Responsive UI audit        → Passed
Production deployment      → Passed
```

## Deployment

The project is deployed using:

```txt
Frontend  → Vercel
Backend   → Railway
Database  → Railway MySQL
Email     → Gmail SMTP with environment variables
```

For Vercel frontend deployment:

* Root directory: `frontend`
* Build command: `npm run build`
* Output directory: `dist`

For Railway backend deployment:

* Root directory: `backend`
* MySQL database connected using Railway environment variables
* Kafka disabled in Railway production using `APP_KAFKA_ENABLED=false`
* Gmail SMTP configured using secure environment variables

## Important Security Notes

* Real database passwords are not committed.
* Real Gmail app passwords are not committed.
* `.env` files are ignored by Git.
* JWT/session values are handled on the client using `sessionStorage`.
* `fraudShieldDeviceId` is the only value stored in `localStorage`.

## Current Project Status

```txt
Core Backend Features         Complete
Core Frontend Features        Complete
Responsive UI                 Complete
Frontend Build                Passed
Backend Build                 Passed
Backend API Verification      Passed
Production Readiness Testing  Passed
GitHub Repository             Complete
Deployment                    Complete
```

## Future Improvements

* Complete advanced microservices version
* Add Eureka Service Registry
* Add Spring Cloud Gateway
* Add Config Server
* Add Prometheus and Grafana production monitoring
* Add Dockerized production deployment
* Add CI/CD pipeline
* Add advanced fraud scoring engine
* Add transaction risk heatmaps
* Add admin notification rules
* Deploy production Kafka using a managed Kafka provider

## Project Name for Resume

**FraudShield - Event-Driven Payment Fraud Detection System**

## Author

**Chandu Nadiminti**

GitHub: [chandu7000](https://github.com/chandu7000)
