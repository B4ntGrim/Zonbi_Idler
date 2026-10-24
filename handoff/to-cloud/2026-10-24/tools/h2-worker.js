// Parallel worker for the H2 full matrix: same runOne, same seeds; worker k of n runs every n-th combination.
const path=require('path'),fs=require('fs');
const [root,k,n]=[process.argv[2],+process.argv[3],+process.argv[4]];
const h2=require(path.join(root,'tools/sim-harness/h2.js'));
const out=path.join(root,'reports','sim-harness-v1','full');fs.mkdirSync(out,{recursive:true});
const src=h2.loadSrc(root);let i=0;
for(const start of h2.CFG.starts)for(const policy of h2.CFG.policies)for(const seed of h2.CFG.seeds){
  if((i++)%n!==k)continue;
  const f=path.join(out,`${start}_${policy}_${seed}.json`);if(fs.existsSync(f))continue;
  const t=Date.now();const r=h2.runOne(src,{start,policy,seed,days:h2.CFG.days});r.wallMs=Date.now()-t;
  fs.writeFileSync(f,JSON.stringify(r,null,1));
  console.log(start,policy,seed,r.result,'firstDowning',r.firstDowningDay,'wall',r.wallMs+'ms');
}
console.log('worker done',k);
