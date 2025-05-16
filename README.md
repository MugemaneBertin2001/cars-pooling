```markdown
# 🚗 Car Pooling Tracking System

A backend service built with **NestJS** for real-time vehicle tracking. Simulates 10 vehicles with individual speeds and dynamic movement, synchronizing updates with a mock API.

---

## 🔧 Features

- 🚘 Tracks 10 vehicles with simulated real-world motion
- 🔁 Updates positions every 5 seconds based on individual speed
- 🌐 Synchronizes with a remote mock API
- 📡 RESTful API for fetching vehicle data
- 📈 Real-time simulation of vehicle statuses: **Moving**, **Stopped**, or **Idle**

---

## 📂 Project Structure

```

cars-pooling/
├── dist/                # Compiled output
├── node\_modules/        # Project dependencies
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

| Method | Endpoint       | Description                |
|--------|----------------|----------------------------|
| GET    | `/`            | Service health check       |
| GET    | `/cars`        | Fetch all vehicles         |
| GET    | `/cars/:id`    | Fetch vehicle by ID        |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mugemanebertin2001/cars-pooling.git
cd cars-pooling
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

Create a `.env` file with the following:

```env
API_URL=https://68260a2e397e48c91314bda1.mockapi.io/api/v1/cars
```

---

## 🧪 Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

---

## 🧠 Vehicle Movement Algorithm

Vehicles move according to a randomized, speed-based formula:

```ts
const speedFactor = car.speed / 10;
const distance = speedFactor * 0.001;
const angle = Math.random() * Math.PI * 2;
const latChange = Math.sin(angle) * distance;
const lngChange = Math.cos(angle) * distance;
```

This simulates realistic GPS movement in random directions based on speed.

---

## 🔁 Mock API Integration

Vehicle positions are periodically synchronized with:

```
https://68260a2e397e48c91314bda1.mockapi.io/api/v1/cars
```

The service fetches existing car data on startup and updates it on every movement cycle.

---

## 📊 Monitoring & Logs

You’ll see console logs for:

* ✅ Successful API loading and syncing
* 🛰️ Vehicle location updates every 5 seconds
* ⚠️ API communication issues (if any)

---

## 🧩 Tech Stack

* **[NestJS](https://nestjs.com/)** – Scalable Node.js framework
* **[Axios](https://axios-http.com/)** – HTTP client for API requests
* **[@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling)** – Background tasks and intervals

---

## 🖼️ Demo (Optional)

> You can insert screenshots or screen recordings of:
>
> * Console output
> * API responses in Postman
> * Diagram of vehicle movement logic

---

## 🛠️ Future Enhancements

* [ ] WebSocket integration for real-time frontend updates
* [ ] Map visualization of moving cars (e.g., using Leaflet or Google Maps)
* [ ] Persistent storage with MongoDB or PostgreSQL
* [ ] User authentication and car assignment

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo and submit pull requests.

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes
4. Push and submit a PR

---

## 🧠 Author & Maintainer

Developed by \[Mugemane Bertin]
💼 \[[bertin.m2001@gmail.com](mailto:bertin.m2001@gmail)] 

---
