return (async () => {
const code=await readFile('game/activity-feed.js'), store={}, rows=[];
let xp={}, stash=[], character=0, wallet={T0:0}, now=0;
const Z={SETTINGS_DEFAULTS:{},clockNow:()=>now,getSettings(){return {...this.SETTINGS_DEFAULTS,...this.settings}},settings:{},getStatXp:()=>xp,getCharacterXp:()=>character,getRmatHoldings:()=>wallet,getComponents:()=>({}),getStash:()=>stash,getGearItem:id=>({name:id}),SAVE_ACTIVE_KEY:'active'};
new Function('window','localStorage',code)({ZI:Z},{getItem:k=>store[k]||null});
const A=Z.ActivityFeed,check=(n,v)=>rows.push([v?'PASS':'FAIL',n]);
A.sample();check('first sample does not claim existing balances as gains',A.entries.length===0);
xp={foraging:5};stash=['food'];character=3;wallet.T0=2;A.sample();
check('profession, experience, wallet and inventory gains are captured',A.entries.length===4);
check('exact amounts hidden by default',!A.text(A.entries[0]).includes('+5'));
Z.settings.activityNumbers=true;check('exact amounts opt in',A.text(A.entries[0]).includes('+5'));
Z.settings.activityProfession=false;check('category filter',!A.visible().some(e=>e.category==='profession'));
Z.settings.activityCompanionsOnly=true;A.push('profession','smithing XP',2,'Companion: Latch');check('source filter',A.visible().length===0);Z.settings.activityProfession=true;check('companion source preserved',A.visible().length===1);
A.push('profession','smithing XP',3,'Companion: Latch');check('matching gains combine',A.entries.at(-1).amount===5);
store.active='solo2';A.sample();check('slot switch clears prior activity',A.entries.length===0);
check('display does not mutate economy',xp.foraging===5&&stash.length===1&&wallet.T0===2);
return rows;
})();
