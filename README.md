# 🏏 SCORD - Premium Cricket Scorer

A modern, glassmorphic cricket scoring application featuring real-time server synchronization, offline guest mode, and detailed match analytics.

### 🔗 Live Demo
- **Frontend (App):** [https://scord-scorer.vercel.app/](https://scord-scorer.vercel.app/)
- **Backend (API):** [https://scord.vercel.app/](https://scord.vercel.app/)

---

## ✨ Key Features
- **Premium UI:** Glassmorphism design with adaptive Dark/Light themes.
- **Match Management:** Custom overs, wickets, and extras settings.
- **Real-Time Sync:** Seamlessly syncs match data to the cloud when logged in.
- **Offline Support:** Guest mode saves data locally (`localStorage`) and syncs when online.
- **3D Interactive Elements:** Realistic 3D Coin Toss and Victory animations.
- **Undo Capability:** Full history tracking allows undoing the last ball.

## 🛠️ Tech Stack
- **Frontend:** React.js, Context API, CSS3 (Glassmorphism).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **Auth:** JWT (JSON Web Tokens).

---

## 🚀 Local Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/scord.git](https://github.com/your-username/scord.git)
cd scord

```

### 2. Backend Setup

```bash
cd server
npm install

```

*Create a `.env` file in the `/server` folder:*

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000

```

*Run Server:*

```bash
npm start

```

### 3. Frontend Setup

```bash
cd client
npm install

```

*Create a `.env` file in the `/client` folder:*

```env
REACT_APP_API_URL=http://localhost:5000/api

```

*Run Client:*

```bash
npm start

```

---

## 📷 Screenshots
<img width="550" height="873" alt="Screenshot 2026-01-29 014411" src="https://github.com/user-attachments/assets/6cf00df0-870c-445e-8a48-d69086b54c5c" />

<img width="641" height="870" alt="Screenshot 2026-01-29 014429" src="https://github.com/user-attachments/assets/cbd3b75d-a81c-4ae2-8d1b-8828ffe1e164" />

---

Made with ❤️ by VANA KARTHIK 

```

```
