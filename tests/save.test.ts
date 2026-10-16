import {expect,it} from 'vitest';
import {createGame,command} from '../src/game';
import {numeric} from '../src/math';
import {encode,decode,readSave,writeSave,SAVE_KEY} from '../src/save';
it('preserves the exact board, progression and clocks, resuming active play paused',()=>{
 const g=createGame('factors',7);command(g,'start');g.cells[g.player]=numeric(3);command(g,'eat');g.time=4100;g.score=35;
 const save=decode(encode(g,{score:40,patch:2}));
 expect(save?.game.cells[g.player]).toBeNull();expect(save?.game.time).toBe(4100);expect(save?.game.score).toBe(35);expect(save?.game.status).toBe('paused');expect(save?.best).toEqual({score:40,patch:2});
});
it('retains cleared and hurt states and rejects malformed, out-of-bounds or inconsistent saves',()=>{
 const g=createGame();g.status='hurt';g.lives=3;
 expect(decode(encode(g,{score:0,patch:0}))?.game.status).toBe('hurt');
 for(const raw of ['{','null','{}',JSON.stringify({version:99})])expect(decode(raw)).toBeNull();
 const data=JSON.parse(encode(g,{score:0,patch:0}));
 data.game.player=30;expect(decode(JSON.stringify(data))).toBeNull();data.game.player=14;
 data.game.cells[0]={label:'2',value:3};expect(decode(JSON.stringify(data))).toBeNull();
});
it('handles denied or full storage and uses a game-specific key',()=>{
 const unavailable={getItem:()=>{throw Error('denied');},setItem:()=>{throw Error('full');}};
 expect(readSave(unavailable)).toBeNull();expect(writeSave(unavailable,createGame(),{score:0,patch:0})).toBe(false);
 expect(SAVE_KEY).toBe('lumen-orchard.save.v1');
});
