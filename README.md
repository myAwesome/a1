# Web App Generator from YAML Config

A tool that generates a full-stack web application (database + REST API server + React client) from a single YAML configuration file.

## Overview

Define your data models, relationships, and UI once in YAML — get a production-ready app with:

- **Database** — MySQL schema with tables, columns, and foreign keys
- **Server** — Express.js REST API with CRUD endpoints, middleware, and validation
- **Client** — React frontend with views, forms, and data tables

## Example Config

```yaml
app:
  name: attendance-journal
  port: 3000

database:
  host: localhost
  name: attendance_db

models:
  - name: students
    fields:
      - name: first_name
        type: varchar(100)
        required: true
      - name: last_name
        type: varchar(100)
        required: true
      - name: email
        type: varchar(255)
        unique: true

  - name: subjects
    fields:
      - name: name
        type: varchar(200)
        required: true

  - name: lessons
    fields:
      - name: date
        type: date
        required: true
      - name: subject_id
        type: int
        references: subjects.id

  - name: attendance
    fields:
      - name: lesson_id
        type: int
        references: lessons.id
      - name: student_id
        type: int
        references: students.id
      - name: present
        type: boolean
        default: false
```

## Generated Project Structure

```
my-app/
├── server.js
├── package.json
├── .env.example
├── src/
│   ├── app.js
│   ├── config/
│   ├── db/
│   │   ├── index.js       # connection pool
│   │   └── init.js        # schema creation
│   ├── routes/            # one file per model
│   ├── controllers/
│   └── middleware/
├── client/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       └── components/    # one component per model
└── tests/
    └── *.test.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+

### Install

```bash
npm install -g web-app-gen
```

### Generate

```bash
web-app-gen generate config.yaml --output ./my-app
```

### Run the generated app

```bash
cd my-app

# configure environment
cp .env.example .env
# edit .env with your DB credentials

# install dependencies
npm install
cd client && npm install && cd ..

# start server
npm start

# start client (separate terminal)
cd client && npm run dev
```

## API Endpoints

For each model defined in YAML the generator produces:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/:model` | List all records |
| GET | `/api/:model/:id` | Get one record |
| POST | `/api/:model` | Create record |
| PUT | `/api/:model/:id` | Update record |
| DELETE | `/api/:model/:id` | Delete record |

Additional endpoints can be declared in the YAML config.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | MySQL 8 |
| Server | Node.js, Express |
| Client | React 18, Vite |
| Testing | Jest, Supertest |

## Development

```bash
git clone <repo>
npm install
npm test
```

## License

MIT
