export interface Course { name: string; teacher: string; section: string; hours: number }
export interface ProblemData { days: string[]; periods: number; rooms: string[]; courses: Course[] }
export interface Lesson { name: string; teacher: string; section: string }
export interface Gene { slot: number; room: string }
export interface Problem { days: string[]; periods: number; rooms: string[]; lessons: Lesson[] }

export function makeProblem(data: ProblemData): Problem {
  if (!data.days?.length || !Number.isInteger(data.periods) || data.periods < 1 || !data.rooms?.length) {
    throw new Error('days, positive periods, and at least one room are required');
  }
  const lessons = data.courses.flatMap(course => {
    if (!Number.isInteger(course.hours) || course.hours < 1) throw new Error(`invalid hours for ${course.name}`);
    return Array.from({ length: course.hours }, () => ({ name: course.name, teacher: course.teacher, section: course.section }));
  });
  if (lessons.length > data.days.length * data.periods * data.rooms.length) throw new Error('more lessons than slot-room pairs');
  return { days: data.days, periods: data.periods, rooms: data.rooms, lessons };
}

export function hardViolations(problem: Problem, genes: Gene[]): number {
  const counts = [new Map<string, number>(), new Map<string, number>(), new Map<string, number>()];
  problem.lessons.forEach((lesson, i) => {
    const gene = genes[i]; if (!gene) return;
    for (const [map, key] of [[counts[0], `${lesson.teacher}|${gene.slot}`], [counts[1], `${lesson.section}|${gene.slot}`], [counts[2], `${gene.room}|${gene.slot}`]] as const) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  });
  return counts.reduce((sum, map) => sum + [...map.values()].reduce((n, v) => n + Math.max(0, v - 1), 0), 0);
}

export function softPenalty(problem: Problem, genes: Gene[]): number {
  const sectionPeriods = new Map<string, number[]>();
  const courseDays = new Map<string, number>();
  problem.lessons.forEach((lesson, i) => {
    const gene = genes[i]; if (!gene) return;
    const day = Math.floor(gene.slot / problem.periods), period = gene.slot % problem.periods;
    const key = `${lesson.section}|${day}`;
    sectionPeriods.set(key, [...(sectionPeriods.get(key) ?? []), period]);
    const courseKey = `${lesson.name}|${lesson.section}|${day}`;
    courseDays.set(courseKey, (courseDays.get(courseKey) ?? 0) + 1);
  });
  let penalty = 0;
  for (const periods of sectionPeriods.values()) {
    periods.sort((a, b) => a - b);
    for (let i = 1; i < periods.length; i++) penalty += Math.max(0, periods[i] - periods[i - 1] - 1);
    penalty += Math.max(0, periods.length - 4);
  }
  for (const meetings of courseDays.values()) penalty += 3 * Math.max(0, meetings - 1);
  return penalty;
}

export function cost(problem: Problem, genes: Gene[]): number {
  return 100 * hardViolations(problem, genes) + softPenalty(problem, genes);
}

function randomGene(problem: Problem, random: () => number): Gene {
  return { slot: Math.floor(random() * problem.days.length * problem.periods), room: problem.rooms[Math.floor(random() * problem.rooms.length)] };
}
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state = (1664525 * state + 1013904223) >>> 0; return state / 0x100000000; };
}
export function evolve(problem: Problem, options: { generations?: number; population?: number; seed?: number } = {}) {
  const generations = options.generations ?? 400, population = options.population ?? 120, random = seeded(options.seed ?? Date.now());
  if (generations < 1 || population < 10) throw new Error('generations must be positive and population must be at least 10');
  let candidates = Array.from({ length: population }, () => problem.lessons.map(() => randomGene(problem, random)));
  let best = candidates[0], bestCost = Infinity;
  const history: number[] = [];
  for (let generation = 0; generation < generations; generation++) {
    const scored = candidates.map(genes => ({ genes, score: cost(problem, genes) })).sort((a, b) => a.score - b.score);
    if (scored[0].score < bestCost) { best = scored[0].genes; bestCost = scored[0].score; }
    history.push(bestCost);
    const elite = scored.slice(0, Math.max(1, Math.floor(population / 10))).map(x => x.genes);
    const next = [...elite];
    while (next.length < population) {
      const parentA = scored[Math.floor(random() * Math.min(12, scored.length))].genes;
      const parentB = scored[Math.floor(random() * Math.min(12, scored.length))].genes;
      next.push(parentA.map((gene, i) => random() < 0.5 ? { ...gene } : { ...parentB[i] }).map(gene => random() < 0.04 ? randomGene(problem, random) : gene));
    }
    candidates = next;
  }
  return { genes: best, score: bestCost, history };
}

export function toHtml(problem: Problem, genes: Gene[], score: number): string {
  const esc = (value: string) => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
  let tables = '';
  for (const section of [...new Set(problem.lessons.map(x => x.section))].sort()) {
    tables += `<h2>${esc(section)}</h2><table><thead><tr><th>Period</th>${problem.days.map(d => `<th>${esc(d)}</th>`).join('')}</tr></thead><tbody>`;
    for (let period = 0; period < problem.periods; period++) {
      tables += `<tr><th>${period + 1}</th>` + problem.days.map((_, day) => {
        const slot = day * problem.periods + period;
        const i = genes.findIndex((g, j) => g.slot === slot && problem.lessons[j].section === section);
        return i < 0 ? '<td></td>' : `<td>${esc(problem.lessons[i].name)}<small>${esc(problem.lessons[i].teacher)} · ${esc(genes[i].room)}</small></td>`;
      }).join('') + '</tr>';
    }
    tables += '</tbody></table>';
  }
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Gene Timetable</title><style>body{font:16px system-ui;margin:2rem;background:#f3f6f4;color:#19322e}table{border-collapse:collapse;margin:1rem 0 2rem;width:100%}td,th{border:1px solid #b9c9c3;padding:.65rem;text-align:left}th{background:#dce9e3}small{display:block;color:#586c64}main{max-width:1100px;margin:auto}</style><main><h1>Generated timetable</h1><p>Cost: ${score} · lower is better; 0 hard clashes means no teacher, section, or room conflicts.</p>${tables}</main>`;
}
