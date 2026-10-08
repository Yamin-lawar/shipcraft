# tasks-node (fixture)

A small task tracker: login, projects with members, tasks, member invites, CSV import, and a daily digest job on `node-cron`. It is the sample codebase Shipcraft's evals run skills against. Needs Node 22.13 or newer (uses `node:sqlite`).

```bash
npm install
npm test
npm start      # http://localhost:3000
```

Seed data: `alice@example.com` and `bob@example.com`, password `password1`. Alice owns project 1. Bob owns project 2. This is fake data for the fixture.
