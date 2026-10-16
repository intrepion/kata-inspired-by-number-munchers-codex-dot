import { expect, it } from 'vitest';
import { createGame, command, tick, remaining } from '../src/game';
import { numeric } from '../src/math';
const elapse=(g:ReturnType<typeof createGame>,ms:number)=>{for(let t=0;t<ms;t+=50) tick(g,50);};
it('steps orthogonally within bounds without eating; harvest is explicit',()=>{
 const g=createGame('multiples',1);command(g,'start');g.player=0;g.cells[0]=numeric(4);
 command(g,'left');command(g,'up');expect(g.player).toBe(0);expect(g.cells[0]?.value).toBe(4);
 command(g,'eat');expect(g.cells[0]).toBeNull();expect(g.score).toBe(5);
 command(g,'right');expect(g.player).toBe(1);command(g,'down');expect(g.player).toBe(7);
});
it('wrong answers cost exactly one life, explain, freeze, then recover with protection',()=>{
 const g=createGame('multiples',1);command(g,'start');g.cells[g.player]=numeric(3);
 command(g,'eat');expect(g.lives).toBe(3);expect(g.status).toBe('hurt');expect(g.message).toContain('not a positive multiple');
 command(g,'eat');elapse(g,9000);expect(g.lives).toBe(3);expect(g.time).toBe(0);
 command(g,'recover');expect(g.status).toBe('playing');expect(g.invulnerableUntil).toBe(2000);
});
it('clears only when the last matching seed is eaten, advances, and finishes six patches',()=>{
 const g=createGame('multiples',1);command(g,'start');
 for(let level=1;level<=6;level++) {
  g.cells=Array.from({length:30},()=>numeric(1));g.cells[g.player]=numeric(g.rule.target);
  expect(remaining(g)).toBe(1);command(g,'eat');expect(g.status).toBe(level===6?'won':'cleared');
  if(level<6) {command(g,'next');expect(g.level).toBe(level+1);expect(g.status).toBe('playing');expect(remaining(g)).toBe(10);}
 }
});
it('pause freezes spawn clock; Drifter spawns at 8s and moves on its interval',()=>{
 const g=createGame('multiples',1);command(g,'start');elapse(g,7950);expect(g.enemies[0]?.active).toBe(false);
 command(g,'pause');elapse(g,5000);expect(g.time).toBe(7950);command(g,'pause');elapse(g,50);
 expect(g.enemies[0]?.active).toBe(true);expect(g.enemies[0]?.position).toBe(0);
 elapse(g,950);expect(g.enemies[0]?.position).toBe(0);elapse(g,50);expect(g.enemies[0]?.position).toBe(1);
});
it('collision on player movement and enemy movement both cost a life; four losses end run',()=>{
 const g=createGame('multiples',1);command(g,'start');g.shelter=null;g.player=0;
 const enemy=g.enemies[0]!;enemy.active=true;enemy.position=1;command(g,'right');expect(g.lives).toBe(3);
 command(g,'recover');g.shelter=null;g.invulnerableUntil=0;g.player=2;const nextEnemy=g.enemies[0]!;nextEnemy.active=true;nextEnemy.position=1;nextEnemy.nextMoveAt=g.time+50;
 tick(g,50);expect(g.lives).toBe(2);
 command(g,'recover');g.cells[g.player]=numeric(1);command(g,'eat');expect(g.lives).toBe(1);
 command(g,'recover');g.cells[g.player]=numeric(1);command(g,'eat');expect(g.status).toBe('over');
});
it('shelters exclude enemies, expire, relocate and remove a thorn underneath',()=>{
 const g=createGame('multiples',1);command(g,'start');expect(g.shelter).toBe(14);
 const e=g.enemies[0]!;g.player=29;e.active=true;e.position=13;e.direction=1;e.nextMoveAt=50;
 tick(g,50);expect(e.position).toBe(13);expect(e.direction).toBe(-1);
 elapse(g,4950);expect(g.shelter).toBeNull();
 e.active=true;e.position=21;e.nextMoveAt=9000;elapse(g,2000);expect(g.shelter).toBe(21);expect(e.active).toBe(false);
});
it('recovery protects contact briefly; Tracker pursues from patch four',()=>{
 const g=createGame('multiples',1);g.level=4;g.status='cleared';command(g,'next'); // patch 5
 expect(g.enemies.map(e=>e.kind)).toEqual(['drifter','tracker']);
 const e=g.enemies[1]!;g.player=29;g.shelter=null;e.active=true;e.position=0;e.nextMoveAt=50;
 tick(g,50);expect(e.position).toBe(1);
 g.player=2;g.invulnerableUntil=1000;command(g,'left');expect(g.lives).toBe(4);
 g.invulnerableUntil=0;tick(g,50);expect(g.lives).toBe(3);
});
