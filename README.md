# Weather Forecast Application

This project is a full-stack weather forecasting app with a React (Vite) frontend and a Python backend.

## Features
- Real-time weather updates for any location worldwide
- Weekly weather forecasts
- Detailed weather information (temperature, humidity, wind, etc.)
- Responsive, user-friendly interface with smooth transitions
- Integration with a third-party weather API
- Backend caching to reduce API calls and improve load times

## Getting Started

### Frontend (React + Vite)
1. Install dependencies:
   ```powershell
   npm install
   ```
2. Start the development server:
   ```powershell
   npm run dev
   ```

### Backend (Python)
1. Create and activate the virtual environment (already created as `backend-env`):
   ```powershell
   .\backend-env\Scripts\Activate.ps1
   ```
2. Install backend dependencies (Flask, requests, cachelib):
   ```powershell
   pip install flask requests cachelib
   ```
3. (Backend code will be added in a `backend/` folder.)

## Next Steps
- Implement the Python backend API in a `backend/` folder
- Connect the frontend to the backend API
- Add weather API integration and caching logic

---

*This project was scaffolded with Vite (React + TypeScript) and a Python virtual environment.*
