
const paths = {
  stamp_junior_runner: [
    {name:"Rubber Stamp", cost:25, manual:2, passive:0},
    {name:"Printer", cost:70, manual:2, passive:.6},
    {name:"Junior Clerk", cost:90, manual:2, passive:1.8},
    {name:"Filing Cabinet", cost:220, manual:2, passive:3.4},
    {name:"Office Runner", cost:260, manual:2, passive:5.5},
    {name:"Soul Tube", cost:450, manual:2, passive:10.5},
  ],
  intray_motor_desk: [
    {name:"Automatic In-Tray", cost:25, manual:1, passive:1},
    {name:"Printer", cost:70, manual:1, passive:1.6},
    {name:"Printer Motor", cost:90, manual:2, passive:2.3},
    {name:"Filing Cabinet", cost:220, manual:2, passive:3.9},
    {name:"Second Desk", cost:260, manual:4, passive:5.0},
    {name:"Soul Tube", cost:450, manual:4, passive:10.0},
  ]
};

function simulate(path, clicksPerSecond=1){
  let authority=0, t=0, manual=1, passive=0, previous=0;
  const result=[];

  for(const step of path){
    while(authority < step.cost){
      authority += (manual*clicksPerSecond + passive) * .05;
      t += .05;
      if(t>1000) throw new Error("simulation runaway");
    }
    const gap=t-previous;
    authority -= step.cost;
    manual=step.manual;
    passive=step.passive;
    result.push({name:step.name,t,gap,manual,passive});
    previous=t;
  }
  return result;
}

for(const [name,path] of Object.entries(paths)){
  const result=simulate(path,1);
  console.log(`\n${name}`);
  for(const r of result){
    console.log(`${r.name.padEnd(20)} ${r.t.toFixed(1).padStart(6)}s   gap ${r.gap.toFixed(1).padStart(5)}s`);
  }
  const tube=result[result.length-1];
  if(tube.t < 210 || tube.t > 330){
    throw new Error(`${name}: Soul Tube pacing out of range: ${tube.t.toFixed(1)}s`);
  }
  if(Math.max(...result.map(x=>x.gap)) > 70){
    throw new Error(`${name}: affordability gap too long`);
  }
}
console.log("\nPASS — both representative build paths finish in the intended ~4–5 minute window for a one-click/sec baseline.");
