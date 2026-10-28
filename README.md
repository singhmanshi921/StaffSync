# StaffSync

StaffSync is a role-based HR management app with a React/Vite client and Express/Mongoose API.

## Run locally

1. Create `backend/.env` from `.env.example` and set `MONGO_URI` and a long, private `JWT_SECRET`.
2. Optionally set `HR_NAME`, `HR_EMAIL`, and `HR_PASSWORD` on first startup to bootstrap the initial HR administrator. Remove or rotate the bootstrap password after first use.
3. In `backend`, run `npm install` and `npm run dev`.
4. In `frontend`, run `npm install` and `npm run dev`.
5. The API defaults to `http://localhost:5000`; set `VITE_API_URL` in the frontend environment to override it.
6. Employees create accounts through registration. HR links an account to a staff record by entering the employee's registered email in Employees.

## Roles and workflows

- HR manages manager accounts, employee records, attendance, leave decisions, announcements, training and performance reporting.
- Managers see their assigned team, can record team attendance, review team leave requests, create training and view performance.
- Employees maintain their profile, mark today's attendance, submit leave requests, and view announcements and training.
- API endpoints use JWT authentication and role checks. Employee self-service is scoped to the linked Employee record.

The project currently uses React state and a role-aware in-app navigation shell. React Router and Redux Toolkit are not included in the supplied archive. MongoDB-backed end-to-end tests require a configured database and are not bundled.
