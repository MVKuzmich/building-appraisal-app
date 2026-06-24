# AGENTS.md

## Cursor Cloud specific instructions

This is a building-insurance valuation web app with three services:

| Service | Tech | Dev command | Port |
|---|---|---|---|
| `backend` | Java 17 + Spring Boot (Maven) | `mvn -f backend/pom.xml spring-boot:run` | 8080 |
| `frontend` | React (Create React App / npm) | `npm --prefix frontend start` | 3000 |
| `mongodb` | MongoDB 7 | see replica-set note below | 27017 |

Standard build/test/run commands live in `backend/pom.xml`, `frontend/package.json`, and `docker-compose.yml`; this section only captures the non-obvious gotchas.

### Java version
The project targets Java 17 and uses Lombok 1.18.24 (which predates Java 21 support), so builds must run on JDK 17. The system default `java`/`javac` is already pinned to JDK 17 via `update-alternatives`, and Maven inherits it — don't switch the default to the also-installed JDK 21.

### MongoDB must run as a single-node replica set
`backend/src/main/resources/application.properties` enables Mongo transactions and `DataLoader` runs a `@Transactional` seed on startup, so a **standalone** `mongod` will make the backend fail to start. `/etc/mongod.conf` is already configured with `replSetName: rs0` and the replica set is initialized. There is no systemd in this container, so start Mongo manually if it is not already running:

```
sudo -u mongodb mongod --config /etc/mongod.conf --fork
# first time only (already done): mongosh --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"127.0.0.1:27017"}]})'
```

Check it is PRIMARY with `mongosh --quiet --eval 'rs.status().myState'` (expect `1`).

### Backend startup env vars (placeholders have no defaults)
`application.properties` references `${...}` placeholders with no fallback, so the app fails to start unless these are set. Mail values can be dummies (only the optional feedback-email feature uses them):

```
export SPRING_DATA_MONGODB_URI="mongodb://localhost:27017/buildings?replicaSet=rs0"
export FILE_UPLOAD_DIR="/tmp/uploads"
export MAIL_USERNAME="dev@example.com" MAIL_PASSWORD="dummy" DEVELOPER_EMAIL="dev@example.com"
mvn -f backend/pom.xml spring-boot:run
```

On startup `DataLoader` seeds 92 building types into Mongo from `backend/src/main/resources/data.json`.

### Frontend dev API URL
The committed `frontend/.env` sets `REACT_APP_API_BASE_URL=http://localhost` — that is correct for the production Nginx/Docker setup (Nginx proxies `/api` on port 80), but it breaks native dev where the backend is on `:8080`. For local dev there is a gitignored override `frontend/.env.development.local` containing `REACT_APP_API_BASE_URL=http://localhost:8080`. CRA loads it with higher priority in development. Recreate it if missing:

```
printf 'REACT_APP_API_BASE_URL=http://localhost:8080\n' > frontend/.env.development.local
```

The backend already allows CORS from `http://localhost:3000`.

### Tests / lint
- Backend: `mvn -f backend/pom.xml test` (the single `contextLoads` test boots the full context, so Mongo + the env vars above must be present).
- Frontend: lint runs automatically during `npm --prefix frontend start` / `build` (warnings only). `npm --prefix frontend test` currently fails — it is the stale default CRA boilerplate test (`App.test.js` looks for "learn react") and CRA's Jest config cannot resolve `react-router-dom` v7's `exports`. This is a pre-existing repo issue, not an environment problem.
