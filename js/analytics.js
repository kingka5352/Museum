

(function(){
  const NS = "museum_analytics_v1";

  const now = () => new Date().toISOString();

  const ls = window.localStorage;

  function uuid(){ return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16)); }
  let vid = ls.getItem(NS+"_vid");
  if(!vid){ vid = uuid(); ls.setItem(NS+"_vid", vid); }

function load(key, fallback){ try{ return JSON.parse(ls.getItem(key) || "") || fallback; }catch(e){ return fallback; } }

function save(key, obj){ ls.setItem(key, JSON.stringify(obj)); }

  const eventsKey = NS+"_events";
  const events = load(eventsKey, []);

  function push(ev){ events.push(ev); save(eventsKey, events); }
push({t:"pageview", ts: now(), vid, path: location.pathname + location.search, title: document.title});

  window.addEventListener("beforeunload", function(){
    try{ push({t:"exit", ts: now(), vid, path: location.pathname}); }catch(e){}
  });

  document.addEventListener("click", function(e){
    const a = e.target.closest("a,button,[role='button']");
    if(!a) return;
    const role = a.closest("nav") ? "nav" : "ui";
    const txt = (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0,120);
    const idc = a.id ? "#"+a.id : "";
    const cls = a.className ? "."+String(a.className).split(/\s+/).join(".") : "";
    push({t:"click", ts: now(), vid, path: location.pathname, role, sel: a.tagName+idc+cls, txt});

    if(/add to cart/i.test(txt) || a.matches("[data-add-to-cart]")){
      push({t:"add_to_cart", ts: now(), vid, path: location.pathname, item: a.getAttribute("data-item") || txt});
    }
  }, true);

  document.addEventListener("click", function(e){

    const open = e.target.closest("[data-modal-target]");
    if(open){

      push({t:"modal_open", ts: now(), vid, path: location.pathname, target: open.getAttribute("data-modal-target")});
    }

    if(e.target.closest(".close-modal,[data-close='modal']")){
      push({t:"modal_close", ts: now(), vid, path: location.pathname});
    }
  }, true);

  document.addEventListener("keydown", function(e){
    if(e.key === "Escape"){
      push({t:"esc", ts: now(), vid, path: location.pathname});
    }
  });

  function exportCSV(){
    const rows = [["ts","visitor","type","path","title","role","selector","text","item","target"]];
    (load(eventsKey, [])).forEach(ev => {
      rows.push([ev.ts, ev.vid, ev.t, ev.path || "", ev.title || "", ev.role || "", ev.sel || "", ev.txt || ev.text || "", ev.item || "", ev.target || ""]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type: "text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "analytics_log.csv"; a.click();
    URL.revokeObjectURL(url);
  }
  window.exportAnalytics = exportCSV;
  window.clearAnalytics = function(){ ls.removeItem(eventsKey); };

  document.addEventListener("keydown", (e)=>{ if(e.ctrlKey && e.shiftKey && e.code === "KeyE"){ exportCSV(); } });
})();
(function addFavicon(){
  try {
    let link = document.querySelector('link[rel~="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.sizes = 'any';
    link.href =
      'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 viewBox%3D%220 0 128 128%22%3E%3Crect width%3D%22100%25%22 height%3D%22100%25%22 fill%3D%22%231f2937%22/%3E%3Ctext x%3D%2250%25%22 y%3D%2250%25%22 dy%3D%22.35em%22 text-anchor%3D%22middle%22 font-family%3D%22sans-serif%22 font-size%3D%2284%22 fill%3D%22%23ffffff%22%3E%E6%9D%B1%3C/text%3E%3C/svg%3E';
  } catch(e) {}
})();
