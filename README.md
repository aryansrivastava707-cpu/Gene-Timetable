# Gene Timetable

> A deterministic TypeScript genetic-algorithm solver for class schedules.

[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933.svg?logo=nodedotjs)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Tests](#-tests)
- [Limitations](#-limitations)
- [License](#-license)

## 🎯 Overview

Gene Timetable assigns lessons to periods and rooms, balancing hard clashes against softer schedule preferences.

## ✨ Features

- Optimize teacher, section, and room constraints
- Penalize long days, idle gaps, and repeated meetings
- Seed the search for repeatable runs
- Export a standalone HTML timetable

## 🧱 Architecture

The TypeScript solver models lessons and candidate schedules, scores each candidate, and evolves a population with selection, crossover, mutation, and elitism. The CLI reads JSON and writes HTML. It runs with Node's built-in TypeScript type stripping; no npm dependencies are needed.

See [algorithm details](docs/ALGORITHM.md), [architecture](docs/ARCHITECTURE.md), and [input/output notes](docs/INPUTS_AND_OUTPUTS.md).

## 🚀 Quick Start

Requires Node.js 24 or newer. From this folder:

```bash
npm test
npm start -- --out timetable.html
```

## ✅ Tests

`npm test` runs four TypeScript tests for capacity validation, conflict detection, seeded repeatability, and HTML escaping.

## ⚠️ Limitations

The genetic algorithm does not prove global optimality. Results depend on input constraints, seed, population, and generation count. The model only enforces the rules represented in its scoring function.

## 📄 License

MIT. See [LICENSE](LICENSE).
"# Gene-Timetable" 
