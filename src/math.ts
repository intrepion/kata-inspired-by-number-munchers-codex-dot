export const modes = ['multiples','factors','primes','equality','inequality'] as const;
export type Mode = typeof modes[number];
export type Operator = '+' | '−' | '×' | '÷';
export type Seed = { label: string; value: number };
export type Rule = { mode: Mode; target: number };
export const numeric = (value: number): Seed => ({label:String(value),value});
export function expression(a:number, op:Operator, b:number):Seed {
  const value = op === '+' ? a+b : op === '−' ? a-b : op === '×' ? a*b : a/b;
  return {label:`${a} ${op} ${b}`,value};
}
export function prime(n:number):boolean {
  if (!Number.isInteger(n) || n<2) return false;
  for(let divisor=2;divisor*divisor<=n;divisor++) if(n%divisor===0) return false;
  return true;
}
export function matches(seed:Seed,rule:Rule):boolean {
  const n=seed.value;
  switch(rule.mode) {
    case 'multiples': return n>0 && n%rule.target===0;
    case 'factors': return n>0 && Number.isInteger(n) && rule.target%n===0;
    case 'primes': return prime(n);
    case 'equality': return n===rule.target;
    case 'inequality': return n!==rule.target;
  }
}
export function ruleFor(mode:Mode,level:number):Rule {
  return {mode,target:mode==='factors' ? [12,18,24,30,36,48][level-1] ?? 48 : level+1};
}
export function title(rule:Rule):string {
  return rule.mode==='primes' ? 'Harvest prime numbers' : rule.mode==='multiples' ? `Harvest multiples of ${rule.target}` : rule.mode==='factors' ? `Harvest factors of ${rule.target}` : `Harvest expressions ${rule.mode==='equality'?'equal':'not equal'} to ${rule.target}`;
}
export function explanation(seed:Seed,rule:Rule):string {
  switch(rule.mode) {
    case 'multiples': return `${seed.label} is not a positive multiple of ${rule.target}.`;
    case 'factors': return `${seed.label} does not divide ${rule.target} evenly.`;
    case 'primes': return `${seed.label} is not prime. A prime has exactly two positive divisors; 1 has only one.`;
    case 'equality': return `${seed.label} = ${seed.value}, not ${rule.target}.`;
    case 'inequality': return `${seed.label} = ${rule.target}. Harvest expressions with a different result.`;
  }
}
// Seeded generation makes boards reproducible without relying on random sort.
export function board(rule:Rule,seed:number):Seed[] {
  let state=seed>>>0;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const pool:Seed[]=[];
  if(rule.mode==='equality'||rule.mode==='inequality') {
    for(let n=0;n<12;n++) {
      const value=n%2===0?rule.target:rule.target+1+n%3;
      pool.push(expression(n,'+',value-n),expression(value+n,'−',n),expression(value,'×',1),expression(value*2,'÷',2));
    }
  } else for(let n=1;n<=Math.max(30,rule.target*4);n++) pool.push(numeric(n));
  const good=pool.filter(s=>matches(s,rule)),bad=pool.filter(s=>!matches(s,rule));
  const cells=Array.from({length:30},(_,i)=>{
    const group=i<10?good:bad;
    return {...group[Math.floor(random()*group.length)]!};
  });
  for(let i=29;i>0;i--) {const j=Math.floor(random()*(i+1)); [cells[i],cells[j]]=[cells[j]!,cells[i]!];}
  return cells;
}
