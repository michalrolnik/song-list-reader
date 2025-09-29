# 🎶 Song List Reader

A full-stack web application that reads a CSV file of songs, stores them in a PostgreSQL database, and displays them in a simple React table, ordered by band name.

## ✨ Features
- **Backend:** [NestJS](https://nestjs.com/) with TypeScript  
- **Frontend:** React (Create React App) with TypeScript  
- **Database:** PostgreSQL (via Docker)  
- **Integration:** REST API (`/songs`) to fetch song data  
- **Dev & Prod modes** supported  

---

## 🗂 Project Structure

song-list-reader/
├── backend/
│ └── api/ # NestJS backend
│ └── src/ # Controllers, services, modules
├── frontend/ # React frontend (CRA)
│ └── src/
├── data/ # CSV file with song list
└── docker-compose.yml


---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/michalrolnik/song-list-reader.git
cd song-list-reader
```

### 2. Start the database (Docker)
```bash
docker compose up -d db
Database runs on localhost:5432 with user/password defined in .env.
```



### 3. Run the backend
```bash
cd backend/api
npm install
npm run start:dev
```

Backend will be available at http://localhost:3000
.

### 4. Run the frontend
```bash
cd frontend
npm install
npm start
```

Frontend will be available at http://localhost:3001
 (default CRA port is 3000 but our backend is on 3000 , so I edit forntend/env to be on 3001).

## 🔧 Production Build
### Backend
```bash
cd backend/api
npm run build
npm run start
```

### Frontend
```bash
cd frontend
npm run build
npx serve -s build
```

 ## 🛠 Tech Stack

NestJS (TypeScript) – backend framework

React (CRA) (TypeScript) – frontend

PostgreSQL – database

Docker Compose – containerized database

pg – PostgreSQL driver for Node.js



