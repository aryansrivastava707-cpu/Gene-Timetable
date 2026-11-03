# Architecture

`src/solver.ts` models lessons, scores collisions and soft preferences, and runs a seeded genetic algorithm. `src/cli.ts` reads the JSON problem and writes an HTML timetable. Node.js 24 strips the TypeScript types at runtime, so there are no third-party packages.

## Run

```bash
npm test
npm start -- --out timetable.html --seed 1
```
