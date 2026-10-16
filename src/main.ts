import './style.css';
import {command,createGame,interval,remaining,tick} from './game';
import type {Command,Game} from './game';
import {title} from './math';
import type {Mode} from './math';
import {readSave,writeSave} from './save';
import type {Best} from './save';

const leaf='<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 26C4 10 13 4 27 5c0 15-7 23-21 21Z" fill="currentColor"/><path d="M7 25 22 10M13 19l-1-7M17 15l7 1" stroke="#17382b" stroke-width="2" stroke-linecap="round"/></svg>';
const keeper='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M24 14q-2-10 9-11 3 9-9 11" fill="#c3e982"/><path d="M32 13q9-9 17-3-5 9-17 3" fill="#7dba72"/><path d="M18 34 12 53 24 56 30 44 36 56 49 53 43 34" fill="#739885"/><path d="M13 27q1-16 19-16t19 16v13q-19 14-38 0Z" fill="#edcc75" stroke="#283d2e" stroke-width="2"/><path d="M20 28q4-4 7 0m10 0q4-4 7 0" fill="none" stroke="#273c2e" stroke-width="3" stroke-linecap="round"/><path d="M28 36q4 5 9 0" fill="none" stroke="#273c2e" stroke-width="2" stroke-linecap="round"/><path d="m9 33-5 8m51-8 5 8" stroke="#edcc75" stroke-width="5" stroke-linecap="round"/></svg>';
const thorn=(tracker:boolean)=>`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="m12 41-7-9 10-2-5-15 16 5 6-14 8 14 16-5-5 16 9 5-10 8-5 12-13-5-13 5Z" fill="${tracker?'#d78ea9':'#d79772'}" stroke="#3c2f2f" stroke-width="2"/><path d="m23 31 6 3m12-3-6 3" stroke="#332e32" stroke-width="4" stroke-linecap="round"/><path d="M25 43q7-5 14 0" fill="none" stroke="#332e32" stroke-width="2"/></svg>`;
const root=document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML=`<header><a class="brand" href="./" aria-label="Lumen Orchard home">${leaf}<span>LUMEN<span class="brand-light"> / ORCHARD</span></span></a><span class="edition">FIELD NOTES · No. 001</span><button id="sound" class="quiet" aria-pressed="false">Sound off ♫</button></header>
<main><section class="intro"><div><p class="eyebrow">A LITTLE ARITHMETIC. A LITTLE ADVENTURE.</p><h1>Good things grow<br>one <em>number</em> at a time.</h1></div><p class="intro-note">Keep your lantern bright.<br>Harvest the right seeds.<br>Mind the wandering thorns.</p></section>
<div class="layout"><section class="game-card" aria-label="Orchard game"><div class="game-top"><div><span class="eyebrow" id="patch">PATCH 01 / 06</span><h2 id="rule"></h2></div><div class="score"><span class="eyebrow">HARVEST SCORE</span><strong id="score">0000</strong></div></div>
<div class="metrics"><span id="remaining"></span><span id="lives" aria-label="Lives"></span><button id="pause" class="quiet">Ⅱ Pause</button></div>
<div class="board-wrap"><div id="board" role="grid" aria-label="Six column, five row orchard. Arrow keys move, Space eats." tabindex="0"></div><div id="overlay" hidden></div></div>
<div class="game-bottom"><span class="status-dot"></span><span id="message" role="status" aria-live="polite"></span></div></section>
<aside><section class="field-card"><p class="eyebrow">YOUR FIELD GUIDE</p><h2>A mindful little harvest.</h2><p>Move onto a seed. If it fits the rule above, eat it. Clear every matching seed to restore the patch.</p><div class="guide-row"><span class="mini-keeper">${keeper}</span><div><strong>You, the lantern keeper</strong><span>Four lights. Make them last.</span></div></div><div class="guide-row"><span class="shelter-icon">⌜⌝<br>⌞⌟</span><div><strong>A moment of shelter</strong><span>Thorns cannot enter the marked cell. It will fade!</span></div></div><div class="guide-row"><span class="mini-thorn">${thorn(false)}</span><div><strong>Thorns on the move</strong><span>Drifters cross rows. Trackers hunt from patch 4.</span></div></div><p class="timing" id="pressure"></p></section>
<section class="controls-card"><div class="key-row"><span><kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> / WASD</span><span>Move</span></div><div class="key-row"><kbd class="space-key">SPACE</kbd><span>Eat seed</span></div><div class="key-row"><span><kbd>P</kbd> / <kbd>ESC</kbd></span><span>Pause</span></div><div class="touch-controls" aria-label="Onscreen controls"><button data-move="left" aria-label="Move left">←</button><button data-move="up" aria-label="Move up">↑</button><button data-move="down" aria-label="Move down">↓</button><button data-move="right" aria-label="Move right">→</button><button data-move="eat" class="eat">Eat</button></div></section>
<section class="run-card"><label for="mode" class="eyebrow">PLANT A NEW CHALLENGE</label><select id="mode"><option value="multiples">Multiples</option><option value="factors">Factors</option><option value="primes">Primes</option><option value="equality">Equality</option><option value="inequality">Inequality (not equal)</option></select><button id="restart" class="secondary">↻ New run</button><p id="best"></p><p id="saved" class="save-note"></p></section></aside></div>
<footer><span>${leaf} GROW YOUR CURIOSITY.</span><span>An original garden, inspired by a classroom classic. <a href="https://github.com/intrepion/kata-inspired-by-number-munchers-codex-dot#gameplay-research">Research & source ↗</a></span></footer></main>`;
const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const boardEl=el<HTMLDivElement>('board');
const cellEls=Array.from({length:30},(_,i)=>{
 const cell=document.createElement('div');cell.className='cell';cell.setAttribute('role','gridcell');cell.setAttribute('aria-rowindex',String(Math.floor(i/6)+1));cell.setAttribute('aria-colindex',String(i%6+1));cell.innerHTML='<span class="seed"></span><span class="occupant"></span><span class="shelter-clock"></span>';boardEl.append(cell);return cell;
});
let storage:Storage|null=null;
try{storage=window.localStorage;}catch{/* Storage can be disabled; play remains available. */}
const saved=storage?readSave(storage):null;
let game:Game=saved?.game??createGame();
let best:Best=saved?.best??{score:0,patch:0};
let selectedMode:Mode=game.mode;
el<HTMLSelectElement>('mode').value=selectedMode;
let sound=false,audioContext:AudioContext|undefined;
let lastStatus='',lastMessage='',lastSave=0;
function tone(frequency:number):void {
 if(!sound)return;
 try {
  audioContext??=new AudioContext();void audioContext.resume();
  const osc=audioContext.createOscillator(),gain=audioContext.createGain();
  osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(0.045,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,audioContext.currentTime+0.14);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+0.15);
 }catch{/* Audio is optional. */}
}
function persist():void {
 best={score:Math.max(best.score,game.score),patch:Math.max(best.patch,game.status==='won'?6:game.status==='cleared'?game.level:game.level-1)};
 const success=!!storage&&writeSave(storage,game,best);
 el('saved').textContent=success?'✓ Saved on this browser':'Saving unavailable · play continues';
 el('best').textContent=`Personal best · ${best.score} points / ${best.patch} patches`;
}
function act(action:Command):void {
 const previousScore=game.score,previousLives=game.lives;
 command(game,action);
 if(game.score>previousScore)tone(660);
 if(game.lives<previousLives)tone(160);
 persist();render();
}
function render():void {
 el('patch').textContent=`PATCH ${String(game.level).padStart(2,'0')} / 06 · ${game.mode.toUpperCase()}`;
 el('rule').textContent=title(game.rule);el('score').textContent=String(game.score).padStart(4,'0');
 el('remaining').textContent=`✦ ${remaining(game)} matching seeds left`;
 el('lives').textContent='●'.repeat(game.lives)+'○'.repeat(4-game.lives)+' lights';
 el<HTMLButtonElement>('pause').disabled=!['playing','paused'].includes(game.status);
 el('pause').textContent=game.status==='paused'?'▷ Resume':'Ⅱ Pause';
 if(game.message!==lastMessage){el('message').textContent=game.message;lastMessage=game.message;}
 const invulnerable=game.time<game.invulnerableUntil;
 cellEls.forEach((cell,i)=>{
  cell.className=`cell${i===game.player?' player-cell':''}${i===game.shelter?' shelter':''}${i===game.player&&invulnerable?' protected':''}`;
  const seed=game.cells[i];cell.querySelector('.seed')!.textContent=seed?.label??'';
  const enemies=game.enemies.filter(e=>e.active&&e.position===i);
  const sprite=i===game.player?keeper:enemies.length?thorn(enemies[0]!.kind==='tracker'):'';
  const occupant=cell.querySelector('.occupant')!;if(occupant.innerHTML!==sprite)occupant.innerHTML=sprite;
  cell.querySelector('.shelter-clock')!.textContent=i===game.shelter?`${Math.ceil((5000-game.time%7000)/1000)}s`:'';
  cell.setAttribute('aria-label',`Row ${Math.floor(i/6)+1}, column ${i%6+1}: ${seed?.label??'empty'}${i===game.player?', keeper':''}${i===game.shelter?', shelter':''}${enemies.length?', thorn':''}`);
 });
 const next=game.enemies.filter(e=>!e.active).sort((a,b)=>a.spawnAt-b.spawnAt)[0];
 const pressure=game.enemies.some(e=>e.active)?`Thorns are roaming · a step every ${(interval(game)/1000).toFixed(2)}s`:`First breath, then thorns · ${next?Math.max(0,Math.ceil((next.spawnAt-game.time)/1000)):0}s`;
 el('pressure').textContent=pressure;
 if(lastStatus!==game.status){renderOverlay();lastStatus=game.status;}
}
function renderOverlay():void {
 const overlay=el('overlay');overlay.hidden=game.status==='playing';
 if(game.status==='playing')return;
 const copy:Record<Exclude<Game['status'],'playing'>,[string,string,string,Command|null]>={
  ready:['A new season begins.',`Move with the arrow keys. Press Space to eat only the seeds that fit the rule. Ten good seeds, one bright patch.`,'Enter the orchard','start'],
  paused:['Take a breath.','Your orchard is paused. The thorns and shelter clock will wait for you.','Back to the garden','pause'],
  hurt:['A light went out.',game.message,'Restore your lantern','recover'],
  cleared:['A patch full of light.',`${game.message} Your next patch has a new rule and quicker thorns.`,'To the next patch','next'],
  over:['Rest, then grow again.',`${game.message} Your harvest: ${game.score} points. A fresh start is waiting.`,'Try a fresh run',null],
  won:['You made the orchard glow.',`Six patches restored. ${game.score} points harvested. Choose another category for a fresh challenge.`,'Grow again',null]
 };
 const [heading,body,label,action]=copy[game.status as Exclude<Game['status'],'playing'>];
 overlay.innerHTML=`<div class="overlay-panel"><div class="overlay-art">${game.status==='hurt'||game.status==='over'?thorn(false):keeper}</div><p class="eyebrow">${game.status==='paused'?'TIME TO REST':game.status==='hurt'?'ONE SEED AT A TIME':'THE LANTERN KEEPER'}</p><h3></h3><p class="overlay-copy"></p><button class="primary" id="continue"></button><span class="enter-hint">or press Enter</span></div>`;
 overlay.querySelector('h3')!.textContent=heading;overlay.querySelector('.overlay-copy')!.textContent=body;
 const button=el<HTMLButtonElement>('continue');button.textContent=label;
 button.onclick=()=>{if(action)act(action);else restart();boardEl.focus({preventScroll:true});};
}
function restart():void {game=createGame(selectedMode);lastStatus='';persist();render();}
el<HTMLButtonElement>('restart').onclick=()=>{restart();boardEl.focus({preventScroll:true});};
el<HTMLButtonElement>('pause').onclick=()=>{act('pause');boardEl.focus({preventScroll:true});};
el<HTMLSelectElement>('mode').onchange=e=>{selectedMode=(e.target as HTMLSelectElement).value as Mode;};
el<HTMLButtonElement>('sound').onclick=()=>{sound=!sound;el('sound').textContent=sound?'Sound on ♫':'Sound off ♫';el('sound').setAttribute('aria-pressed',String(sound));if(sound)tone(440);};
document.querySelectorAll<HTMLButtonElement>('[data-move]').forEach(b=>b.onclick=()=>{act(b.dataset.move as Command);boardEl.focus({preventScroll:true});});
const keys:Record<string,Command>={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',' ':'eat',p:'pause',Escape:'pause'};
document.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.metaKey||e.altKey||(e.target instanceof HTMLElement&&['SELECT','INPUT','TEXTAREA'].includes(e.target.tagName)))return;
 if(e.key==='Enter') {if(e.repeat)return;const button=document.getElementById('continue');if(button){e.preventDefault();button.click();}return;}
 const action=keys[e.key]??keys[e.key.toLowerCase()];if(!action)return;
 // Buttons keep native keyboard activation; game actions focus the grid afterwards.
 if(e.key===' '&&e.target instanceof HTMLButtonElement)return;
 e.preventDefault();if(e.repeat&&['eat','pause'].includes(action))return;act(action);
});
function autoPause():void {if(game.status==='playing')act('pause');else persist();}
window.addEventListener('blur',autoPause);document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause();});window.addEventListener('pagehide',persist);
let previous=performance.now();
setInterval(()=>{
 const now=performance.now();const dt=Math.min(100,Math.max(0,Math.round(now-previous)));previous=now;
 const lives=game.lives;tick(game,dt);if(game.lives<lives)tone(160);render();
 if(now-lastSave>=500){persist();lastSave=now;}
},50);
persist();render();
