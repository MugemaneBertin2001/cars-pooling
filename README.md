
# 🚗 Car Pooling Tracking System

A backend service built with **NestJS** to simulate and track the movement of 10 vehicles in real time. The system periodically updates vehicle positions and syncs with a mock API, offering RESTful endpoints for data access.

---

## 🔧 Features

- 🚘 **Simulates** 10 vehicles with real-time location tracking
- 🕔 **Updates** positions every 5 seconds based on dynamic speed values
- 🌐 **Synchronizes** with a remote mock API
- 📡 **Exposes** RESTful endpoints to retrieve vehicle data
- 📊 Simulates various **statuses**: `Moving`, `Stopped`, `Idle`

---

## 📂 Project Structure

```bash
cars-pooling/
├── dist/                # Compiled output
├── node_modules/        # Project dependencies
├── src/                 # Application source code
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.build.json
└── tsconfig.json
````

---

## 📡 API Endpoints

| Method | Endpoint    | Description                  |
| ------ | ----------- | ---------------------------- |
| GET    | `/`         | Service health check         |
| GET    | `/cars`     | Fetch all vehicles           |
| GET    | `/cars/:id` | Fetch specific vehicle by ID |

---

## 🚀 Getting Started

### 📥 1. Clone the Repository

```bash
git clone https://github.com/mugemanebertin2001/cars-pooling.git
cd cars-pooling
```

### 📦 2. Install Dependencies

```bash
npm install
```

### ⚙️ 3. Setup Environment

Create a `.env` file in the root directory:

```env
API_URL=https://68260a2e397e48c91314bda1.mockapi.io/api/v1/cars
```

---

## 🧪 Running the Application

### 🛠 Development Mode

```bash
npm run start:dev
```

### 🚀 Production Mode

```bash
npm run build
npm run start:prod
```

---

## 🧠 Vehicle Movement Algorithm

Vehicle position updates are calculated using this algorithm:

```ts
const speedFactor = car.speed / 10;
const distance = speedFactor * 0.001;
const angle = Math.random() * Math.PI * 2;
const latChange = Math.sin(angle) * distance;
const lngChange = Math.cos(angle) * distance;
```

> 🚦 This approach simulates GPS movement in random directions based on speed.

---

## 🔁 Mock API Integration

Vehicle data is synchronized with:

```
https://68260a2e397e48c91314bda1.mockapi.io/api/v1/cars
```

* Data is fetched on startup
* Updated every 5 seconds during runtime

---

## 📊 Monitoring & Logs

Terminal logs will show:

* ✅ API fetch and sync status
* 🛰️ Vehicle position updates
* ⚠️ Any API communication issues

---

## 🧩 Tech Stack

* ⚙️ **[NestJS](https://nestjs.com/)** – Scalable Node.js backend framework
* 🌐 **[Axios](https://axios-http.com/)** – HTTP client for API interaction
* ⏱ **[@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling)** – Task scheduling and cron jobs

---

## 🖼️ Demo (Optional)

> Consider adding:
>
> * 📸 Screenshots of API responses (e.g., Postman)
> * 🎥 Video clip of logs showing updates
> * 🗺️ Visual map or diagram for movement simulation

---

## 🛠️ Future Enhancements

* [ ] WebSocket support for real-time frontend updates
* [ ] Live map visualization (Leaflet, Google Maps)
* [ ] Persistent database (PostgreSQL, MongoDB)
* [ ] User auth with vehicle assignments

---

## 🤝 Contributing

Contributions welcome! Here’s how to help:

```bash
# 1. Fork the repository
# 2. Create a new branch
git checkout -b feature-name

# 3. Make your changes
# 4. Commit and push
git commit -m "Add feature"
git push origin feature-name

# 5. Submit a pull request on GitHub
```

---

## 👤 Author & Maintainer

**Mugemane Bertin**
📧 [bertin.m2001@gmail.com](mailto:bertin.m2001@gmail.com)
🔗 [LinkedIn](linkedin.com/in/mugemane-bertin-15a383237)



