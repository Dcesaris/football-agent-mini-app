/* ============================================================
   Palco 90 — Protótipo
   js/main.js — boot, fluxo do dia, partida, novo jogo
   ============================================================ */
"use strict";

const G = {
  state: null,
  getters: null,
  _g() { return E.getters(this.state); },
  flow: {},
  _match: null,
  _promiseShown: false,

  /* ---------- boot ---------- */
  boot() {
    UI.init();
    const saved = E.load();
    if (saved && saved.v) {
      this.state = saved;
      this.getters = this._g;
      this.renderBoot(saved);
    } else {
      this.flowCountry();
    }
  },

  renderBoot(s) {
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="card center" style="margin-top:24px">
        <div style="font-size:40px">⚽</div>
        <h2>Palco 90</h2>
        <div class="sub">Continue a carreira de <b>${UI.esc(s.club.name)}</b> (${E.ordinal(s.season)} temporada, dia ${s.day})</div>
        <button class="btn primary mt" onclick="G.continueGame()">Continuar ➜</button>
        <button class="btn mt" onclick="G.eraseAndNew()">Nova carreira</button>
      </div>`;
  },

  continueGame() {
    this.getters = this._g;
    UI.show("home");
    this.maybePromise();
  },

  eraseAndNew() {
    E.eraseSave();
    this.state = null;
    this.flowCountry();
  },

  /* ---------- navegação ---------- */
  nav(tab) {
    if (!this.state) return;
    UI.show(tab);
  },

  /* ---------- fluxo do dia ---------- */
  advance() {
    const s = this.state;
    if (!s) return;
    if (s.dead) { UI.deadModal(); return; }
    const r = E.advanceDay(s);
    E.save(s);
    switch (r.type) {
      case "match":
        this.play();
        break;
      case "event":
        UI.eventModal(r.event);
        UI.show("home");
        break;
      case "review": {
        const res = E.seasonReview(s);
        E.save(s);
        this._promiseShown = false;
        UI.reviewModal(res);
        break;
      }
      case "dead":
        UI.deadModal();
        break;
      case "seasonEnd":
        UI.seasonEndModal();
        break;
      default:
        UI.show("home");
    }
    UI.updateTopbar();
  },

  play() {
    this._match = E.playMatch(this.state, true);
    UI.matchModal(this._match);
  },

  afterMatch() {
    const s = this.state;
    const m = this._match;
    const res = E.finishMatch(s, m.m, m.userHome);
    E.save(s);
    UI.closeModal();
    if (res.type === "seasonEnd") UI.seasonEndModal();
    else UI.show("home");
  },

  afterReview() {
    UI.closeModal();
    UI.show("home");
    this.maybePromise();
  },

  afterSeasonEnd() {
    UI.closeModal();
    UI.show("home");
  },

  maybePromise() {
    const s = this.state;
    if (!s || s.promise || s.phase !== "season" || s.round !== 1 || s.day !== 1 || this._promiseShown) return;
    this._promiseShown = true;
    UI.promiseModal();
  },

  /* ---------- ações ---------- */
  showPending(id) {
    const e = this.state.pending.find(x => x.id === id);
    if (!e) return;
    if (e.options && e.options.length) UI.eventModal(e);
    else {
      E.resolve(this.state, id, null);
      E.save(this.state);
      UI.show("home");
    }
  },

  resolveEvent(id, key) {
    E.resolve(this.state, id, key);
    E.save(this.state);
    UI.closeModal();
    UI.show("home");
  },

  player(id, ctx) { UI.playerModal(id, ctx || "squad"); },

  buy(id) {
    const p = this.state.market.find(x => x.id === id);
    if (!p) return;
    const r = E.buyPlayer(this.state, id, p.value);
    E.save(this.state);
    UI.toast(r.msg);
    UI.show("market");
  },

  buyModal(id) {
    this._offer = { id, amount: 0 };
    UI.negotiateModal(id);
  },

  offerN(delta) {
    const s = this.state;
    const o = this._offer;
    if (!o) return;
    const p = s.market.find(x => x.id === o.id);
    if (!p) return;
    o.amount = Math.max(0, Math.min(Math.round((o.amount || p.value) + delta), s.cash));
    UI.negotiateModal(o.id);
  },

  offerAt(amount) {
    const o = this._offer;
    if (!o) return;
    o.amount = Math.round(amount);
    UI.negotiateModal(o.id);
  },

  negotiate(id, offer) {
    const r = E.negotiateBuy(this.state, id, offer);
    E.save(this.state);
    if (r.ok) { UI.closeModal(); UI.toast(r.msg); UI.show("market"); return; }
    if (r.reject) { UI.closeModal(); UI.toast(r.msg); UI.show("market"); return; }
    this._offer = { id, amount: r.counter };
    UI.counterModal(id, r.counter, r.msg);
  },

  counterPick(id, accept) {
    if (!accept) { UI.closeModal(); UI.show("market"); return; }
    const amount = this._offer ? this._offer.amount : 0;
    const r = E.negotiateBuy(this.state, id, amount, true);
    E.save(this.state);
    UI.closeModal();
    UI.toast(r.msg);
    UI.show("market");
  },

  sellModal(id) {
    const offers = E.sellOffers(this.state, id);
    if (!offers) { UI.toast("Não dá para vender agora"); return; }
    this._sell = { id, offers };
    UI.sellModal(id, offers);
  },

  sellPick(idx) {
    const o = this._sell;
    if (!o || !o.offers[idx]) return;
    const r = E.acceptSellOffer(this.state, o.id, o.offers[idx].amount);
    E.save(this.state);
    UI.closeModal();
    UI.toast(r.msg);
    UI.show("squad");
  },

  loanList(id, v) {
    E.listLoan(this.state, id, v);
    E.save(this.state);
    UI.closeModal();
    UI.show("squad");
  },

  sign(id) {
    const r = E.signFree(this.state, id);
    E.save(this.state);
    UI.toast(r.msg);
    UI.show("market");
  },

  list(id, v) {
    E.listPlayer(this.state, id, v);
    E.save(this.state);
    UI.show("squad");
  },

  sell(id) {
    const r = E.sellNow(this.state, id);
    E.save(this.state);
    UI.toast(r.msg);
    UI.show("squad");
  },

  setTactic(fn, key) {
    this.state.lineup[fn] = key;
    E.save(this.state);
    UI.show("tactics");
  },

  slot(key) {
    const s = this.state;
    const slot = key.split("_")[0];
    const av = s.squad.filter(p => !p.injury && !p.listed);
    const fit = av.filter(p => {
      const map = { POR: ["POR"], DEF: ["DEF", "LAT"], LAT: ["LAT", "DEF"], PIV: ["PIV", "MC"], MC: ["MC", "PIV"], MP: ["MP", "EXT", "MC"], EXT: ["EXT", "MP", "ATA"], ATA: ["ATA", "EXT"] };
      return map[slot].includes(p.pos);
    }).sort((a, b) => b.media - a.media);
    UI.openModal(`
      <h2>Escalação — ${slot}</h2>
      <div class="sub">Toque para fixar o jogador no slot (manual).</div>
      <button class="opt" onclick="G.slotPick('${key}', '')">🔄 Automático (melhor disponível)</button>
      ${fit.map(p => `
        <button class="opt" onclick="G.slotPick('${key}', '${p.id}')">
          ${UI.esc(p.name)} <span class="hint">${p.pos} · média ${p.media} · ⚡${Math.round(p.energy)}</span>
        </button>`).join("")}
      ${!fit.length ? `<div class="muted small">Ninguém disponível para ${slot}.</div>` : ""}
      <button class="opt muted" onclick="UI.closeModal()">Cancelar</button>`);
  },

  slotPick(key, pid) {
    if (pid) this.state.lineup.bySlot[key] = pid;
    else delete this.state.lineup.bySlot[key];
    E.save(this.state);
    UI.closeModal();
    UI.show("tactics");
  },

  slotAuto() {
    const s = this.state;
    const club = s.world.clubs.find(c => c.id === s.clubId);
    const { xi } = E.pickXI(s, club, s.lineup, s.squad);
    const bs = {};
    xi.forEach(x => { bs[x.key] = x.player.id; });
    s.lineup.bySlot = bs;
    E.save(s);
    UI.show("tactics");
  },

  slotClear() {
    this.state.lineup.bySlot = {};
    E.save(this.state);
    UI.show("tactics");
  },

  promise() { UI.promiseModal(); },

  setPromise(k) {
    E.setPromise(this.state, k);
    E.save(this.state);
    UI.closeModal();
    UI.show("club");
  },

  upgrade(k) {
    const s = this.state;
    const f = D.facilities[k];
    const lvl = s.facilities[k];
    if (lvl >= 4) return;
    const cost = f.levels[lvl];
    if (s.cash < cost) { UI.toast("Sem orçamento para " + f.name + "."); return; }
    if (k === "stadium" && s.stadiumWork) { UI.toast("Estádio já em obras."); return; }
    s.cash -= cost;
    if (k === "stadium") s.stadiumWork = { level: lvl + 1, days: D.upgradeDays };
    else s.facilities[k] = lvl + 1;
    E.save(s);
    UI.toast(`${f.icon} ${f.name} — nível ${k === "stadium" ? "em obras" : lvl + 1}!`);
    UI.show("club");
  },

  ticket(d) {
    const s = this.state;
    s.ticketPrice = Math.max(D.econ.ticketMin, Math.min(D.econ.ticketMax, s.ticketPrice + d));
    E.save(s);
    UI.show("club");
  },

  capture() {
    const r = E.captureExtra(this.state);
    E.save(this.state);
    UI.toast(r.msg);
    UI.show("club");
  },

  /* ---------- novo jogo ---------- */
  flowCountry() {
    this.flow = {};
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="card center" style="margin-top:24px">
        <div style="font-size:40px">⚽</div>
        <h2>Palco 90</h2>
        <div class="sub">Escolha o país da sua carreira</div>
      </div>
      ${D.countries.map(c => `
        <div class="card" onclick="G.flowChallenge('${c.id}')">
          <div class="row"><div class="grow"><div class="name">${UI.esc(c.name)}</div><div class="sub">${c.divisions} divisões · ${UI.esc(c.style)}</div></div><span class="muted">→</span></div>
        </div>`).join("")}`;
  },

  flowChallenge(country) {
    this.flow.country = country;
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="card center"><h2>🎯 Desafio</h2><div class="sub">Regras especiais — ou carreira normal</div></div>
      ${D.challengeKeys.map(k => {
        const c = D.challenges[k];
        return `<div class="card" onclick="G.flowClub('${k}')">
          <div class="row"><div class="grow"><div class="name">${k === "NONE" ? "✅ " : "🔥 "}${UI.esc(c.name)}</div><div class="sub">${UI.esc(c.desc)}</div></div><span class="muted">→</span></div>
        </div>`;
      }).join("")}
      <button class="btn mt" onclick="G.flowCountry()">← Voltar</button>`;
  },

  flowClub(challenge) {
    this.flow.challenge = challenge;
    // mundo temporário só para listar clubes da divisão mais baixa
    const tmp = E.newCareer(this.flow.country, challenge, null);
    this.flow.world = tmp.world;
    const div = tmp.world.country.divisions;
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="card center"><h2>🏟️ Escolha o clube</h2><div class="sub">${UI.esc(tmp.world.country.name)} — ${E.ordinal(div)} divisão (a mais baixa)</div></div>
      ${tmp.world.byDiv[div].map((c, i) => {
        const media = Math.round(c.players.reduce((s, p) => s + p.media, 0) / c.players.length);
        return `<div class="card" onclick="G.start('${c.id}', ${i})">
          <div class="row"><div class="grow"><div class="name">${UI.esc(c.name)}</div><div class="sub">média do plantel ${media}</div></div><span class="muted">→</span></div>
        </div>`;
      }).join("")}
      <button class="btn mt" onclick="G.flowChallenge('${this.flow.challenge}')">← Voltar</button>`;
  },

  start(clubId) {
    this.state = E.newCareer(null, this.flow.challenge, clubId, this.flow.world);
    this.getters = this._g;
    E.save(this.state);
    this._promiseShown = false;
    UI.show("home");
    this.maybePromise();
  },

  newGame() {
    E.eraseSave();
    this.state = null;
    this.flowCountry();
  }
};

document.addEventListener("DOMContentLoaded", () => G.boot());