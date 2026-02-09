# 🚂 Railway Our Way

![Project Status](https://img.shields.io/badge/Status-Active_Development-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-React_|_Supabase_|_TypeScript-blue)
![License](https://img.shields.io/badge/License-MIT-orange)

> **"For the people, by the people."**
> A community-powered train schedule and alert system designed for Cape Town commuters.

---

## 📖 About The Project

**Railway Our Way** is a modern, mobile-first Progressive Web App (PWA) built to solve the frustration of unreliable train updates. Unlike static schedules, this app combines official timetables with **real-time crowd-sourced reports**.

Commuters can check schedules, see live departure boards, and warn fellow travelers about delays, cancellations, or safety concerns instantly.

### 🌟 Key Features
* **📍 Trip Planner:** Smart routing logic (Inbound/Outbound) with estimated fares.
* **📢 Community Alerts:** Live "Waze-like" reporting for delays and safety incidents.
* **🚉 Live Departures:** Digital "Station Board" showing upcoming trains for any specific stop.
* **🎨 Golden Hour UI:** A warm, high-contrast "Neobrutalism" design optimized for sunlight visibility.
* **⚡ Offline Ready:** Built as a PWA to work with spotty network connections.

---

## 🛠️ Tech Stack

This project uses a modern, scalable architecture designed for speed and developer experience.

* **Frontend:** React 18, Vite, TypeScript
* **Styling:** Tailwind CSS (Custom "Golden Hour" Theme), Lucide React (Icons)
* **State & Animation:** Framer Motion, React Router DOM
* **Backend:** Supabase (PostgreSQL)
* **Realtime:** Supabase Realtime (WebSockets)
* **Authentication:** Supabase Auth

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites
* Node.js (v18 or higher)
* npm (v9 or higher)

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/railway-our-way.git](https://github.com/YOUR_USERNAME/railway-our-way.git)
    cd railway-our-way
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your Supabase keys:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

---

## 📂 Project Structure

```text
src/
├── components/      # Reusable UI components (Cards, Modals, Buttons)
├── pages/           # Main Views (Home, Schedule, Community)
├── lib/             # Supabase client & utility functions
├── hooks/           # Custom React hooks (useStations, useReports)
└── styles/          # Tailwind configuration & global CSS
🗺️ Roadmap
[x] Phase 1: Core Architecture (Vite + Supabase Connection)

[x] Phase 2: Trip Planner Logic (Direction & Time Filtering)

[ ] Phase 3: Community Reporting (Live Incidents Feed)

[ ] Phase 4: User Authentication & Profiles

[ ] Phase 5: PWA Offline Caching & Push Notifications

🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📧 Contact
Project Lead: [Moholeng Mokoena] - [https://www.linkedin.com/in/moholeng-mokoena-00a097278/] Project Link:https://github.com/Mokoena2000/rail-way-our-way

Built with ❤️ in Cape Town.