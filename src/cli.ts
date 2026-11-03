import { readFile, writeFile } from 'node:fs/promises';
import { evolve, makeProblem, toHtml, type ProblemData } from './solver.ts';
const [input, ...args] = process.argv.slice(2);
if (!input) { console.error('Usage: node --experimental-strip-types src/cli.ts data.json [--out timetable.html] [--seed 1]'); process.exit(2); }
const value = (flag: string, fallback: string) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : fallback; };
const problem = makeProblem(JSON.parse(await readFile(input, 'utf8')) as ProblemData);
const seed = Number(value('--seed', String(Date.now()))), output = value('--out', 'timetable.html');
const result = evolve(problem, { seed });
await writeFile(output, toHtml(problem, result.genes, result.score), 'utf8');
console.log(`${problem.lessons.length} lessons · score ${result.score} · wrote ${output}`);
