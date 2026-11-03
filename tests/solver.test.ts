import test from 'node:test';
import assert from 'node:assert/strict';
import { cost, evolve, hardViolations, makeProblem, toHtml, type ProblemData } from '../src/solver.ts';
const data: ProblemData = { days:['Mon','Tue'], periods:3, rooms:['A','B'], courses:[
 {name:'Math',teacher:'T1',section:'S1',hours:2},
 {name:'Code',teacher:'T2',section:'S1',hours:2},
 {name:'Math',teacher:'T1',section:'S2',hours:2}
]};
test('rejects schedule demand beyond available capacity',()=>assert.throws(()=>makeProblem({...data,rooms:['A'],courses:[{name:'X',teacher:'T',section:'S',hours:7}]}),/more lessons/));
test('detects teacher, section, and room conflicts',()=>{const p=makeProblem(data); const genes=p.lessons.map(()=>({slot:0,room:'A'})); assert.ok(hardViolations(p,genes)>0);});
test('seeded search is repeatable and never increases its best score',()=>{const p=makeProblem(data); const a=evolve(p,{seed:7,generations:80,population:40}),b=evolve(p,{seed:7,generations:80,population:40}); assert.equal(a.score,b.score); assert.ok(a.history.at(-1)!<=a.history[0]); assert.equal(a.score,cost(p,a.genes));});
test('HTML output escapes untrusted course names',()=>{const p=makeProblem({...data,courses:[{name:'<img src=x>',teacher:'T',section:'S',hours:1}]}); const result=evolve(p,{seed:1,generations:5,population:20}); assert.match(toHtml(p,result.genes,result.score),/&lt;img src=x&gt;/);});
