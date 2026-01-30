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
- **Frontend:** React.js, Context API, CSS (Glassmorphism).
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
VITE_API_URL=http://localhost:5000/api

```

*Run Client:*

```bash
npm start

```

---

## 📷 Screenshots
<p align="center">
  <img 
    src="https://github.com/user-attachments/assets/470b0c3a-2da1-467c-80c6-355b596293b7"
    width="280"
    alt="Mobile Screenshot 1"
  />
  &nbsp;&nbsp;&nbsp;
  <img 
    src="https://github.com/user-attachments/assets/09a6668c-b301-4959-ac16-6b61ffeca4ab"
    width="280"
    alt="Mobile Screenshot 2"
  />
    &nbsp;&nbsp;&nbsp;
  <img 
    src="https://github.com/user-attachments/assets/75b12062-f36c-47cc-b145-bbec26a52613"
    width="280"
    alt="Mobile Screenshot 3"
  />
</p>

---

Made with ❤️ by VANA KARTHIK 
