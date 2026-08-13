/* ============================================================
   Palco 90 — Protótipo
   js/ui.js — telas, modais, partida, navegação
   ============================================================ */
"use strict";

const UI = (() => {
  let app, nav;

  const S = () => G.state;

  /* ---------- helpers ---------- */
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = v => E.fmtM(v);
  const posShort = { POR: "POR", DEF: "ZAG", LAT: "LAT", PIV: "PIV", MC: "MC", MP: "MP", EXT: "EXT", ATA: "ATA" };
  const posOrder = ["POR", "DEF", "LAT", "PIV", "MC", "MP", "EXT", "ATA"];
  const sortSquad = (list) => [...list].sort((a, b) => posOrder.indexOf(a.pos) - posOrder.indexOf(b.pos) || b.media - a.media);
  const energyColor = v => v < 30 ? "low" : v < 45 ? "warn" : "";
  const bar = (v, cls) => `<div class="bar"><i class="${cls || ""}" style="width:${Math.round(v)}%"></i></div>`;
  const state = () => G.state;
  const raw = () => G.getters().raw();

  function playerById(id) {
    const s = state();
    for (const list of [s.squad, s.academy]) {
      const p = list.find(x => x.id === id);
      if (p) return p;
    }
    for (const c of s.world.clubs) {
      const p = c.players.find(x => x.id === id);
      if (p) return p;
    }
    return null;
  }

  function clubName(id) {
    const s = state();
    if (id === s.clubId) return s.club.name;
    const c = s.world.clubs.find(x => x.id === id);
    return c ? c.name : "?";
  }

  const short = name => name.split(" ")[0];

  /* ---------- topbar / nav ---------- */
  const TABS = [
    { id: "home", ic: "🏠", label: "Início" },
    { id: "squad", ic: "👥", label: "Plantel" },
    { id: "tactics", ic: "📋", label: "Tática" },
    { id: "league", ic: "🏆", label: "Liga" },
    { id: "market", ic: "🔄", label: "Mercado" },
    { id: "club", ic: "🏢", label: "Clube" }
  ];
  let current = "home";

  function updateTopbar() {
    const s = state();
    const el = document.getElementById("topbar");
    if (!el) return;
    el.innerHTML = `
      <div class="club">
        <div class="name">${esc(s.club.name)}</div>
        <div class="meta">${E.ordinal(s.division)} divisão · ${E.ordinal(s.season)} temporada · ${esc(E.dayOf(s.cal))}${s.phase === "offseason" ? " · (off-season)" : ""}</div>
      </div>
      <div class="cash">${fmt(s.cash)}</div>`;
  }

  function updateNav() {
    const s = state();
    const pending = s.pending.length;
    nav.innerHTML = TABS.map(t => `
      <button data-tab="${t.id}" class="${t.id === current ? "active" : ""}">
        <span class="ic">${t.ic}</span>
        <span>${t.label}</span>
        ${t.id === "home" && pending ? `<span class="badge">${pending}</span>` : ""}
      </button>`).join("");
  }

  function show(tab) {
    current = tab;
    updateNav();
    updateTopbar();
    const v = { home: viewHome, squad: viewSquad, tactics: viewTactics, league: viewLeague, market: viewMarket, club: viewClub }[tab];
    app.innerHTML = v();
  }

  /* ---------- toasts / modais ---------- */
  let toastTimer = null;
  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function openModal(html) {
    document.getElementById("modal").innerHTML = `<div class="sheet">${html}</div>`;
    document.getElementById("modal").classList.add("open");
  }
  function closeModal() {
    document.getElementById("modal").classList.remove("open");
  }

  /* ---------- telas ---------- */
  function viewHome() {
    const s = state();
    const g = G.getters();
    const f = g.nextFixture();
    const md = g.matchDay();
    const isMD = s.phase === "season" && s.day === md;
    let matchCard = "";
    if (isMD && f) {
      const home = f.home === s.clubId;
      const other = home ? f.away : f.home;
      const oc = s.world.clubs.find(c => c.id === other);
      const derby = (home ? oc.rivals : s.world.clubs.find(c => c.id === s.clubId).rivals).includes(s.clubId);
      matchCard = `
        <div class="card">
          <h3>⚽ Dia de jogo — rodada ${s.round}</h3>
          <div class="row" style="justify-content:center;gap:12px">
            <div style="text-align:center"><div style="font-size:24px">${home ? "🟢" : "🔵"}</div><div class="small">${esc(home ? s.club.name : oc.name)}</div></div>
            <div class="small muted">vs</div>
            <div style="text-align:center"><div style="font-size:24px">${home ? "🔵" : "🟢"}</div><div class="small">${esc(home ? oc.name : s.club.name)}</div></div>
          </div>
          <div class="center small muted">${home ? "Em casa" : "Fora"}${derby ? " · 🔥 DERBY" : ""}</div>
          <button class="btn primary mt" onclick="G.play()">▶ Jogar partida</button>
        </div>`;
    } else {
      const days = md - s.day;
      matchCard = `
        <div class="card">
          <div class="row">
            <div class="grow">
              <div class="sub">${f ? `Próximo jogo: <b>${esc(f.home === s.clubId ? clubName(f.away) : clubName(f.home))}</b> (rodada ${s.round})` : "Sem jogos (off-season)"}</div>
              <div class="sub">${f ? `Dia de jogo em ${days} dia${days === 1 ? "" : "s"}` : "Gira, cantera e revisão em julho/agosto"}</div>
            </div>
            <button class="btn primary small" onclick="G.advance()">Avançar ➜</button>
          </div>
        </div>`;
    }

    const pending = s.pending.length
      ? `<div class="card"><h3>📩 Eventos pendentes (${s.pending.length})</h3>
          ${s.pending.map(e => `<div class="list-item" onclick="G.showPending('${e.id}')"><div class="grow"><div class="name">${esc(e.title || e.type)}</div></div><span class="muted small">Abrir →</span></div>`).join("")}
        </div>` : "";

    const chal = D.challenges[s.challenge];
    const promise = s.promise ? `${s.promise.name} — ${s.promiseDone ? "✅" : "⏳ em curso"}` : "Nenhuma promessa à diretiva";
    const news = s.news.slice(0, 12).map(n => `
      <div class="news-item">
        <span class="nic">${D.newsIcons[n.icon] || "📄"}</span>
        <div><div>${esc(n.text)}</div><div class="nday">dia ${n.day}</div></div>
      </div>`).join("") || `<div class="muted small">Sem notícias ainda.</div>`;

    return `
      ${matchCard}
      <div class="card">
        <div class="chips">
          <span class="chip">🎯 ${esc(chal.name)}</span>
          <span class="chip">📋 ${esc(promise)}</span>
          <span class="chip">🏢 Diretiva: ${s.boardConf}%</span>
          <span class="chip">📣 Aficción: ${s.fan}%</span>
          ${s.phase === "offseason" ? `<span class="chip warn">🏖 Off-season</span>` : ""}
        </div>
      </div>
      ${pending}
      <div class="card">
        <h3>📰 Notícias</h3>
        ${news}
      </div>`;
  }

  function viewSquad() {
    const s = state();
    const players = sortSquad(s.squad);
    const rows = players.map(p => `
      <div class="list-item" onclick="G.player('${p.id}')">
        <div class="pos">${posShort[p.pos]}</div>
        <div class="grow">
          <div class="name">${esc(p.name)}</div>
          <div class="meta">${p.age} anos · ${D.roles[p.pos].find(r => r.code === p.role)?.name || p.role}${p.injury ? " · 🩹 lesionado" : ""}${p.listed ? " · 🔄 na lista" : ""}${p.loanListed ? " · 🔁 na lista de empréstimos" : ""}${p.loanedOut ? " · 📤 emprestado (volta em junho)" : ""}${p.loanedIn ? " · 📥 emprestado ao clube" : ""}${p.wantOut ? " · 😠 quer sair" : ""}</div>
          <div class="bar-row" style="margin-top:4px"><span class="lbl" style="width:auto">⚡ ${Math.round(p.energy)}</span>${bar(p.energy, energyColor(p.energy))}</div>
        </div>
        <div class="media">${p.media}</div>
      </div>`).join("");
    return `
      <div class="card">
        <h3>👥 Plantel (${s.squad.length}/20)</h3>
        ${rows || `<div class="muted">Plantel vazio — procure o mercado ou a cantera!</div>`}
      </div>
      ${s.academy.length ? `
      <div class="card">
        <h3>🌱 Academia (${s.academy.length}/12)</h3>
        ${sortSquad(s.academy).map(p => `
          <div class="list-item" onclick="G.player('${p.id}', 'academy')">
            <div class="pos">${posShort[p.pos]}</div>
            <div class="grow"><div class="name">${esc(p.name)}</div><div class="meta">${p.age} anos · potencial ${p.pot}</div></div>
            <div class="media">${p.media}</div>
          </div>`).join("")}
      </div>` : ""}`;
  }

  function viewTactics() {
    const s = state();
    const lp = s.lineup;
    const slots = D.formations[lp.formation].slots;
    const pitchRows = [];
    const rowsOf = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const zones = { POR: 0, DEF: 1, LAT: 1, PIV: 2, MC: 2, MP: 3, EXT: 3, ATA: 4 };
    for (const row of [4, 3, 2, 1, 0]) {
      const items = slots.map((sl, i) => ({ sl, i, z: zones[sl] })).filter(x => x.z === row);
      if (items.length) pitchRows.push(items);
    }
    const pitch = pitchRows.map(row => `
      <div class="prow">
        ${row.map(({ sl, i }) => {
          const key = sl + "_" + i;
          const pid = lp.bySlot[key];
          const p = pid ? s.squad.find(x => x.id === pid) : null;
          const ok = p && !p.injury;
          return `<button class="slot-btn ${pid ? "manual" : ""}" onclick="G.slot('${key}')">
            <div class="pl">${ok ? esc(short(p.name)) : posShort[sl]}</div>
            ${ok ? `<span class="ener"><i style="width:${Math.round(p.energy)}%;${p.energy < 45 ? "background:var(--gold)" : ""}"></i></span><span>${p.media}</span>` : `<span class="muted">—</span>`}
          </button>`;
        }).join("")}
      </div>`).join("");

    const chipRow = (label, items, cur, fn) => `
      <div class="small muted" style="margin-top:8px">${label}</div>
      <div class="chips">${items.map(k => `<span class="chip ${k === cur ? "active" : ""}" onclick="G.setTactic('${fn}', '${k}')">${D.formations[k] ? D.formations[k].meta : D.styles[k] ? D.styles[k].name : D.mentalities[k] ? D.mentalities[k].name : D.presses[k].name}</span>`).join("")}</div>`;

    return `
      <div class="card">
        <h3>📋 Tática</h3>
        <div class="pitch">${pitch}</div>
        <div class="row mt">
          <button class="btn small primary" onclick="G.slotAuto()">🤖 Melhor XI</button>
          <button class="btn small" onclick="G.slotClear()">🧹 Limpar escolhas</button>
          <span class="muted small grow">${D.formations[lp.formation].desc}</span>
        </div>
      </div>
      <div class="card">
        <h3>Estilo</h3>
        <div class="small muted">${esc(D.styles[lp.style].desc)}</div>
        ${chipRow("Escolha:", D.styleKeys, lp.style, "style")}
        ${chipRow("Formação:", Object.keys(D.formations), lp.formation, "formation")}
        ${chipRow("Mentalidade:", Object.keys(D.mentalities), lp.mentality, "mentality")}
        ${chipRow("Pressão:", Object.keys(D.presses), lp.press, "press")}
      </div>`;
  }

  function viewLeague() {
    const s = state();
    const rows = G.getters().table();
    const table = `<table class="league">
      <tr><th>#</th><th>Clube</th><th class="num">J</th><th class="num">V</th><th class="num">E</th><th class="num">D</th><th class="num">SG</th><th class="num pts">P</th></tr>
      ${rows.map((r, i) => {
        const me = r.club.id === s.clubId;
        return `<tr class="${me ? "me" : ""}"><td>${i + 1}</td><td>${esc(short(r.club.name))}${me ? " ⭐" : ""}</td>
          <td class="num">${r.w + r.d + r.l}</td><td class="num">${r.w}</td><td class="num">${r.d}</td><td class="num">${r.l}</td>
          <td class="num">${r.gf - r.ga}</td><td class="num pts">${r.pts}</td></tr>`;
      }).join("")}
    </table>`;

    const f = G.getters().nextFixture();
    const fixtures = f ? (() => {
      const round = f.round;
      return s.fixtures.filter(x => x.round === round).map(x => {
        const me = x.home === s.clubId || x.away === s.clubId;
        return `<div class="list-item ${me ? "" : "muted"}">
          <div class="grow">${esc(clubName(x.home))} × ${esc(clubName(x.away))}</div>
          ${me ? `<span class="chip">seu jogo</span>` : ""}</div>`;
      }).join("");
    })() : "";

    const results = [...s.results].reverse().slice(0, 10).map(r => `
      <div class="list-item"><div class="grow small">${esc(r.line)}</div>
        <span class="${r.result === "W" ? "money" : r.result === "L" ? "" : "muted"}">${r.result === "W" ? "VITÓRIA" : r.result === "L" ? "DERROTA" : "EMPATE"}</span></div>`).join("");

    const scorers = Object.entries(s.scorers).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, n]) => {
      const p = playerById(id);
      return `<div class="list-item"><div class="grow small">${p ? esc(p.name) : "?"} <span class="muted">(${p ? clubName(s.squad.some(x => x.id === id) ? s.clubId : (() => { const c = s.world.clubs.find(c => c.players.some(pp => pp.id === id)); return c ? c.id : ""; })()) : ""})</span></div><span class="media">${n}</span></div>`;
    }).join("") || `<div class="muted small">Sem gols ainda.</div>`;

    return `
      <div class="card"><h3>🏆 ${esc(D.countries.find(c => c.id === s.world.country.id).name)} — ${E.ordinal(s.division)} divisão</h3>${table}</div>
      <div class="card"><h3>Rodada ${s.round}</h3>${fixtures || `<div class="muted small">Off-season — sem jogos.</div>`}</div>
      <div class="card"><h3>📈 Últimos resultados</h3>${results || `<div class="muted small">Ainda sem resultados.</div>`}</div>
      <div class="card"><h3>🎯 Artilheiros</h3>${scorers}</div>`;
  }

  function viewMarket() {
    const s = state();
    const rows = s.market.map(p => `
      <div class="list-item" onclick="G.player('${p.id}', 'market')">
        <div class="pos">${posShort[p.pos]}</div>
        <div class="grow">
          <div class="name">${esc(p.name)}</div>
          <div class="meta">${p.age} anos · de ${esc(p.from)}</div>
        </div>
        <div class="media">${p.media}</div>
        <button class="btn small primary" onclick="event.stopPropagation();G.buyModal('${p.id}')">${fmt(p.value)}</button>
      </div>`).join("");
    const free = s.freeAgents.map(p => `
      <div class="list-item" onclick="G.player('${p.id}', 'free')">
        <div class="pos">${posShort[p.pos]}</div>
        <div class="grow">
          <div class="name">${esc(p.name)}</div>
          <div class="meta">${p.age} anos · agente livre</div>
        </div>
        <div class="media">${p.media}</div>
        <button class="btn small gold" onclick="event.stopPropagation();G.sign('${p.id}')">${fmt(p.wage * 2)}</button>
      </div>`).join("");
    const fName = G.getters().nextFixture();
    return `
      <div class="card">
        <h3>🔄 Mercado de transferências</h3>
        <div class="sub">${fName ? "" : ""}Atualiza no dia 15 de cada mês. Ojeador melhora a qualidade.</div>
        ${rows || `<div class="muted small">Mercado vazio — volte no dia 15.</div>`}
      </div>
      <div class="card">
        <h3>📋 Agentes livres</h3>
        ${free || `<div class="muted small">Nenhum agente disponível.</div>`}
      </div>`;
  }

  function viewClub() {
    const s = state();
    const fac = D.facilityKeys.map(k => {
      const f = D.facilities[k];
      const lvl = s.facilities[k];
      const next = lvl < 4 ? f.levels[lvl] : null;
      const working = k === "stadium" && s.stadiumWork ? ` em obras (${s.stadiumWork.days}d)` : "";
      return `<div class="list-item">
        <div class="pos">${f.icon}</div>
        <div class="grow">
          <div class="name">${f.name} — nível ${lvl}${working}</div>
          <div class="meta">${esc(f.desc)}</div>
        </div>
        ${next !== null ? `<button class="btn small" onclick="G.upgrade('${k}')">${fmt(next)}</button>` : `<span class="media">máx</span>`}
      </div>`;
    }).join("");
    const staff = D.staffKeys.map(k => `
      <div class="list-item">
        <div class="pos">${D.staff[k].icon}</div>
        <div class="grow"><div class="name">${D.staff[k].name} — nível ${s.staff[k]}</div><div class="meta">${esc(D.staff[k].desc)}</div></div>
      </div>`).join("");
    const hist = [...s.monthHistory].slice(-6).map(h => `
      <div class="list-item"><div class="grow small">${h.m} — receita ${fmt(h.inc)} · salários ${fmt(h.out)}</div><span class="money">${h.inc - h.out >= 0 ? "+" : ""}${fmt(h.inc - h.out)}</span></div>`).join("");
    const cantera = s.academy.map(p => `
      <div class="list-item" onclick="G.player('${p.id}', 'academy')">
        <div class="pos">${posShort[p.pos]}</div>
        <div class="grow"><div class="name">${esc(p.name)}</div><div class="meta">${p.age} anos · potencial ${p.pot}</div></div>
        <div class="media">${p.media}</div>
      </div>`).join("");

    return `
      <div class="card">
        <h3>💰 Finanças</h3>
        <div class="row">
          <div class="stat grow"><div class="v">${fmt(s.cash)}</div><div class="l">Caixa</div></div>
          <div class="stat grow"><div class="v">${s.negMonths}</div><div class="l">Meses negativos</div></div>
          <div class="stat grow"><div class="v">${s.boardConf}%</div><div class="l">Diretiva</div></div>
          <div class="stat grow"><div class="v">${s.fan}%</div><div class="l">Aficción</div></div>
        </div>
        <div class="sep"></div>
        <div class="row"><span class="small grow">Preço do bilhete: <b>${s.ticketPrice}€</b></span>
          <button class="btn small" onclick="G.ticket(-1)">−</button>
          <button class="btn small" onclick="G.ticket(1)">+</button></div>
        ${hist ? `<div class="sep"></div>${hist}` : ""}
      </div>
      <div class="card"><h3>🏟️ Instalações</h3>${fac}</div>
      <div class="card"><h3>🧠 Equipe técnica</h3>${staff}
        <div class="sep"></div>
        <div class="sub">Cursos da federação aparecem como eventos (2–5 × 100k).</div>
      </div>
      <div class="card">
        <h3>🌱 Cantera (${s.academy.length}/12)</h3>
        <div class="row">
          <button class="btn small grow" onclick="G.capture()">🎣 Captura extra (${fmt(300000)}, ${s.extraCaptures}/2 por época)</button>
        </div>
        <div class="sep"></div>
        ${cantera || `<div class="muted small">Academia vazia — a fornada chega em 15 de julho.</div>`}
      </div>
      <div class="card">
        <h3>📋 Promessa à diretiva</h3>
        ${s.promise ? `<div class="sub">${esc(s.promise.name)} — antecipação ${fmt(D.promises[s.promise.key].adv)} já recebida. ${s.promiseDone ? "✅ Cumprida!" : "⏳ A cumprir até o fim da época."}</div>`
          : `<button class="btn primary" onclick="G.promise()">Escolher promessa (${fmt(500000)}+ de antecipação)</button>`}
      </div>
      <div class="card">
        <h3>🎯 Desafio</h3>
        <div class="sub"><b>${esc(D.challenges[s.challenge].name)}</b> — ${esc(D.challenges[s.challenge].desc)}</div>
      </div>`;
  }

  /* ---------- modais ---------- */
  function playerModal(id, ctx) {
    const s = state();
    const list = ctx === "academy" ? s.academy : ctx === "market" ? s.market : ctx === "free" ? s.freeAgents : s.squad;
    const p = list.find(x => x.id === id);
    if (!p) return toast("Jogador não encontrado");
    const attrs = D.attrs.map(a => `
      <div class="bar-row"><span class="lbl">${a.label}</span>${bar(p.attrs[a.key])}<span style="width:26px;text-align:right">${p.attrs[a.key]}</span></div>`).join("");
    const role = D.roles[p.pos].find(r => r.code === p.role);
    let actions = "";
    if (ctx === "market") actions = `<button class="btn primary" onclick="G.buyModal('${p.id}')">Negociar (pedem ${fmt(p.asking || p.value)})</button>`;
    if (ctx === "free") actions = `<button class="btn gold" onclick="G.sign('${p.id}')">Assinar (prima ${fmt(p.wage * 2)})</button>`;
    if (!ctx || ctx === "squad") actions = `
      <div class="row">
        <button class="btn small grow" onclick="G.list('${p.id}', ${p.listed ? "false" : "true"})">${p.listed ? "Retirar da lista" : "Pôr na lista"}</button>
        <button class="btn small grow" onclick="G.loanList('${p.id}', ${p.loanListed ? "false" : "true"})">${p.loanListed ? "Tirar de empréstimos" : "🔁 Emprestar"}</button>
      </div>
      <div class="row mt" style="gap:8px">
        <button class="btn small gold grow" onclick="G.sellModal('${p.id}')">Vender (negociar)</button>
        <button class="btn small danger grow" onclick="G.sell('${p.id}')">Venda rápida</button>
      </div>
      ${p.loanedOut ? `<div class="sub">📤 Emprestado — volta em junho.</div>` : ""}
      ${p.loanedIn ? `<div class="sub">📥 Emprestado ao clube — volta em junho.</div>` : ""}`;
    openModal(`
      <div class="row">
        <div class="pos" style="width:44px;height:44px;font-size:12px">${posShort[p.pos]}</div>
        <div><h2 style="margin:0">${esc(p.name)}</h2><div class="sub">${p.age} anos · ${role ? role.name : p.role}${p.injury ? " · 🩹 lesionado" : ""}</div></div>
        <div class="grow"></div>
        <div class="media" style="font-size:22px">${p.media}</div>
      </div>
      <div class="bar-row"><span class="lbl">Potencial</span>${bar(p.pot, p.pot - p.media > 8 ? "" : "warn")}<span style="width:26px;text-align:right">${p.pot}</span></div>
      <div class="bar-row"><span class="lbl">Moral</span>${bar(p.morale, p.morale < 40 ? "warn" : "")}<span style="width:26px;text-align:right">${p.morale}</span></div>
      <div class="bar-row"><span class="lbl">Forma</span>${bar(p.form, "")}<span style="width:26px;text-align:right">${p.form}</span></div>
      <div class="bar-row"><span class="lbl">Energia</span>${bar(p.energy, energyColor(p.energy))}<span style="width:26px;text-align:right">${p.energy}</span></div>
      <div class="sep"></div>
      ${attrs}
      <div class="sep"></div>
      <div class="row">
        <div class="stat grow"><div class="v" style="font-size:14px">${fmt(p.wage)}</div><div class="l">Salário/mês</div></div>
        <div class="stat grow"><div class="v" style="font-size:14px">${fmt(p.value)}</div><div class="l">Valor</div></div>
        <div class="stat grow"><div class="v" style="font-size:14px">${p.goals}</div><div class="l">Gols</div></div>
        <div class="stat grow"><div class="v" style="font-size:14px">${p.apps}</div><div class="l">Jogos</div></div>
      </div>
      <div class="sep"></div>
      ${actions}
      ${ctx === "squad" || !ctx ? "" : ""}
      <button class="btn mt" onclick="UI.closeModal()">Fechar</button>`);
  }

  function negotiateModal(id) {
    const s = state();
    const p = s.market.find(x => x.id === id);
    if (!p) return;
    const o = G._offer;
    const offer = o && o.id === id && o.amount > 0 ? o.amount : p.value;
    if (o) { o.id = id; o.amount = offer; }
    const can = s.cash >= offer;
    openModal(`
      <h2>🤝 Negociação — ${esc(p.name)}</h2>
      <div class="row">
        <div class="pos" style="width:44px;height:44px;font-size:12px">${posShort[p.pos]}</div>
        <div class="grow">
          <div class="sub">${esc(p.from || "?" )} · ${p.age} anos · média <b>${p.media}</b></div>
          <div class="sub">O clube pede <b class="money">${fmt(p.asking)}</b> · valor de mercado ${fmt(p.value)}</div>
        </div>
      </div>
      <div class="sep"></div>
      <div class="row" style="justify-content:center;gap:6px;margin:6px 0">
        <button class="btn small" onclick="G.offerN(-200000)">−200k</button>
        <button class="btn small" onclick="G.offerN(-50000)">−50k</button>
        <div class="media" style="font-size:20px;min-width:110px;text-align:center">${fmt(offer)}</div>
        <button class="btn small" onclick="G.offerN(50000)">+50k</button>
        <button class="btn small" onclick="G.offerN(200000)">+200k</button>
      </div>
      <div class="row mt" style="gap:8px">
        <button class="btn small grow" onclick="G.offerAt(${p.value})">Mercado</button>
        <button class="btn small grow gold" onclick="G.offerAt(${p.asking})">Pedido</button>
      </div>
      <button class="btn primary mt" ${can ? "" : "disabled"} onclick="G.negotiate('${p.id}', ${offer})">Fazer proposta ${can ? "" : "(sem caixa)"}</button>
      <button class="btn mt" onclick="UI.closeModal()">Cancelar</button>`);
  }

  function counterModal(id, amount, msg) {
    const s = state();
    const p = s.market.find(x => x.id === id);
    if (!p) return;
    openModal(`
      <h2>🤝 Contraproposta</h2>
      <div class="text">${esc(msg)} ${esc(p.name)} aceita por <b class="money">${fmt(amount)}</b>.</div>
      <div class="row">
        <button class="btn primary grow" onclick="G.counterPick('${id}', true)">Aceitar ${fmt(amount)}</button>
        <button class="btn grow" onclick="G.counterPick('${id}', false)">Recusar</button>
      </div>`);
  }

  function sellModal(id, offers) {
    const s = state();
    const p = s.squad.find(x => x.id === id);
    if (!p) return;
    openModal(`
      <h2>🔄 Vender ${esc(p.name)}</h2>
      <div class="text">Média ${p.media} · valor ${fmt(p.value)}. Interessados e ofertas:</div>
      ${offers.map((o, i) => `
        <button class="opt" onclick="G.sellPick(${i})">
          ${esc(o.club)}
          <span class="hint">${fmt(o.amount)} — toque para aceitar</span>
        </button>`).join("")}
      <button class="opt muted" onclick="UI.closeModal()">Não vender agora</button>`);
  }

  function eventModal(e) {
    const s = state();
    openModal(`
      <h2>${esc(e.title || "Evento")}</h2>
      <div class="text">${esc(e.text)}</div>
      ${(e.options || []).map(o => `
        <button class="opt" onclick="G.resolveEvent('${e.id}', '${o.key}')">
          ${esc(o.label)}
          ${o.hint ? `<span class="hint">${esc(o.hint)}</span>` : ""}
        </button>`).join("")}
      <button class="opt muted" onclick="UI.closeModal()">Fechar</button>`);
  }

  function promiseModal() {
    const s = state();
    openModal(`
      <h2>📋 Promessa à diretiva</h2>
      <div class="text">A diretiva oferece dinheiro adiantado por uma promessa. Se falhar, a confiança cai.</div>
      ${D.promiseKeys.map(k => {
        const p = D.promises[k];
        return `<button class="opt" onclick="G.setPromise('${k}')">${esc(p.name)}<span class="hint">Antecipação ${fmt(p.adv)} · bônus ${fmt(p.bonus)}</span></button>`;
      }).join("")}
      <button class="opt muted" onclick="UI.closeModal()">Agora não</button>`);
  }

  function reviewModal(res) {
    const s = state();
    openModal(`
      <h2>📊 Revisão da temporada</h2>
      <div class="row" style="justify-content:center;gap:18px">
        <div class="stat"><div class="v">${res.pos}º</div><div class="l">Posição final</div></div>
        <div class="stat"><div class="v">${fmt(s.cash)}</div><div class="l">Caixa</div></div>
        <div class="stat"><div class="v">${s.stats.titles}</div><div class="l">Títulos</div></div>
      </div>
      <div class="sep"></div>
      ${res.notes.map(n => `<div class="small" style="padding:4px 0">${esc(n)}</div>`).join("")}
      <button class="btn primary mt" onclick="G.afterReview()">Continuar ➜</button>`);
  }

  function seasonEndModal() {
    const s = state();
    const pos = G.getters().table().findIndex(r => r.club.id === s.clubId) + 1;
    openModal(`
      <h2>🏁 A temporada terminou!</h2>
      <div class="text">Você fechou a ${E.ordinal(s.season)} temporada em <b>${pos}º</b> lugar. Segue-se a off-season: gira (10 jul), fornada (15 jul) e revisão (1 ago).</div>
      <button class="btn primary" onclick="G.afterSeasonEnd()">Continuar ➜</button>`);
  }

  function deadModal() {
    const s = state();
    openModal(`
      <h2>💀 Fim de carreira</h2>
      <div class="text">${esc(s.dead.text)}</div>
      <div class="sub">Estatísticas: ${s.stats.titles} título(s) · ${s.stats.promotions} ascenso(s) · ${s.stats.seasons} temporadas</div>
      <button class="btn primary mt" onclick="G.newGame()">Nova carreira</button>`);
  }

  function matchModal(res) {
    const { m, userHome } = res;
    const s = state();
    const homeName = m.home.name, awayName = m.away.name;
    const feed = document.createElement("div");
    let idx = 0, timer = null;

    openModal(`
      <div class="matchhead">
        <div class="teams">
          <div style="flex:1;text-align:right">${esc(short(homeName))}</div>
          <div class="score" id="mscore">0–0</div>
          <div style="flex:1;text-align:left">${esc(short(awayName))}</div>
        </div>
        <div class="meta" id="mmeta">90 min · posse 50–50</div>
      </div>
      <div id="livediv"></div>
      <button class="btn primary" id="mbtn" style="display:none" onclick="G.afterMatch()">Finalizar ➜</button>`);

    const mscore = document.getElementById("mscore");
    const mmeta = document.getElementById("mmeta");
    const livediv = document.getElementById("livediv");
    const mbtn = document.getElementById("mbtn");
    const score = [0, 0];
    const events = m.live;

    const sideSym = sd => sd === 0 ? "🟢" : "🔵";
    const step = () => {
      if (idx >= events.length) {
        clearInterval(timer);
        mscore.textContent = `${m.score[0]}–${m.score[1]}`;
        mmeta.textContent = `Fim de jogo · posse ${m.poss[0]}–${m.poss[1]} · remates ${m.shots[0]}–${m.shots[1]} · cartões ${m.cards[0]}–${m.cards[1]}`;
        mbtn.style.display = "block";
        return;
      }
      const ev = events[idx++];
      if (ev.type === "goal") score[ev.side]++;
      const row = document.createElement("div");
      row.className = "live-row " + (ev.type || "");
      row.innerHTML = `<span class="min">${ev.min}'</span><span class="side">${sideSym(ev.side)}</span><span>${esc(ev.text)}</span>`;
      livediv.appendChild(row);
      livediv.scrollTop = livediv.scrollHeight;
      mscore.textContent = `${score[0]}–${score[1]}`;
      mmeta.textContent = `${ev.min}' min · posse ${m.poss[0]}–${m.poss[1]}`;
    };
    timer = setInterval(step, 90);
  }

  function init() {
    app = document.getElementById("app");
    nav = document.getElementById("bottomnav");
    nav.addEventListener("click", e => {
      const b = e.target.closest("button[data-tab]");
      if (b) G.nav(b.dataset.tab);
    });
    const m = document.getElementById("modal");
    m.addEventListener("click", e => { if (e.target === m) closeModal(); });
  }

  return { init, show, updateTopbar, toast, openModal, closeModal, playerModal, negotiateModal, counterModal, sellModal, eventModal, promiseModal, reviewModal, seasonEndModal, deadModal, matchModal, playerById, esc };
})();