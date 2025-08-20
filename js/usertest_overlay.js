

(function(){
  const NS = "museum_usertest_v1";

  const ls = localStorage;

  const now = () => new Date().toISOString();

  function load(key, fb){ try{ return JSON.parse(ls.getItem(key)||"") || fb; } catch(e){ return fb; } }

function save(key, v){ ls.setItem(key, JSON.stringify(v)); }

  const TASKS = [
    { id:"T1", name:"Find the price of any souvenir item", page_hint:"/html/shop.html" },

    { id:"T2", name:"Open an item modal from Collections > Histories and close it with × and Esc", page_hint:"/html/collections.html#histories" },

    { id:"T3", name:"Add any item to the cart, then remove it", page_hint:"/html/shop.html" }
  ];

  const key = NS+"_runs";
  const runs = load(key, []);
  let current = null;

  function startTask(tid){
    if(current) return;
    const task = TASKS.find(t=>t.id===tid);
    current = { task: task.id, name: task.name, start: now(), end:null, success:null, notes:"", page: location.pathname+location.hash };
    save(key, runs.concat([]));
    draw();
  }

function stopTask(success){
    if(!current) return;
    current.end = now();
    current.success = !!success;
    runs.push(current);
    save(key, runs);
    current = null;
    draw();
  }

function exportCSV(){
    const rows = [["ts_start","ts_end","task_id","task_name","page","success","time_sec","notes"]];
    runs.forEach(r=>{
      const t = (new Date(r.end) - new Date(r.start)) / 1000;
      rows.push([r.start, r.end, r.task, r.name, r.page || "", r.success?"1":"0", String(Math.round(t)), r.notes||""]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type: "text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "usertest_results.csv"; a.click();
    URL.revokeObjectURL(url);
  }

function clearRuns(){ ls.removeItem(key); draw(); }
let root;

  function draw(){
    if(!root) return;

    root.innerHTML = "";
    const box = document.createElement("div");

    box.classList.add("ux-sT01");

    box.innerHTML = `<div class="ux-s01">
      <strong>Usability Test (15m)</strong>
      <button id="ux_close" class="ux-s02">✕</button>
    </div>
    <div id="ux_tasks"></div>
    <div class="ux-s03">
      <button id="ux_export" class="ux-s04">Export CSV</button>
      <button id="ux_clear" class="ux-s05">Clear</button>
    </div>`;

    const tasksEl = box.querySelector("#ux_tasks");
    const list = document.createElement("div");
    TASKS.forEach(t=>{
      const row = document.createElement("div");

      row.classList.add("ux-sT02");
      const running = current && current.task===t.id;

      row.innerHTML = `<div class="ux-s06">
        <div>
          <div class="ux-s07">${t.id}: ${t.name}</div>
          <div class="ux-s08">${t.page_hint}</div>
        </div>
        <div>
          ${running ?
            '<button data-stop="1" class="ux-s09">Stop ✓</button> '+
            '<button data-stop="0" class="ux-s10">Stop ✕</button>' :
            '<button data-start="'+t.id+'" class="ux-s11">Start</button>'}
        </div>
      </div>`;
      list.appendChild(row);
    });
    tasksEl.appendChild(list);

    const close = box.querySelector("#ux_close");
    close.onclick = () => { root.remove(); root=null; };

    box.querySelector("#ux_export").onclick = exportCSV;
    box.querySelector("#ux_clear").onclick = clearRuns;

    box.querySelectorAll("[data-start]").forEach(btn=>{

btn.addEventListener("click", ()=> startTask(btn.getAttribute("data-start")));
    });
    box.querySelectorAll("[data-stop]").forEach(btn=>{

btn.addEventListener("click", ()=> stopTask(btn.getAttribute("data-stop")==="1"));
    });

    root.appendChild(box);
  }

  function toggle(){
    if(root){ root.remove(); root=null; return; }
    root = document.createElement("div"); document.body.appendChild(root); draw();
  }

document.addEventListener("keydown", (e)=>{ if(e.ctrlKey && e.shiftKey && e.code==="KeyL"){ toggle(); } });

  window.uxTest = { toggle, export: ()=>exportCSV(), clear: clearRuns };
})();
