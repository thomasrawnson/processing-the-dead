
(() => {
  const canvas = document.getElementById("office");
  const ctx = canvas.getContext("2d");

  const els = {
    authority: document.getElementById("authority"),
    processed: document.getElementById("processed"),
    spm: document.getElementById("spm"),
    efficiency: document.getElementById("efficiency"),
    time: document.getElementById("time"),
    phaseLabel: document.getElementById("phaseLabel"),
    manualValue: document.getElementById("manualValue"),
    processBtn: document.getElementById("processBtn"),
    automationNote: document.getElementById("automationNote"),
    nextName: document.getElementById("nextName"),
    nextDescription: document.getElementById("nextDescription"),
    nextCost: document.getElementById("nextCost"),
    targetTime: document.getElementById("targetTime"),
    progressFill: document.getElementById("progressFill"),
    buyBtn: document.getElementById("buyBtn"),
    choiceArea: document.getElementById("choiceArea"),
    dutyTitle: document.getElementById("dutyTitle"),
    dutyText: document.getElementById("dutyText"),
    metricManual: document.getElementById("metricManual"),
    metricPassive: document.getElementById("metricPassive"),
    metricWorkers: document.getElementById("metricWorkers"),
    metricQueue: document.getElementById("metricQueue"),
    notice: document.getElementById("notice"),
    milestoneBanner: document.getElementById("milestoneBanner"),
    endScreen: document.getElementById("endScreen"),
    endTime: document.getElementById("endTime"),
    endSouls: document.getElementById("endSouls"),
    endSpm: document.getElementById("endSpm"),
    endEfficiency: document.getElementById("endEfficiency"),
    summary: document.getElementById("summary"),
    restartBtn: document.getElementById("restartBtn"),

    bottleneckName: document.getElementById("bottleneckName"),
    walkBar: document.getElementById("walkBar"),
    intakeBar: document.getElementById("intakeBar"),
    filingBar: document.getElementById("filingBar"),
    walkPct: document.getElementById("walkPct"),
    intakePct: document.getElementById("intakePct"),
    filingPct: document.getElementById("filingPct"),
    bottleneckDelta: document.getElementById("bottleneckDelta"),
    workerRoles: document.getElementById("workerRoles"),
    workerRoleRows: document.getElementById("workerRoleRows"),
    placementInfo: document.getElementById("placementInfo"),
    placementName: document.getElementById("placementName"),
    placementEffect: document.getElementById("placementEffect")
  };

  const milestones = [
    {
      id:"first_choice",
      type:"choice",
      cost:25,
      target:"~0:25",
      name:"First efficiency measure",
      description:"Choose how the department should stop wasting quite so much time.",
      options:[
        {
          id:"stamp",
          name:"Proper Rubber Stamp",
          description:"+1 manual Authority per soul. Satisfying thump included.",
          apply:s => { s.manualValue += 1; s.choiceFlags.stamp = true; }
        },
        {
          id:"intray",
          name:"Automatic In-Tray",
          description:"+1 Authority/sec. Paperwork now moves even while you supervise.",
          apply:s => { s.passiveRate += 1.0; s.choiceFlags.intray = true; }
        }
      ]
    },
    {
      id:"printer",
      type:"milestone",
      cost:70,
      target:"~1:00",
      name:"Department Printer",
      description:"Install a printer. Forms begin moving without direct supervision.",
      apply:s => { s.passiveRate += 0.6; s.unlocked.printer = true; }
    },
    {
      id:"second_choice",
      type:"choice",
      cost:90,
      target:"~1:30",
      name:"Automation decision",
      description:"Staff the office or improve the machinery.",
      options:[
        {
          id:"junior",
          name:"Hire Junior Clerk",
          description:"+1 worker and +1.2 Authority/sec. Understands roughly half the forms.",
          apply:s => {
            s.passiveRate += 1.2;
            s.workerCount += 1;
            s.choiceFlags.junior = true;
          }
        },
        {
          id:"motor",
          name:"Printer Motor Upgrade",
          description:"+0.7 Authority/sec and +1 manual Authority. Warranty void.",
          apply:s => {
            s.passiveRate += 0.7;
            s.manualValue += 1;
            s.choiceFlags.motor = true;
          }
        }
      ]
    },
    {
      id:"filing",
      type:"placement",
      cost:220,
      target:"~2:30",
      name:"Filing Cabinet",
      description:"Authorise the cabinet, then choose where it goes. Distance affects throughput.",
      apply:s => {
        s.passiveRate += 1.6;
        s.unlocked.filing = true;
      }
    },
    {
      id:"third_choice",
      type:"choice",
      cost:260,
      target:"~3:20",
      name:"Workflow expansion",
      description:"Remove another visible bottleneck.",
      options:[
        {
          id:"runner",
          name:"Office Runner",
          description:"+2.1 Authority/sec and +1 worker. Carries paper with alarming purpose.",
          apply:s => {
            s.passiveRate += 2.1;
            s.workerCount += 1;
            s.choiceFlags.runner = true;
          }
        },
        {
          id:"desk",
          name:"Second Processing Desk",
          description:"+1.1 Authority/sec and +2 manual Authority. More desk, more stamps.",
          apply:s => {
            s.passiveRate += 1.1;
            s.manualValue += 2;
            s.unlocked.desk2 = true;
          }
        }
      ]
    },
    {
      id:"tube",
      type:"milestone",
      cost:450,
      target:"~4:30",
      name:"Soul Tube",
      description:"Pneumatic afterlife transfer. The final approved expenditure.",
      apply:s => {
        s.passiveRate += 5.0;
        s.unlocked.tube = true;
      }
    }
  ];

  const notices = [
    "Please process the deceased in approximately the order received.",
    "The printer is not haunted. This has been checked twice.",
    "Tea breaks remain mandatory for the living.",
    "Forms without a death certificate may be submitted posthumously.",
    "Management reminds staff that eternity is not an excuse for lateness.",
    "Filing errors should be buried quietly and without ceremony."
  ];

  const filingPlacements = {
    nearDesk:{
      id:"nearDesk",
      name:"Beside the processing desks",
      effect:"Walking −24%. Best general throughput.",
      x:315, y:330,
      layoutBonus:1.18,
      walkingDelta:-24
    },
    nearIntake:{
      id:"nearIntake",
      name:"Beside Soul Intake",
      effect:"Intake congestion −18%. Better when queues are large.",
      x:720, y:335,
      layoutBonus:1.10,
      walkingDelta:-12
    },
    farWall:{
      id:"farWall",
      name:"Against the archive wall",
      effect:"Filing speed +30%, but clerks walk further.",
      x:160, y:330,
      layoutBonus:1.06,
      walkingDelta:-6
    }
  };

  const state = {
    authority:0,
    manualValue:1,
    passiveRate:0,
    processed:0,
    workerCount:1,
    milestoneIndex:0,
    startedAt:performance.now(),
    lastFrame:performance.now(),
    lastManualAt:0,
    finished:false,
    completed:[],
    choiceFlags:{},
    unlocked:{
      printer:false,
      filing:false,
      tube:false,
      desk2:false
    },
    filingPlacement:null,
    roleBonus:1,
    layoutBonus:1,
    soulQueue:2,
    nextSoulSpawn:0,
    recentProcessTimes:[],
    workers:[],
    souls:[],
    pops:[],
    officePulse:0,
    soulId:0,
    placementPending:false,
    lastBottleneckSnapshot:null
  };

  const stations = {
    intake:{x:880,y:500},
    desk1:{x:500,y:345},
    desk2:{x:610,y:345},
    printer:{x:310,y:165},
    filing:{x:160,y:330},
    tube:{x:120,y:110},
    exit:{x:55,y:90}
  };

  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function elapsed(){ return (performance.now()-state.startedAt)/1000; }
  function formatTime(s){
    s=Math.max(0,Math.floor(s));
    return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  }

  function effectivePassive(){
    return state.passiveRate * state.roleBonus * state.layoutBonus;
  }

  function currentMilestone(){
    return milestones[state.milestoneIndex] || null;
  }

  function showBanner(text){
    els.milestoneBanner.textContent = text;
    els.milestoneBanner.classList.add("on");
    clearTimeout(showBanner.timer);
    showBanner.timer = setTimeout(() => els.milestoneBanner.classList.remove("on"), 2100);
  }

  function addPop(x,y,text,big=false){
    state.pops.push({x,y,text,life:1,big});
  }

  function addSoul(){
    if(state.souls.length > 18) return;
    const lane = state.soulId++ % 4;
    state.souls.push({
      x:900 + lane*8,
      y:480 - lane*24,
      targetX:810 - lane*18,
      targetY:480 - lane*24,
      alpha:.85,
      size:10 + (lane%2)*2
    });
  }

  function seedWorkers(){
    while(state.workers.length < state.workerCount){
      const i=state.workers.length;
      state.workers.push({
        id:i,
        name:i===0 ? "Clerk Graham" : i===1 ? "Junior Clerk" : "Office Runner",
        role:i===0 ? "processing" : i===1 ? "intake" : "filing",
        x:500 + i*24,
        y:400 + i*10,
        speed:54 + i*4,
        routeIndex:0,
        carrying:false,
        bob:Math.random()*Math.PI*2
      });
    }
  }

  function recomputeRoleBonus(){
    if(state.workers.length < 2){
      state.roleBonus = 1;
      return;
    }
    const roles = state.workers.map(w => w.role);
    const unique = new Set(roles);
    let bonus = 1;

    if(unique.has("intake")) bonus += .05;
    if(unique.has("processing")) bonus += .05;
    if(unique.has("filing") && state.unlocked.filing) bonus += .05;
    if(unique.size >= 2) bonus += .08;
    if(unique.size >= 3) bonus += .07;

    state.roleBonus = bonus;
  }

  function workerRoute(worker){
    const filing = state.filingPlacement
      ? {x:filingPlacements[state.filingPlacement].x, y:filingPlacements[state.filingPlacement].y}
      : stations.filing;

    if(worker.role === "intake"){
      return [stations.intake, stations.desk1];
    }

    if(worker.role === "filing"){
      const route = [stations.desk1];
      if(state.unlocked.filing) route.push(filing);
      if(state.unlocked.tube) route.push(stations.tube);
      else route.push(stations.exit);
      return route;
    }

    const route = [stations.desk1];
    if(state.unlocked.printer) route.push(stations.printer);
    if(state.unlocked.filing) route.push(filing);
    if(state.unlocked.tube) route.push(stations.tube);
    else route.push(stations.exit);
    return route;
  }

  function completeAutomatedSoul(worker){
    const value = Math.max(1, effectivePassive() * 0.62);
    state.processed += 1;
    state.recentProcessTimes.push(elapsed());
    addPop(worker.x, worker.y-18, `+${Math.max(1,Math.round(value))}`);
    state.officePulse = 1;
  }

  function updateWorkers(dt){
    seedWorkers();
    recomputeRoleBonus();

    for(const w of state.workers){
      const route = workerRoute(w);
      if(w.routeIndex >= route.length) w.routeIndex = 0;
      const target = route[w.routeIndex % route.length];
      const dx = target.x - w.x;
      const dy = target.y - w.y;
      const d = Math.hypot(dx,dy);

      if(d < 7){
        const reached = w.routeIndex % route.length;

        if(w.role === "intake" && reached === 0){
          w.carrying = true;
          if(state.souls.length) state.souls.shift();
        } else if(w.role !== "filing" && reached === 0){
          w.carrying = true;
        }

        if(reached === route.length-1){
          w.carrying = false;
          completeAutomatedSoul(w);
        }

        w.routeIndex = (w.routeIndex + 1) % route.length;
      } else {
        const speedBonus = w.role==="intake" ? 1.06 : w.role==="filing" ? 1.04 : 1;
        const step = Math.min(d, w.speed * speedBonus * dt);
        w.x += dx/d * step;
        w.y += dy/d * step;
        w.bob += dt*8;
      }
    }
  }

  function updateSouls(dt){
    state.nextSoulSpawn -= dt;
    if(state.nextSoulSpawn <= 0){
      addSoul();
      state.nextSoulSpawn = clamp(2.8 - state.milestoneIndex*.28, .9, 2.8);
    }

    for(const s of state.souls){
      s.x += (s.targetX - s.x) * Math.min(1,dt*2.5);
      s.y += (s.targetY - s.y) * Math.min(1,dt*2.5);
    }

    state.soulQueue = state.souls.length;
  }

  function updatePops(dt){
    for(const p of state.pops){
      p.y -= 30*dt;
      p.life -= dt*1.15;
    }
    state.pops = state.pops.filter(p => p.life > 0);
  }

  function getSpm(){
    const cutoff = elapsed()-30;
    state.recentProcessTimes = state.recentProcessTimes.filter(t => t >= cutoff);
    return Math.round(state.recentProcessTimes.length*2);
  }

  function efficiency(){
    return Math.round((state.manualValue + effectivePassive()) * 100);
  }

  function bottlenecks(){
    let walking = 48;
    let intake = 32;
    let filing = 20;

    if(state.unlocked.printer){
      walking += 8;
      intake -= 4;
    }

    if(state.workerCount >= 2){
      const roles = state.workers.map(w => w.role);
      if(roles.includes("intake")) intake -= 12;
      if(roles.includes("processing")) walking -= 7;
      if(roles.includes("filing")) filing -= 12;
    }

    if(state.unlocked.filing){
      filing += 18;
      walking += 5;
    }

    if(state.filingPlacement){
      const p = filingPlacements[state.filingPlacement];
      walking += p.walkingDelta;

      if(state.filingPlacement === "nearIntake") intake -= 10;
      if(state.filingPlacement === "farWall") filing -= 16;
      if(state.filingPlacement === "nearDesk") filing -= 8;
    }

    if(state.choiceFlags.runner){
      walking -= 18;
      filing -= 4;
    }

    if(state.unlocked.desk2){
      intake += 3;
      walking -= 8;
    }

    walking = clamp(walking,8,72);
    intake = clamp(intake,8,72);
    filing = clamp(filing,8,72);

    const total = walking+intake+filing;
    walking = Math.round(walking/total*100);
    intake = Math.round(intake/total*100);
    filing = 100-walking-intake;

    const entries = [
      ["Walking",walking],
      ["Intake",intake],
      ["Filing",filing]
    ].sort((a,b)=>b[1]-a[1]);

    return {walking,intake,filing,primary:entries[0][0],primaryPct:entries[0][1]};
  }

  function renderBottlenecks(){
    const b = bottlenecks();
    els.bottleneckName.textContent = b.primary;
    els.walkPct.textContent = `${b.walking}%`;
    els.intakePct.textContent = `${b.intake}%`;
    els.filingPct.textContent = `${b.filing}%`;
    els.walkBar.style.width = `${b.walking}%`;
    els.intakeBar.style.width = `${b.intake}%`;
    els.filingBar.style.width = `${b.filing}%`;

    let message = "";
    if(b.primary === "Walking"){
      message = "Biggest waste: clerks walking between stations.";
    } else if(b.primary === "Intake"){
      message = "Biggest waste: new souls are waiting before work begins.";
    } else {
      message = "Biggest waste: completed cases are backing up at filing.";
    }

    if(state.lastBottleneckSnapshot){
      const old = state.lastBottleneckSnapshot;
      const delta = old[b.primary.toLowerCase()] - b[b.primary.toLowerCase()];
      if(delta >= 5){
        message = `${b.primary} waste improved by ${delta} points after your last change.`;
      }
    }

    els.bottleneckDelta.textContent = message;
  }

  function renderWorkerRoles(){
    seedWorkers();

    if(state.workers.length < 2){
      els.workerRoles.classList.add("hidden");
      return;
    }

    els.workerRoles.classList.remove("hidden");
    els.workerRoleRows.innerHTML = "";

    state.workers.forEach(worker => {
      const row = document.createElement("div");
      row.className = "worker-role-row";

      const label = document.createElement("span");
      label.textContent = worker.name;

      const select = document.createElement("select");
      [
        ["intake","Intake"],
        ["processing","Processing"],
        ["filing","Filing"]
      ].forEach(([value,text])=>{
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        if(worker.role === value) option.selected = true;
        select.appendChild(option);
      });

      select.addEventListener("change", () => {
        state.lastBottleneckSnapshot = bottlenecks();
        worker.role = select.value;
        worker.routeIndex = 0;
        recomputeRoleBonus();
        showBanner(`${worker.name.toUpperCase()} → ${select.value.toUpperCase()}`);
        addPop(worker.x, worker.y-30, `EFFICIENCY x${state.roleBonus.toFixed(2)}`, true);
        renderBottlenecks();
      });

      row.append(label,select);
      els.workerRoleRows.appendChild(row);
    });
  }

  function renderPlacementInfo(){
    if(!state.filingPlacement){
      els.placementInfo.classList.add("hidden");
      return;
    }

    const p = filingPlacements[state.filingPlacement];
    els.placementInfo.classList.remove("hidden");
    els.placementName.textContent = p.name;
    els.placementEffect.textContent = p.effect;
  }

  function renderPlacementChoices(next){
    els.choiceArea.classList.remove("hidden");
    els.buyBtn.classList.add("hidden");

    if(els.choiceArea.dataset.forId === "placement") return;
    els.choiceArea.dataset.forId = "placement";
    els.choiceArea.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "placement-choice";

    Object.values(filingPlacements).forEach(p => {
      const card = document.createElement("div");
      card.className = "placement-option";

      const title = document.createElement("b");
      title.textContent = p.name;

      const desc = document.createElement("p");
      desc.textContent = p.effect;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "PLACE CABINET HERE";
      btn.addEventListener("click", () => chooseFilingPlacement(p.id));

      card.append(title,desc,btn);
      wrap.appendChild(card);
    });

    els.choiceArea.appendChild(wrap);
  }

  function updateUI(){
    const next = currentMilestone();
    const spm = getSpm();

    els.authority.textContent = Math.floor(state.authority);
    els.processed.textContent = state.processed;
    els.spm.textContent = spm;
    els.efficiency.textContent = `${efficiency()}%`;
    els.time.textContent = formatTime(elapsed());

    els.manualValue.textContent = `+${state.manualValue} Authority`;
    els.metricManual.textContent = `+${state.manualValue}`;
    els.metricPassive.textContent = `${effectivePassive().toFixed(1)}/s`;
    els.metricWorkers.textContent = state.workerCount;
    els.metricQueue.textContent = state.soulQueue;

    if(effectivePassive() > 0){
      els.automationNote.classList.remove("hidden");
      els.dutyTitle.textContent = "Supervise the growing operation";
      els.dutyText.textContent = "The office is processing souls automatically. Keep clicking when you want to accelerate the next upgrade.";
    }

    if(state.milestoneIndex >= 1) els.phaseLabel.textContent = "THE OFFICE IS BEGINNING TO FUNCTION. THIS IS NOT YET CAUSE FOR ALARM.";
    if(state.milestoneIndex >= 3) els.phaseLabel.textContent = "THROUGHPUT RISING. WALKING DISTANCES FALLING. MORALE UNCHANGED.";
    if(state.milestoneIndex >= 5) els.phaseLabel.textContent = "FINAL BOTTLENECK IDENTIFIED: PHYSICAL REALITY.";

    renderBottlenecks();
    renderWorkerRoles();
    renderPlacementInfo();

    if(!next) return;

    els.nextName.textContent = next.name;
    els.nextDescription.textContent = next.description;
    els.nextCost.textContent = next.cost;
    els.targetTime.textContent = `Target ${next.target}`;
    els.progressFill.style.width = `${clamp(state.authority/next.cost*100,0,100)}%`;

    if(next.type === "choice" && state.authority >= next.cost){
      els.choiceArea.classList.remove("hidden");
      els.buyBtn.classList.add("hidden");

      if(els.choiceArea.dataset.forId !== next.id){
        els.choiceArea.dataset.forId = next.id;
        els.choiceArea.innerHTML = "";

        next.options.forEach(option => {
          const card = document.createElement("div");
          card.className = "choice-card";

          const title = document.createElement("b");
          title.textContent = option.name;

          const desc = document.createElement("p");
          desc.textContent = option.description;

          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "choice-btn";
          btn.textContent = `AUTHORISE ${option.name.toUpperCase()}`;
          btn.addEventListener("click", () => buyChoice(option));

          card.append(title, desc, btn);
          els.choiceArea.appendChild(card);
        });
      }
    } else if(next.type === "placement" && state.placementPending){
      renderPlacementChoices(next);
    } else {
      els.choiceArea.classList.add("hidden");
      els.buyBtn.classList.remove("hidden");

      const remaining = Math.max(0, Math.ceil(next.cost-state.authority));
      els.buyBtn.disabled = state.authority < next.cost;
      els.buyBtn.textContent = state.authority >= next.cost
        ? `AUTHORISE ${next.name.toUpperCase()}`
        : `${remaining} AUTHORITY TO GO`;
    }
  }

  function buyChoice(option){
    const next = currentMilestone();
    if(!next || next.type !== "choice" || state.authority < next.cost) return;

    state.lastBottleneckSnapshot = bottlenecks();
    state.authority -= next.cost;
    option.apply(state);
    seedWorkers();
    recomputeRoleBonus();

    state.completed.push({name:option.name, at:elapsed()});
    state.milestoneIndex += 1;

    els.choiceArea.dataset.forId = "";

    showBanner(`${option.name} AUTHORISED`);
    els.notice.textContent = option.description;
    addPop(520,110,`OFFICE EFFICIENCY x${(efficiency()/100).toFixed(1)}`,true);
    updateUI();
  }

  function buyMilestone(){
    const next = currentMilestone();
    if(!next || state.authority < next.cost) return;

    if(next.type === "placement"){
      state.lastBottleneckSnapshot = bottlenecks();
      state.authority -= next.cost;
      next.apply(state);
      state.placementPending = true;

      showBanner("FILING CABINET AUTHORISED — CHOOSE A POSITION");
      els.notice.textContent = "Facilities require you to decide where the cabinet actually goes.";
      updateUI();
      return;
    }

    if(next.type !== "milestone") return;

    state.lastBottleneckSnapshot = bottlenecks();
    state.authority -= next.cost;
    next.apply(state);

    state.completed.push({name:next.name, at:elapsed()});
    state.milestoneIndex += 1;

    showBanner(`${next.name.toUpperCase()} INSTALLED`);
    addPop(520,110,`THROUGHPUT +${Math.max(20,Math.round(effectivePassive()*22))}%`,true);

    if(next.id === "printer"){
      els.notice.textContent = "The printer coughs into life. Nobody remembers ordering toner.";
    } else if(next.id === "tube"){
      els.notice.textContent = "Pneumatic eternity transfer authorised. Stand clear.";
      setTimeout(finish, 1800);
    }

    updateUI();
  }

  function chooseFilingPlacement(id){
    const next = currentMilestone();
    if(!next || next.id !== "filing" || !state.placementPending) return;

    state.filingPlacement = id;
    state.layoutBonus = filingPlacements[id].layoutBonus;
    state.placementPending = false;
    state.completed.push({
      name:`Filing Cabinet — ${filingPlacements[id].name}`,
      at:elapsed()
    });
    state.milestoneIndex += 1;

    els.choiceArea.dataset.forId = "";
    showBanner(`CABINET PLACED — ${filingPlacements[id].name.toUpperCase()}`);
    els.notice.textContent = filingPlacements[id].effect;
    addPop(filingPlacements[id].x, filingPlacements[id].y-90, `WALKING ${filingPlacements[id].walkingDelta}%`, true);

    updateUI();
  }

  function manualProcess(){
    if(state.finished) return;

    const now = performance.now();
    if(now - state.lastManualAt < 70) return;
    state.lastManualAt = now;

    state.authority += state.manualValue;
    state.processed += 1;
    state.recentProcessTimes.push(elapsed());

    if(state.souls.length) state.souls.shift();

    addPop(515,340,`+${state.manualValue}`);
    state.officePulse = 1;
    updateUI();
  }

  function finish(){
    if(state.finished) return;
    state.finished = true;

    const finalSpm = getSpm();
    els.endTime.textContent = formatTime(elapsed());
    els.endSouls.textContent = state.processed;
    els.endSpm.textContent = finalSpm;
    els.endEfficiency.textContent = `${efficiency()}%`;

    const lines = [
      "PROCESSING THE DEAD — PLAYTEST SUMMARY",
      `Completion time: ${formatTime(elapsed())}`,
      `Souls processed: ${state.processed}`,
      `Final souls/min: ${finalSpm}`,
      `Final office efficiency: ${efficiency()}%`,
      `Final bottleneck: ${bottlenecks().primary}`,
      "",
      "AUTHORISATIONS"
    ];

    state.completed.forEach(item => {
      lines.push(`${formatTime(item.at)}  ${item.name}`);
    });

    if(state.workers.length >= 2){
      lines.push("","FINAL CLERK ASSIGNMENTS");
      state.workers.forEach(w => lines.push(`${w.name}: ${w.role}`));
    }

    lines.push(
      "",
      "ASK AFTER PLAYING:",
      "1. Which prototype did you prefer overall?",
      "2. What moment made the office feel most satisfying?",
      "3. Was anything confusing without explanation?",
      "4. Did worker roles / bottlenecks make your choices feel meaningful?"
    );

    els.summary.textContent = lines.join("\n");
    els.endScreen.classList.remove("hidden");
  }

  function drawRoom(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#5c6258";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle = "rgba(25,28,24,.16)";
    ctx.lineWidth = 1;
    for(let x=0;x<canvas.width;x+=40){
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke();
    }
    for(let y=0;y<canvas.height;y+=40){
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke();
    }

    ctx.fillStyle = "#493d34";
    ctx.fillRect(0,450,canvas.width,150);

    ctx.fillStyle = "#2e332e";
    ctx.fillRect(0,0,canvas.width,18);
    ctx.fillRect(0,0,18,canvas.height);
    ctx.fillRect(canvas.width-18,0,18,canvas.height);

    ctx.fillStyle = "#d0c8ae";
    ctx.strokeStyle = "#2d312a";
    ctx.lineWidth = 3;
    ctx.fillRect(46,30,230,62);
    ctx.strokeRect(46,30,230,62);

    ctx.fillStyle = "#343832";
    ctx.font = "bold 15px monospace";
    ctx.fillText("DEPARTMENT 42-B",62,55);
    ctx.font = "11px monospace";
    ctx.fillText("NO UNAUTHORISED HAUNTING",62,75);

    drawIntake();
    drawDesk(stations.desk1.x,stations.desk1.y,false);

    if(state.unlocked.desk2){
      drawDesk(stations.desk2.x,stations.desk2.y,true);
    }
    if(state.unlocked.printer){
      drawPrinter();
    }
    if(state.unlocked.filing){
      drawFiling();
    }
    if(state.unlocked.tube){
      drawTube();
    }

    drawQueue();
    drawWorkers();
    drawPops();

    if(state.officePulse > 0){
      ctx.fillStyle = `rgba(221,232,179,${state.officePulse*.08})`;
      ctx.fillRect(0,0,canvas.width,canvas.height);
      state.officePulse = Math.max(0,state.officePulse-.025);
    }
  }

  function drawIntake(){
    ctx.fillStyle = "#343934";
    ctx.fillRect(825,410,105,150);
    ctx.strokeStyle = "#171a17";
    ctx.lineWidth = 4;
    ctx.strokeRect(825,410,105,150);

    ctx.fillStyle = "#c8c0a6";
    ctx.font = "bold 11px monospace";
    ctx.fillText("SOUL",854,436);
    ctx.fillText("INTAKE",842,451);
  }

  function drawDesk(x,y,second){
    ctx.fillStyle = second ? "#715642" : "#664b3a";
    ctx.strokeStyle = "#2a201b";
    ctx.lineWidth = 4;
    ctx.fillRect(x-70,y-35,140,70);
    ctx.strokeRect(x-70,y-35,140,70);

    ctx.fillStyle = "#d4ccb3";
    ctx.fillRect(x-48,y-18,46,28);
    ctx.fillRect(x+8,y-13,36,23);

    ctx.fillStyle = "#242821";
    ctx.font = "10px monospace";
    ctx.fillText(second ? "DESK 2" : "DESK 1",x-23,y+54);
  }

  function drawPrinter(){
    const x=stations.printer.x, y=stations.printer.y;
    ctx.fillStyle="#a7aaa0";
    ctx.strokeStyle="#30342f";
    ctx.lineWidth=4;
    ctx.fillRect(x-48,y-30,96,62);
    ctx.strokeRect(x-48,y-30,96,62);

    ctx.fillStyle="#d9d2b9";
    ctx.fillRect(x-32,y-49,64,25);
    ctx.strokeRect(x-32,y-49,64,25);

    ctx.fillStyle="#444941";
    ctx.font="bold 10px monospace";
    ctx.fillText("PRINTER",x-24,y+5);

    const p = (performance.now()/350)%1;
    ctx.fillStyle=`rgba(221,214,190,${.4+.5*p})`;
    ctx.fillRect(x-28,y+28,56,18+14*p);
  }

  function drawFiling(){
    const p = state.filingPlacement ? filingPlacements[state.filingPlacement] : filingPlacements.farWall;
    const x=p.x, y=p.y;

    ctx.fillStyle="#777f73";
    ctx.strokeStyle="#30342e";
    ctx.lineWidth=4;
    ctx.fillRect(x-45,y-82,90,164);
    ctx.strokeRect(x-45,y-82,90,164);

    for(let i=0;i<3;i++){
      const yy=y-61+i*52;
      ctx.strokeRect(x-33,yy,66,38);
      ctx.fillStyle="#c8c0a5";
      ctx.fillRect(x-12,yy+9,24,8);
      ctx.fillStyle="#777f73";
    }

    ctx.fillStyle="#22261f";
    ctx.font="9px monospace";
    ctx.fillText("CABINET 42-F",x-32,y+100);
  }

  function drawTube(){
    const x=stations.tube.x, y=stations.tube.y;
    ctx.strokeStyle="#8ea99a";
    ctx.lineWidth=18;
    ctx.beginPath();
    ctx.moveTo(x,y+190);
    ctx.lineTo(x,y);
    ctx.lineTo(360,y);
    ctx.stroke();

    ctx.strokeStyle="#394740";
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(x,y+190);
    ctx.lineTo(x,y);
    ctx.lineTo(360,y);
    ctx.stroke();

    ctx.fillStyle="#dceadf";
    ctx.font="bold 11px monospace";
    ctx.fillText("SOUL TUBE",155,83);

    const pulse=(performance.now()/450)%1;
    ctx.fillStyle=`rgba(217,239,225,${1-pulse})`;
    ctx.beginPath();
    ctx.arc(x,y+150-pulse*145,10-pulse*3,0,Math.PI*2);
    ctx.fill();
  }

  function drawQueue(){
    for(const s of state.souls){
      ctx.save();
      ctx.globalAlpha=s.alpha;
      ctx.fillStyle="#d9eee3";
      ctx.shadowColor="#d2eadc";
      ctx.shadowBlur=9;
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
      ctx.fill();
      ctx.fillRect(s.x-s.size*.65,s.y,s.size*1.3,s.size*1.35);
      ctx.restore();
    }
  }

  function drawWorkers(){
    state.workers.forEach((w,i)=>{
      ctx.save();
      ctx.translate(w.x,w.y+Math.sin(w.bob)*2);

      ctx.fillStyle=i===0 ? "#c1b06d" : i===1 ? "#879f86" : "#967e6c";
      ctx.strokeStyle="#252923";
      ctx.lineWidth=3;

      ctx.beginPath();
      ctx.arc(0,-13,9,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();

      ctx.fillRect(-8,-4,16,21);
      ctx.strokeRect(-8,-4,16,21);

      ctx.beginPath();
      ctx.moveTo(-5,17); ctx.lineTo(-9,28);
      ctx.moveTo(5,17); ctx.lineTo(9,28);
      ctx.stroke();

      if(w.carrying){
        ctx.fillStyle="#ddd5bb";
        ctx.fillRect(10,-7,18,13);
        ctx.strokeRect(10,-7,18,13);
      }

      ctx.fillStyle="#e8e0c4";
      ctx.strokeStyle="#2d3129";
      ctx.lineWidth=2;
      ctx.font="bold 8px monospace";
      ctx.textAlign="center";
      const tag = w.role==="processing" ? "PROCESS" : w.role.toUpperCase();
      ctx.strokeText(tag,0,42);
      ctx.fillText(tag,0,42);
      ctx.textAlign="left";

      ctx.restore();
    });
  }

  function drawPops(){
    state.pops.forEach(p=>{
      ctx.save();
      ctx.globalAlpha=clamp(p.life,0,1);
      ctx.textAlign="center";
      ctx.font=p.big ? "bold 24px monospace" : "bold 18px monospace";
      ctx.fillStyle=p.big ? "#f0e6a4" : "#f6f1d2";
      ctx.strokeStyle="#2c3029";
      ctx.lineWidth=4;
      ctx.strokeText(p.text,p.x,p.y);
      ctx.fillText(p.text,p.x,p.y);
      ctx.restore();
    });
    ctx.textAlign="left";
  }

  function frame(now){
    const dt = Math.min(.05,(now-state.lastFrame)/1000);
    state.lastFrame=now;

    if(!state.finished){
      state.authority += effectivePassive() * dt;
      updateSouls(dt);
      updateWorkers(dt);
      updatePops(dt);
      updateUI();

      if(Math.floor(elapsed()) % 28 === 0 && Math.random() < .012){
        els.notice.textContent = notices[Math.floor(Math.random()*notices.length)];
      }
    }

    drawRoom();
    requestAnimationFrame(frame);
  }

  els.processBtn.addEventListener("click", manualProcess);
  els.buyBtn.addEventListener("click", buyMilestone);
  els.restartBtn.addEventListener("click", () => location.reload());

  for(let i=0;i<3;i++) addSoul();
  seedWorkers();
  updateUI();
  requestAnimationFrame(frame);
})();
