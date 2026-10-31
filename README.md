# AI Road Health Monitoring

Road image analysis and maintenance dashboard with role-based sign-in.

## Run locally on Windows

1. Install Python 3.10+ and Node.js 20.19+.
2. Open a terminal in `backend`, create and activate a virtual environment, then install the backend dependencies:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   Copy-Item .env.example .env
   ```

   Set a private `FLASK_SECRET_KEY` value in `backend/.env`. Keep that file private. The demo starts with a temporary key if you skip this step, so sessions will end when the backend restarts.

3. In that same terminal, start Flask:

   ```powershell
   py app.py
   ```

4. Open a second terminal in `frontend`, install dependencies, and start Vite:

   ```powershell
   npm ci
   npm run dev
   ```

5. Open the local Vite address shown in the terminal (usually `http://localhost:5173`). The frontend proxies API requests to Flask on port 5000.

The first backend start adds the account and activity tables to `backend/database/road_health.db` and upgrades the existing report table without deleting earlier reports. Newly submitted reports are associated with the signed-in account.

## Demo accounts

| Role | Username | Password |
| --- | --- | --- |
| Reporter | `reporter` | `Reporter@123` |
| Maintenance Supervisor | `supervisor` | `Supervisor@123` |
| Admin | `admin` | `Admin@123` |

These credentials are for local demonstration only. Change the demo passwords before using the project with real users or real data. Passwords are stored as hashes in SQLite. The login screen also shows the demo credentials.

## Access levels

- **Reporter:** submit road reports and view only reports and images submitted by that account.
- **Maintenance Supervisor:** use the existing dashboard, reports, map, analytics, and worker management features.
- **Admin:** full system access plus the login and activity history.

## Project contents

The ZIP keeps the application source, model weights, database and sample road images. Generated Python and Node dependency folders are left out because they are machine-specific; the steps above recreate them from the included dependency manifests.
