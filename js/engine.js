/* ============================================================
   Palco 90 — Protótipo
   js/engine.js — motor: mundo, jogadores, partidas, economia,
   diretiva, cantera, eventos, temporada.
   ============================================================ */
"use strict";

const E = (() => {

  /* ---------- helpers ---------- */
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const chance = (p) => Math.random() < p;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtM = (v) => {
    const n = Math.abs(v);
    const s = v < 0 ? "-" : "";
    if (n >= 1e6) return s + "€ " + (n / 1e6).toFixed(1).replace(".", ",") + " M";
    if (n >= 1e4) return s + "€ " + Math.round(n / 1e3) + " k";
    return s + "€ " + Math.round(n);
  };
  const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const dayOf = (cal) => cal.day + " de " + monthNames[cal.month - 1];
  let nextId = 1;
  const uid = () => "id" + (nextId++);

  /* ---------- geração de mundo ---------- */
  function genClubName(country) {
    const cities = D.cities[country];
    const suffixes = D.clubSuffix[country];
    let name = pick(cities) + " " + pick(suffixes);
    return name;
  }

  function posBias(pos) {
    const b = { def: 0, pase: 0, regate: 0, velo: 0, tiro: 0, cabe: 0, fisi: 0, visi: 0 };
    if (pos === "POR") { b.def = 14; b.visi = 8; b.cabe = 4; }
    if (pos === "DEF") { b.def = 15; b.cabe = 11; b.fisi = 8; }
    if (pos === "LAT") { b.velo = 12; b.regate = 8; b.def = 8; b.fisi = 6; }
    if (pos === "PIV") { b.pase = 13; b.visi = 10; b.def = 10; b.fisi = 8; }
    if (pos === "MC")  { b.pase = 13; b.visi = 12; b.fisi = 6; }
    if (pos === "MP")  { b.pase = 10; b.visi = 12; b.regate = 8; b.tiro = 8; }
    if (pos === "EXT") { b.velo = 13; b.regate = 12; b.pase = 6; }
    if (pos === "ATA") { b.tiro = 13; b.velo = 9; b.cabe = 9; b.fisi = 6; }
    return b;
  }

  function posWeight(pos) {
    const w = { def: .12, pase: .12, regate: .12, velo: .12, tiro: .12, cabe: .12, fisi: .14, visi: .14 };
    const b = posBias(pos);
    for (const k in w) w[k] += b[k] * .035;
    return w;
  }

  function genPlayer(country, divLevel, ageShift) {
    const fns = D.firstNames[country], lns = D.lastNames[country];
    const name = pick(fns) + " " + pick(lns);
    const pos = pick(["POR","POR","DEF","DEF","DEF","LAT","LAT","PIV","PIV","MC","MC","MP","EXT","EXT","ATA","ATA","ATA"]);
    const pool = { 1: [62, 86], 2: [52, 74], 3: [44, 63], 4: [35, 54] }[divLevel];
    const mediaTarget = rnd(pool[0], pool[1]);
    const age = ri(17, 34) + (ageShift || 0);
    const attrs = {};
    const bias = posBias(pos);
    for (const a of D.attrs) {
      let v = mediaTarget + rnd(-14, 10) + bias[a.key];
      v = clamp(v, 18, 97);
      attrs[a.key] = Math.round(v);
    }
    const w = posWeight(pos);
    let media = 0, tw = 0;
    for (const a of D.attrs) { media += attrs[a.key] * w[a.key]; tw += w[a.key]; }
    media = clamp(media / tw, 30, 95);
    const wealth = D.countries.find(c => c.id === country).id === "alb" ? 1.25 : 1;
    const wage = Math.max(5000, Math.round(Math.pow(media - 32, 2) * 95 * wealth * (0.85 + rnd(0, .4))));
    const pot = age <= 21 ? clamp(media + ri(5, 18), media, 96) : media;
    const role = pick(D.roles[pos]);
    return {
      id: uid(), name, pos, role: role.code, age,
      attrs, media: Math.round(media), pot: Math.round(pot),
      energy: ri(55, 92), morale: ri(55, 82), form: ri(45, 75),
      wage, contract: { month: 6, year: ri(1, 3) },
      injury: null, listed: false, wantOut: false, wantMin: false,
      goals: 0, apps: 0, value: Math.round(wage * 24 + media * media * 320)
    };
  }

  const squadPlan = ["POR","POR","DEF","DEF","DEF","DEF","LAT","LAT","PIV","PIV","MC","MC","MP","EXT","EXT","ATA","ATA","ATA"];

  function genClub(country, division, index, allNames) {
    let name;
    do { name = genClubName(country); } while (allNames.has(name));
    allNames.add(name);
    const strength = {
      1: [68, 84], 2: [58, 73], 3: [48, 63], 4: [38, 55]
    }[division];
    const players = squadPlan.map(p => genPlayer(country, division, 0));
    // afina o nível do clube
    players.forEach(pl => {
      const target = rnd(strength[0], strength[1]);
      const shift = clamp(target - pl.media, -10, 12);
      for (const a of D.attrs) pl.attrs[a.key] = clamp(Math.round(pl.attrs[a.key] + shift * .9), 15, 97);
      const w = posWeight(pl.pos);
      let m = 0, tw = 0;
      for (const a of D.attrs) { m += pl.attrs[a.key] * w[a.key]; tw += w[a.key]; }
      pl.media = Math.round(clamp(m / tw, 30, 95));
      pl.wage = Math.max(4000, Math.round(Math.pow(pl.media - 30, 2) * 90 * (D.countries.find(c => c.id === country).id === "alb" ? 1.25 : 1)));
      pl.value = Math.round(pl.wage * 24 + pl.media * pl.media * 320);
    });
    const style = pick(D.styleKeys);
    return {
      id: uid(), name, country, division, style, index,
      players, rivals: [], coach: ri(1, 3),
      form: 55, fan: 60
    };
  }

  function genWorld(countryId) {
    const c = D.countries.find(x => x.id === countryId);
    const clubs = [], byDiv = {};
    const allNames = new Set();
    for (let d = 1; d <= c.divisions; d++) {
      byDiv[d] = [];
      for (let i = 0; i < 8; i++) {
        const club = genClub(countryId, d, i, allNames);
        clubs.push(club); byDiv[d].push(club);
      }
    }
    // rivais (derby) na mesma liga
    for (let d = 1; d <= c.divisions; d++) {
      const div = byDiv[d];
      for (const club of div) {
        const others = div.filter(x => x !== club);
        const rival = pick(others);
        club.rivals = [rival.id];
        rival.rivals.push(club.id);
      }
    }
    return { country: c, clubs, byDiv };
  }

  function fixturesFor(clubs) {
    // round-robin duplo (8 equipes -> 14 rodadas)
    const ids = clubs.map(c => c.id);
    const n = ids.length;
    const rounds = [];
    const arr = ids.slice(0, n - 1);
    const anchor = ids[n - 1];
    for (let r = 0; r < n - 1; r++) {
      const pairing = [[anchor, arr[0]]];
      for (let i = 1; i < n / 2; i++) pairing.push([arr[i], arr[n - 1 - i]]);
      rounds.push(pairing);
      arr.unshift(arr.pop());
    }
    const all = [];
    rounds.forEach((r, i) => {
      r.forEach(([h, a]) => all.push({ round: i + 1, home: h, away: a }));
      r.forEach(([h, a]) => all.push({ round: i + 1 + (n - 1), home: a, away: h }));
    });
    return all;
  }

  /* ---------- escalação e força ---------- */
  function posOfSlot(slot) {
    return slot === "LAT" ? "LAT" : slot;
  }

  function fitSlot(player, slot) {
    const map = {
      POR: ["POR"], DEF: ["DEF", "LAT"], LAT: ["LAT", "DEF"], PIV: ["PIV", "MC"],
      MC: ["MC", "PIV"], MP: ["MP", "EXT", "MC"], EXT: ["EXT", "MP", "ATA"], ATA: ["ATA", "EXT"]
    };
    return map[slot].includes(player.pos);
  }

  function available(state, club, forXi, players) {
    const list = players || club.players;
    return list.filter(p => !p.injury && !p.loanedOut && (!forXi || !p.listed));
  }

  function pickXI(state, club, lineup, players) {
    // lineup = {formation, slots, bySlot} -> escolhe melhor por slot;
    // bySlot["SLOT_i"] fixa um jogador naquele slot (manual)
    const slots = D.formations[lineup.formation].slots;
    const av = available(state, club, true, players);
    const xi = [];
    const used = new Set();
    const score = p => {
      const w = D.styles[lineup.style].w;
      let s = 0, tw = 0;
      for (const a of D.attrs) { s += p.attrs[a.key] * w[a.key]; tw += w[a.key]; }
      const r = s / tw + p.morale * .05 + p.form * .02 - (p.energy < 45 ? 8 : p.energy < 30 ? 18 : 0) - (p.wantOut ? 4 : 0);
      return r;
    };
    slots.forEach((slot, idx) => {
      const key = slot + "_" + idx;
      const manualId = lineup.bySlot ? lineup.bySlot[key] : null;
      if (manualId) {
        const mp = av.find(p => p.id === manualId && !used.has(p.id) && fitSlot(p, slot));
        if (mp) { xi.push({ slot, player: mp, key }); used.add(mp.id); return; }
      }
      let best = null, bs = -1e9;
      for (const p of av) {
        if (used.has(p.id) || !fitSlot(p, slot)) continue;
        const s = score(p) + (p.pos === slot ? 2 : 0);
        if (s > bs) { bs = s; best = p; }
      }
      if (!best) return;
      xi.push({ slot, player: best, key });
      used.add(best.id);
    });
    return { xi, bench: av.filter(p => !used.has(p.id)) };
  }

  function teamStrength(state, club, lineup, isHome, mental, liveEnergy, players) {
    const { xi } = pickXI(state, club, lineup, players);
    const style = D.styles[lineup.style];
    const press = D.presses[lineup.press] || D.presses.MED;
    const zone = { DEF: [], MID: [], ATK: [] };
    const slotZone = s => (["DEF","LAT"].includes(s) ? "DEF" : ["PIV","MC","MP"].includes(s) ? "MID" : "ATK");
    for (const { slot, player } of xi) {
      const w = style.w;
      let r = 0, tw = 0;
      for (const a of D.attrs) { r += player.attrs[a.key] * w[a.key]; tw += w[a.key]; }
      r = r / tw;
      const energy = liveEnergy ? liveEnergy[player.id] ?? player.energy : player.energy;
      r *= (0.55 + 0.45 * (energy / 100));
      r *= (0.8 + 0.2 * (player.morale / 100));
      r += (player.form - 50) * .06;
      zone[slotZone(slot)].push(r);
    }
    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 55;
    const ment = D.mentalities[mental].zone;
    let def = avg(zone.DEF) * ment[0];
    let mid = avg(zone.MID) * ment[1];
    let atk = avg(zone.ATK) * ment[2];
    def *= press.def;
    atk *= press.atk;
    if (isHome) { def *= 1.02; mid *= 1.02; atk *= 1.04; }
    return { def, mid, atk, xi };
  }

  function clubStrengthFor(state, club, isHome) {
    // IA: formação aleatória fixa por clube, estilo fixo
    const lineup = { formation: pick(Object.keys(D.formations)), style: club.style, mentality: pick(["DEF","EQU","OFE"]) };
    return teamStrength(state, club, lineup, isHome, lineup.mentality, null);
  }

  /* ---------- motor de partida ---------- */
  const mkMatch = (state, home, away) => ({
    home, away, score: [0, 0], events: [], shots: [0, 0],
    poss: [50, 50], cards: [0, 0], subs: [0, 0], minute: 0, live: [], liveEnergy: {}
  });

  function liveEvents(state, m, t, side, text, opts) {
    m.live.push({ min: t, side, text, ...(opts || {}) });
    m.events.push({ min: t, side, text, ...(opts || {}) });
  }

  function simMatch(state, homeId, awayId, live, userLineup, userHome, liveEnergy) {
    const home = state.world.clubs.find(c => c.id === homeId);
    const away = state.world.clubs.find(c => c.id === awayId);
    const m = mkMatch(state, home, away);
    const isUserHome = userHome === homeId && userLineup;
    const isUserAway = userHome === awayId && userLineup;

    const hs = isUserHome ? teamStrength(state, home, userLineup, true, userLineup.mentality, liveEnergy, state.squad)
                          : clubStrengthFor(state, home, true);
    const as = isUserAway ? teamStrength(state, away, userLineup, false, userLineup.mentality, liveEnergy, state.squad)
                          : clubStrengthFor(state, away, false);

    const hName = home.name, aName = away.name;
    const hShort = home.name.split(" ")[0], aShort = away.name.split(" ")[0];

    const eH = clamp(1.35 + (hs.atk - as.def) * .055 + .08 + (hs.mid - as.mid) * .03, .25, 3.8);
    const eA = clamp(1.35 + (as.atk - hs.def) * .055 - .08 + (as.mid - hs.mid) * .03, .25, 3.8);
    const poisson = (l) => { let L = Math.exp(-l), k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; };
    let gH = poisson(eH), gA = poisson(eA);
    if (gH + gA > 9) { gH = Math.floor(gH / 2); gA = Math.floor(gA / 2); }
    m.score = [gH, gA];

    const minutes = [];
    for (let t = 2; t <= 90; t += 2) minutes.push(t);
    // eventos principais: gols + chances
    const nEv = ri(16, 24);
    const evMins = [];
    for (let i = 0; i < nEv; i++) evMins.push(pick(minutes));
    evMins.sort((a, b) => a - b);

    let gLeft = [gH, gA];
    const whoScored = (side) => {
      const club = side === 0 ? home : away;
      const { xi } = (side === 0 ? hs : as);
      const atk = xi.filter(x => ["ATK","EXT","MP"].includes(x.slot));
      const pool = atk.length ? atk : xi;
      const w = [];
      for (const { player } of pool) w.push({ player, wt: player.media * (player.pos === "ATA" ? 1.3 : 1) });
      const total = w.reduce((s, x) => s + x.wt, 0);
      if (!total) return null;
      let r = Math.random() * total;
      for (const x of w) { r -= x.wt; if (r <= 0) return x.player; }
      return w[w.length - 1].player;
    };

    const whoAssist = (side, scorer) => {
      const club = side === 0 ? home : away;
      const { xi } = (side === 0 ? hs : as);
      const pool = xi.filter(x => x.player.id !== scorer.id && ["EXT","MP","ATK","MID"].includes(x.slot));
      const w = pool.map(x => ({ player: x.player, wt: x.player.media * (x.player.pos === "ME" ? 1.2 : 1) }));
      const total = w.reduce((s, x) => s + x.wt, 0);
      if (!total) return null;
      let r = Math.random() * total;
      for (const x of w) { r -= x.wt; if (r <= 0) return x.player; }
      return w[w.length - 1].player;
    };

    const goalsScored = [0, 0];
    for (const t of evMins) {
      // distribui: se faltam gols, mais chance de gol
      const gTotal = gLeft[0] + gLeft[1];
      if (gTotal > 0 && chance(.38)) {
        const p0 = gLeft[0] / gTotal;
        const side = Math.random() < p0 ? 0 : 1;
        const p = whoScored(side);
        if (!p) continue;
        goalsScored[side]++;
        gLeft[side]--;
        m.shots[side]++;
        const assist = chance(.65) ? whoAssist(side, p) : null;
        const txt = pick(D.cmt.goal).replace("{p}", p.name).replace("{c}", side === 0 ? hShort : aShort);
        liveEvents(state, m, t, side, txt, { type: "goal", player: p.id, assist: assist ? assist.id : null });
      } else if (chance(.5)) {
        const side = Math.random() < .5 ? 0 : 1;
        const p = whoScored(side);
        if (!p) continue;
        m.shots[side]++;
        const txt = pick(D.cmt.chance).replace("{p}", p.name);
        liveEvents(state, m, t, side, txt, { type: "chance", player: p.id });
      }
      // cartões
      if (chance(.055)) {
        const side = Math.random() < .5 ? 0 : 1;
        const p = whoScored(side);
        if (!p) continue;
        m.cards[side]++;
        const txt = pick(D.cmt.yellow).replace("{p}", p.name);
        liveEvents(state, m, t, side, txt, { type: "card", player: p.id });
      }
      // lesão
      if (chance(.04)) {
        const side = Math.random() < .5 ? 0 : 1;
        const p = whoScored(side);
        if (!p) continue;
        const txt = pick(D.cmt.injury).replace("{p}", p.name);
        liveEvents(state, m, t, side, txt, { type: "injury", player: p.id });
      }
    }
    m.poss = [Math.round(50 + (hs.mid - as.mid) * 3), Math.round(50 - (hs.mid - as.mid) * 3)];
    if (live) liveEvents(state, m, 92, 0, "Fim de jogo.", { type: "end" });
    return m;
  }

  /* ---------- aplicação de resultado ---------- */
  function applyResult(state, m, userClub, userLineup, liveEnergy) {
    const isHome = m.home.id === userClub.id;
    const us = isHome ? 0 : 1;
    const them = 1 - us;
    const gU = m.score[us], gT = m.score[them];
    const result = gU > gT ? "W" : gU < gT ? "L" : "D";
    const derby = m[us === 0 ? "away" : "home"].rivals.includes(userClub.id);

    // moral / forma / energia (sempre sobre o plantel real do usuário)
    const press = D.presses[state.lineup.press] || D.presses.MED;
    const { xi } = pickXI(state, userClub, userLineup, state.squad);
    const xiIds = new Set(xi.map(x => x.player.id));
    for (const p of state.squad) {
      if (p.injury) continue;
      const started = xiIds.has(p.id);
      if (started) {
        p.energy = clamp(p.energy - (state.flagGuerra ? 2 : 1) * D.econ.energyDrainStarters * press.energy, 10, 100);
        p.morale = clamp(p.morale + (result === "W" ? 6 : result === "D" ? 1 : -6), 5, 100);
        p.apps++;
        if (result === "W") p.form = clamp(p.form + 6, 5, 100); else if (result === "L") p.form = clamp(p.form - 5, 5, 100);
      } else {
        p.energy = clamp(p.energy - 3 * press.energy, 10, 100);
        if (result === "W") p.morale = clamp(p.morale + 2, 5, 100);
      }
      if (p.wantOut && p.morale > 60) p.wantOut = false;
    }
    // gols / assistências do user
    const scorers = m.events.filter(e => e.type === "goal" && e.side === us);
    for (const e of scorers) {
      const p = state.squad.find(x => x.id === e.player);
      if (p) p.goals++;
      if (e.assist) {
        const a = state.squad.find(x => x.id === e.assist);
        if (a) a.assists++;
      }
    }
    // cartões do user
    const cardEvs = m.events.filter(e => e.type === "card" && e.side === us);
    for (const e of cardEvs) {
      const p = state.squad.find(x => x.id === e.player);
      if (p) p.yellow++;
    }
    // nota da partida para titulares
    for (const { player } of xi) {
      const g = scorers.filter(e => e.player === player.id).length;
      const a = scorers.filter(e => e.assist === player.id).length;
      const y = cardEvs.filter(e => e.player === player.id).length;
      let r = 6.4 + (result === "W" ? .5 : result === "L" ? -.4 : 0) + g * 1.1 + a * .6 - y * .2;
      r = clamp(Math.round(r * 10) / 10, 3, 10);
      player.ratingSum = (player.ratingSum || 0) + r;
      player.ratingN = (player.ratingN || 0) + 1;
    }
    // lesões do user
    const injEvents = m.events.filter(e => e.type === "injury" && e.side === us);
    for (const e of injEvents) {
      const p = state.squad.find(x => x.id === e.player);
      if (p && !p.injury) p.injury = { days: Math.round(ri(5, 15) * (state.flagFragil ? 1.6 : 1) * D.staff.doctor.inj[state.staff.doctor] * 10 / D.facilities.clinic.rec[state.facilities.clinic]) };
    }
    // cartões -> suspensão leve (prototype: sem suspensão, só histórico)
    // diretiva / aficción
    const mult = state.flagJunta ? 2 : 1;
    const fanMult = derby ? 1.6 : 1;
    state.boardConf = clamp(state.boardConf + (result === "W" ? 8 : result === "D" ? 2 : -8 * mult), 0, 100);
    state.fan = clamp(state.fan + (result === "W" ? 8 : result === "D" ? 2 : -8) * fanMult, 5, 100);
    userClub.form = clamp(userClub.form + (result === "W" ? 12 : result === "D" ? 2 : -12), 5, 100);

    const homeShort = m.home.name.split(" ")[0], awayShort = m.away.name.split(" ")[0];
    const line = `${homeShort} ${m.score[0]}–${m.score[1]} ${awayShort}` + (derby ? " (DERBY)" : "");
    state.results.push({ round: state.round, line, result, gU, gT });
    state.news.unshift({
      icon: result === "W" ? "match" : result === "D" ? "match" : "match",
      text: result === "W" ? `Vitória: ${line}.` : result === "D" ? `Empate: ${line}.` : `Derrota: ${line}.`,
      day: state.day
    });
    // promessa de artilharia: verifica goleadores
    state.squadGoals = scorers.length;
    // energia média para avisos
    state.lastResult = result;
  }

  /* ---------- tabela ---------- */
  function getTable(state) {
    const div = state.world.byDiv[state.division];
    const rows = div.map(c => {
      const rec = state.tables[state.division][c.id] || { pts: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
      return { club: c, ...rec };
    });
    rows.sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
    return rows;
  }

  function applyScoreTable(state, m, homeId, awayId) {
    for (const [id, g, ga] of [[homeId, m.score[0], m.score[1]], [awayId, m.score[1], m.score[0]]]) {
      const t = state.tables[state.division][id] = state.tables[state.division][id] || { pts: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
      t.gf += g; t.ga += ga;
      if (g > ga) { t.w++; t.pts += 3; } else if (g === ga) { t.d++; t.pts += 1; } else t.l++;
    }
    // artilheiros da liga: gols de quem marcou
    for (const e of m.events) {
      if (e.type === "goal") {
        const sideClub = e.side === 0 ? m.home : m.away;
        const players = sideClub.id === state.clubId ? state.squad : sideClub.players;
        const p = players.find(x => x.id === e.player);
        if (p) state.scorers[p.id] = (state.scorers[p.id] || 0) + 1;
      }
    }
  }

  function simOtherFixtures(state, round) {
    const fixtures = state.fixtures.filter(f => f.round === round && (f.home !== state.clubId && f.away !== state.clubId));
    for (const f of fixtures) {
      const m = simMatch(state, f.home, f.away, false, null, null, null);
      applyScoreTable(state, m, f.home, f.away);
      const hClub = state.world.clubs.find(c => c.id === f.home);
      const aClub = state.world.clubs.find(c => c.id === f.away);
      for (const e of m.events) {
        const club = e.side === 0 ? hClub : aClub;
        if (!club) continue;
        const p = club.players.find(x => x.id === e.player);
        if (e.type === "goal") { if (p) p.goals = (p.goals || 0) + 1; if (e.assist) { const a = club.players.find(x => x.id === e.assist); if (a) a.assists = (a.assists || 0) + 1; } }
        else if (e.type === "card") { if (p) p.yellow = (p.yellow || 0) + 1; }
      }
      // energia das outras equipes
      const drainClub = c => c.players.forEach(p => { p.energy = clamp(p.energy - (p.apps % 2 ? 12 : 8), 15, 100); });
      drainClub(hClub);
      drainClub(aClub);
    }
  }

  /* ---------- calendário / dia ---------- */
  function matchDayFor(state) {
    // rodada r no dia (r-1)*7+1 da temporada
    return (state.round - 1) * 7 + 1;
  }

  function userFixture(state) {
    return state.fixtures.find(f => f.round === state.round && (f.home === state.clubId || f.away === state.clubId));
  }

  function monthPay(state) {
    let out = 0;
    for (const p of state.squad) out += p.wage;
    for (const k of D.staffKeys) out += D.staffSalary[state.staff[k]];
    let inc = 0;
    const m = state.flagHambre ? .5 : 1;
    if (state.sponsor.shirt) inc += state.sponsor.shirt.income;
    if (state.sponsor.stadium) inc += state.sponsor.stadium.income;
    inc *= m;
    inc += state.fan * 40000 * D.facilities.shop.mch[state.facilities.shop] * m;
    state.cash += inc - out;
    state.monthHistory.push({ m: state.cal.month + "/" + state.cal.year, inc, out });
    if (state.cash < 0) state.negMonths++; else state.negMonths = 0;
    if (state.negMonths >= D.econ.bankruptMonthLimit || state.cash < -D.econ.debtLimit) {
      state.dead = { reason: "bankrupt", text: "O clube não conseguiu pagar suas dívidas. A diretoria declarou falência." };
    }
  }

  function youthGrowth(state) {
    const dev = D.facilities.training.dev[state.facilities.training] + D.staff.coach.dev[state.staff.coach] + (state.staff.youthDir > 0 ? D.staff.youthDir.pot[state.staff.youthDir] * .02 : 0);
    for (const p of state.academy) {
      for (const a of D.attrs) p.attrs[a.key] = clamp(Math.round(p.attrs[a.key] + dev * .5 + rnd(0, .8)), 15, 97);
      const w = posWeight(p.pos);
      let m = 0, tw = 0;
      for (const a of D.attrs) { m += p.attrs[a.key] * w[a.key]; tw += w[a.key]; }
      p.media = Math.round(clamp(m / tw, 25, 96));
      p.academyDays = (p.academyDays || 0) + 1;
    }
    // crescimento pequeno do plantel sub-23
    for (const p of state.squad) {
      if (p.age <= 23 && p.media < p.pot) {
        p.media = Math.round(clamp(p.media + dev * .35, 25, p.pot));
      }
    }
  }

  function injuryRecover(state) {
    const rec = D.facilities.clinic.rec[state.facilities.clinic] * D.staff.doctor.inj[state.staff.doctor];
    for (const p of [...state.squad, ...state.academy]) {
      if (p.injury) {
        p.injury.days--;
        if (p.injury.days <= 0) {
          p.injury = null;
          state.news.unshift({ icon: "injury", text: `${p.name} recuperou da lesão.`, day: state.day });
        }
      }
    }
    for (const p of state.squad) {
      if (!p.injury) p.energy = clamp(p.energy + rec * (state.flagGuerra ? .5 : 1), 10, 100);
    }
    for (const p of state.academy) p.energy = clamp(p.energy + 10, 10, 100);
  }

  function isMatchDay(state) {
    return state.phase === "season" && state.day === matchDayFor(state);
  }

  function rollOffdayEvent(state) {
    // datas fixas + eventos aleatórios
    const pendingType = t => state.pending.some(p => p.type === t);
    if (state.phase === "offseason") {
      if (state.cal.month === 7 && state.cal.day === 10 && !state.tourDone && !pendingType("tour")) return mkEvent(state, "tour");
      if (state.cal.month === 7 && state.cal.day === 15 && !state.intakeDone && !pendingType("intake")) return mkEvent(state, "intake");
      return null;
    }
    if (!chance(.4)) return null;
    const r = Math.random();
    if ((state.sponsor.shirt === null || state.sponsor.stadium === null) && r < .3) return mkEvent(state, "sponsor");
    if (r < .2) return mkEvent(state, "press");
    if (r < .35) return mkEvent(state, "friendly");
    if (r < .5) return mkEvent(state, "course");
    const wantMin = state.squad.filter(p => p.apps <= 2 && !p.injury && p.age >= 22 && p.media >= 55);
    if (wantMin.length && r < .6) return mkEvent(state, "wantsMinutes", { playerId: wantMin[0].id });
    if (r < .7) return mkEvent(state, "renewal");
    const loanCand = state.squad.some(p => p.loanListed && !p.loanedOut && !p.injury);
    if (r < .78 && loanCand) return mkEvent(state, "loanOutReq");
    if (r < .86) return mkEvent(state, "loanIn");
    if (r < .93) return mkEvent(state, "sellOffer");
    return mkEvent(state, "press");
  }

  function mkEvent(state, type, data) {
    state.pending.push({ id: uid(), type, data: data || {}, day: state.day });
    return state.pending[state.pending.length - 1];
  }

  /* ---------- eventos / decisões ---------- */
  const ev = {
    press(state, e) {
      const player = state.squad.find(p => p.id === e.data.playerId) || state.squad[ri(0, state.squad.length - 1)];
      e.data.playerId = player.id;
      e.title = "📰 Conferência de imprensa";
      e.text = `Os jornalistas perguntam sobre ${player.name}, criticado pela imprensa após os últimos jogos. Como responde?`;
      e.options = [
        { key: "defend", label: "🛡️ Defender o jogador", hint: "+6 moral dele, -3 confiança, -2 aficción" },
        { key: "calm", label: "😌 Resposta serena", hint: "+2 moral do plantel" },
        { key: "skip", label: "🤐 Sem comentários", hint: "Sem consequências" }
      ];
    },
    friendly(state, e) {
      const amount = D.econ.friendlyGain * ri(8, 14);
      e.data.amount = amount;
      e.title = "✈️ Convite para amistoso";
      e.text = `Um clube estrangeiro oferece ${fmtM(amount)} por um amistoso no meio de semana. O corpo técnico avisa: são minutos nas pernas dos titulares. Há também uma variante beneficente, sem cachê, mas com muita repercussão local.`;
      e.options = [
        { key: "accept", label: "💰 Aceitar pelo cachê", hint: `+${fmtM(amount)}, titulares chegam cansados` },
        { key: "charity", label: "❤️ Amistoso beneficente", hint: "+3 aficción, +5 moral, sem dinheiro" },
        { key: "decline", label: "❌ Recusar", hint: "Energia preservada" }
      ];
    },
    sponsor(state, e) {
      if (state.sponsor.shirt === null) e.data.kind = "shirt";
      else if (state.sponsor.stadium === null) e.data.kind = "stadium";
      else return null;
      const pool = e.data.kind === "shirt" ? D.econ.sponsorShirt : D.econ.sponsorStadium;
      const offers = [];
      for (let i = 0; i < 3; i++) {
        const income = pool[ri(0, pool.length - 1)];
        offers.push({ name: pick(["Banco Nova","Aço Sul","Lácteos Vale","TecnoWave","Café Alto","Seguro Plus","MotorX","Água Pura"]), income: Math.round(income * rnd(.8, 1.15)) });
      }
      e.data.offers = offers;
      e.title = "🤝 Oferta de patrocinador";
      e.text = `Não há patrocinador de ${e.data.kind === "shirt" ? "camiseta" : "estádio"}. Cada mês sem contrato é dinheiro perdido. Escolha uma oferta (pagamento mensal):`;
      e.options = offers.map((o, i) => ({ key: "o" + i, label: `${o.name} — ${fmtM(o.income)}/mês`, hint: "Firmar contrato" }));
      e.options.push({ key: "skip", label: "⏳ Ainda não", hint: "Perde dinheiro até assinar" });
    },
    course(state, e) {
      const eligible = D.staffKeys.filter(k => state.staff[k] < 3);
      if (!eligible.length) return null;
      const cost = ri(2, 5) * 100000;
      e.data.cost = cost;
      e.title = "🎓 Curso da federação";
      e.text = `A federação abriu uma vaga num curso profissional. Pode inscrever um membro da equipe técnica para subir um nível. Inscrição: ${fmtM(cost)}.`;
      e.options = D.staffKeys.filter(k => state.staff[k] < 3).map(k => ({
        key: k, label: `${D.staff[k].icon} ${D.staff[k].name} (nível ${state.staff[k]} → ${state.staff[k] + 1})`, hint: fmtM(cost)
      }));
      e.options.push({ key: "skip", label: "⏳ Não agora", hint: "" });
    },
    wantsMinutes(state, e) {
      const p = state.squad.find(x => x.id === e.data.playerId);
      if (!p) return null;
      e.title = "😠 " + p.name + " quer mais minutos";
      e.text = `${p.name} acha que merece mais protagonismo e pede que você conte com ele.`;
      e.options = [
        { key: "promise", label: "📋 Prometer minutos", hint: "+8 moral dele; se não jogar, fica pior" },
        { key: "none", label: "😐 Conversar sem prometer", hint: "+2 moral" }
      ];
    },
    renewal(state, e) {
      const cand = state.squad.filter(p => !p.loanedOut && (p.contract.month === 6 || p.contract.year === 1)).sort((a, b) => b.media - a.media);
      if (!cand.length) return null;
      const p = cand[0];
      e.data.playerId = p.id;
      e.title = "📝 " + p.name + " quer renovar";
      e.text = `${p.name} termina o contrato em junho e quer sentir que o clube aposta nele. Salário atual: ${fmtM(p.wage)}/mês.`;
      e.options = [
        { key: "renew2", label: "✍️ Renovar por 2 anos", hint: `Salário +10% (${fmtM(Math.round(p.wage * 1.1))}/mês)` },
        { key: "renew1", label: "✍️ Renovar por 1 ano", hint: "Salário igual" },
        { key: "refuse", label: "❌ Não renovar", hint: "Ele pode se irritar ou sair de graça" }
      ];
    },
    sellOffer(state, e) {
      const cand = state.squad.filter(p => !p.loanedOut && p.media > 55).sort((a, b) => b.media - a.media);
      if (!cand.length) return null;
      const p = cand[ri(0, Math.min(cand.length - 1, 2))];
      const amount = Math.round(p.value * rnd(.85, 1.25));
      e.data.playerId = p.id; e.data.amount = amount;
      e.title = "🔄 Oferta de venda";
      e.text = `O clube rival ${pick(["Beira-mar FC","Almeda CF","Fallow Town","Dunwich FC"]).split(" ")[0]} oferece ${fmtM(amount)} por ${p.name} (média ${p.media}).`;
      e.options = [
        { key: "sell", label: "✅ Aceitar", hint: `+${fmtM(amount)} na caixa` },
        { key: "reject", label: "❌ Recusar", hint: "Ele pode ficar descontente" }
      ];
    },
    loanIn(state, e) {
      const other = state.world.clubs.find(c => c.id !== state.clubId && c.players.some(p => !p.injury));
      const club = pick(state.world.byDiv[state.division].filter(c => c.id !== state.clubId));
      const p = pick(club.players.filter(x => !x.injury && x.media > 50));
      e.data.playerId = p.id; e.data.clubId = club.id;
      e.title = "🔁 Empréstimo de " + p.name;
      e.text = `${club.name} aceita ceder ${p.name} (média ${p.media}, ${p.age} anos) até 30 de junho. Você paga o salário (${fmtM(p.wage)}/mês) enquanto ele estiver aqui.`;
      e.options = [
        { key: "accept", label: "✅ Aceitar empréstimo", hint: "Ocupa vaga de plantel até junho" },
        { key: "reject", label: "❌ Recusar", hint: "" }
      ];
    },
    loanOutReq(state, e) {
      let cand = state.squad.filter(p => p.loanListed && !p.loanedOut && !p.injury);
      if (!cand.length) cand = state.squad.filter(p => !p.loanedOut && !p.injury && p.age <= 23 && p.media < 70);
      if (!cand.length) return null;
      const p = cand[ri(0, cand.length - 1)];
      const club = pick(state.world.byDiv[state.division].filter(c => c.id !== state.clubId));
      e.data.playerId = p.id; e.data.clubId = club.id;
      e.title = "🔁 " + club.name + " quer " + p.name;
      e.text = `${club.name} quer ${p.name} emprestado até 30 de junho. Eles assumem o salário e ele volta com minutos nas pernas.`;
      e.options = [
        { key: "accept", label: "✅ Ceder por empréstimo", hint: "Evolui e volta em junho" },
        { key: "reject", label: "❌ Manter no plantel", hint: "" }
      ];
    },
    youthPromote(state, e) {
      const p = state.academy.find(x => x.id === e.data.playerId);
      if (!p) return null;
      e.title = "🌱 " + p.name + " faz 18 anos";
      e.text = `${p.name} (média ${p.media}, potencial ${p.pot}) esgotou a idade de academia. Decida o futuro dele:`;
      e.options = [
        { key: "promote", label: "✅ Subir com contrato profissional", hint: `~${fmtM(Math.max(5000, p.wage))}/mês, ocupa vaga` },
        { key: "market", label: "🔄 Subir e pôr no mercado", hint: "Chegarão ofertas" },
        { key: "release", label: "🚪 Deixar sair de graça", hint: "Se despontar em outro clube, vai doer" }
      ];
    },
    tour(state, e) {
      e.title = "✈️ Gira veraneiga (10 de julho)";
      e.text = "A pré-temporada pode focar-se em dinheiro, forma, aficción ou desenvolvimento. Os amistosos procuram rivais equilibrados.";
      e.options = [
        { key: "cash", label: "💰 Dinheiro", hint: `+${fmtM(D.econ.friendlyGain * 12)} em amistosos` },
        { key: "form", label: "💪 Forma", hint: "+8 forma em todo o plantel" },
        { key: "fan", label: "📣 Aficción", hint: "+10 aficción" },
        { key: "dev", label: "🌱 Desenvolvimento", hint: "+15 desenvolvimento da academia" }
      ];
    },
    intake(state, e) {
      e.title = "🌱 Fornada da cantera (15 de julho)";
      const count = Math.min(4, Math.round(D.facilities.cantera.youth[state.facilities.cantera]) + (state.flagCantera ? 2 : 0));
      e.data.count = count;
      e.text = `Chegam ${count} canteranos à academia (capacidade ${state.academy.length}/12). Sua qualidade depende da cantera e do diretor.`;
      e.options = [{ key: "ok", label: "✅ Receber a fornada", hint: "" }];
    },
    derbyWarning(state, e) {
      e.title = "🔥 É dia de derby!";
      const f = userFixture(state);
      const rival = f.home === state.clubId ? f.away : f.home;
      e.text = `${rival.name} é o grande rival. Uma derrota abala a aficción e o vestiário em dobro.`;
      e.options = [{ key: "ok", label: "⚽ Vamos lá", hint: "" }];
    }
  };

  function resolve(state, pendingId, optionKey) {
    const idx = state.pending.findIndex(p => p.id === pendingId);
    if (idx < 0) return;
    const e = state.pending[idx];
    const opt = e.options.find(o => o.key === optionKey);
    if (!opt) { state.pending.splice(idx, 1); return; }
    switch (e.type) {
      case "press": {
        const p = state.squad.find(x => x.id === e.data.playerId);
        if (opt.key === "defend" && p) {
          p.morale = clamp(p.morale + 6, 5, 100);
          state.boardConf = clamp(state.boardConf - 3, 0, 100);
          state.fan = clamp(state.fan - 2, 5, 100);
          state.news.unshift({ icon: "press", text: `Você defendeu ${p.name} na imprensa. Moral dele +6, diretiva -3, aficción -2.`, day: state.day });
        } else if (opt.key === "calm") {
          state.squad.forEach(x => x.morale = clamp(x.morale + 2, 5, 100));
          state.news.unshift({ icon: "press", text: "Resposta serena na imprensa: plantel +2 moral.", day: state.day });
        }
        break;
      }
      case "friendly": {
        if (opt.key === "accept") {
          state.cash += e.data.amount;
          state.news.unshift({ icon: "tour", text: `Amistoso pago: +${fmtM(e.data.amount)}. Titulares com menos energia.`, day: state.day });
        } else if (opt.key === "charity") {
          state.fan = clamp(state.fan + 3, 5, 100);
          state.squad.forEach(p => p.morale = clamp(p.morale + 5, 5, 100));
          state.news.unshift({ icon: "tour", text: "Amistoso beneficente: +3 aficción, +5 moral.", day: state.day });
        }
        break;
      }
      case "sponsor": {
        if (opt.key.startsWith("o")) {
          const o = e.data.offers[+opt.key.slice(1)];
          state.sponsor[e.data.kind] = { name: o.name, income: o.income };
          state.news.unshift({ icon: "sponsor", text: `Patrocinador de ${e.data.kind === "shirt" ? "camiseta" : "estádio"}: ${o.name} — ${fmtM(o.income)}/mês.`, day: state.day });
        }
        break;
      }
      case "course": {
        if (opt.key !== "skip") {
          state.cash -= e.data.cost;
          state.staff[opt.key]++;
          state.news.unshift({ icon: "staff", text: `${D.staff[opt.key].name} subiu para o nível ${state.staff[opt.key]}.`, day: state.day });
        }
        break;
      }
      case "wantsMinutes": {
        const p = state.squad.find(x => x.id === e.data.playerId);
        if (p && opt.key === "promise") {
          p.morale = clamp(p.morale + 8, 5, 100);
          state.promisedMinutes = p.id;
          state.news.unshift({ icon: "press", text: `Você prometeu minutos a ${p.name}.`, day: state.day });
        } else if (p) p.morale = clamp(p.morale + 2, 5, 100);
        break;
      }
      case "renewal": {
        const p = state.squad.find(x => x.id === e.data.playerId);
        if (p && opt.key.startsWith("renew")) {
          const years = opt.key === "renew2" ? 2 : 1;
          p.contract = { month: 6, year: years };
          if (years === 2) p.wage = Math.round(p.wage * 1.1);
          p.morale = clamp(p.morale + 6, 5, 100);
          state.news.unshift({ icon: "contract", text: `${p.name} renovou por ${years} ano(s).`, day: state.day });
        } else if (p) {
          p.morale = clamp(p.morale - 5, 5, 100);
          p.wantOut = true;
          state.news.unshift({ icon: "contract", text: `${p.name} ficou chateado com a recusa de renovação.`, day: state.day });
        }
        break;
      }
      case "sellOffer": {
        const p = state.squad.find(x => x.id === e.data.playerId);
        if (p && opt.key === "sell") {
          state.cash += Math.round(e.data.amount * D.econ.sellFee);
          removeFromSquad(state, p);
          state.news.unshift({ icon: "market", text: `Venda de ${p.name} por ${fmtM(e.data.amount)}.`, day: state.day });
        }
        break;
      }
      case "loanIn": {
        const club = state.world.clubs.find(c => c.id === e.data.clubId);
        const p = club.players.find(x => x.id === e.data.playerId);
        if (p && opt.key === "accept") {
          const copy = JSON.parse(JSON.stringify(p));
          copy.id = uid(); copy.loanedIn = true; copy.contract = { month: 6, year: 0 };
          state.squad.push(copy);
          state.news.unshift({ icon: "market", text: `Empréstimo de ${p.name} até junho.`, day: state.day });
        }
        break;
      }
      case "loanOutReq": {
        const p = state.squad.find(x => x.id === e.data.playerId);
        if (p && opt.key === "accept") {
          p.loanedOut = true;
          p.morale = clamp(p.morale + 4, 5, 100);
          state.news.unshift({ icon: "market", text: `${p.name} foi emprestado e volta em junho.`, day: state.day });
        }
        break;
      }
      case "youthPromote": {
        const p = state.academy.find(x => x.id === e.data.playerId);
        if (!p) break;
        state.academy = state.academy.filter(x => x.id !== p.id);
        if (opt.key === "promote") {
          p.age = 18; p.wage = Math.max(5000, p.wage);
          p.contract = { month: 6, year: 3 };
          p.listed = false;
          state.squad.push(p);
          state.news.unshift({ icon: "youth", text: `${p.name} subiu com contrato profissional.`, day: state.day });
        } else if (opt.key === "market") {
          p.age = 18; p.listed = true;
          state.squad.push(p);
          state.news.unshift({ icon: "youth", text: `${p.name} subiu e entrou na lista de transferências.`, day: state.day });
        } else {
          state.news.unshift({ icon: "youth", text: `${p.name} saiu de graça. Se despontar em outro clube, vai doer.`, day: state.day });
        }
        break;
      }
      case "tour": {
        if (opt.key === "cash") state.cash += D.econ.friendlyGain * 12;
        if (opt.key === "form") state.squad.forEach(p => p.form = clamp(p.form + 8, 5, 100));
        if (opt.key === "fan") state.fan = clamp(state.fan + 10, 5, 100);
        if (opt.key === "dev") state.tourDev = (state.tourDev || 0) + 15;
        state.tourDone = true;
        state.news.unshift({ icon: "tour", text: "Gira veraneiga concluída.", day: state.day });
        break;
      }
      case "intake": {
        const count = e.data.count;
        for (let i = 0; i < count && state.academy.length < 12; i++) {
          const p = genPlayer(state.world.country.id, state.division, 0);
          p.age = ri(15, 17);
          const potBoost = D.staff.youthDir.pot[state.staff.youthDir] + (state.tourDev || 0);
          p.pot = clamp(p.pot + potBoost, 30, 96);
          p.energy = 90;
          state.academy.push(p);
          state.news.unshift({ icon: "youth", text: `Canterano ${p.name} (${p.pos}, potencial ${p.pot}) chegou à academia.`, day: state.day });
        }
        state.intakeDone = true;
        break;
      }
    }
    state.pending.splice(idx, 1);
  }

  function removeFromSquad(state, p) {
    state.squad = state.squad.filter(x => x.id !== p.id);
    if (state.lineup.bySlot) {
      for (const k in state.lineup.bySlot) if (state.lineup.bySlot[k] === p.id) delete state.lineup.bySlot[k];
    }
  }

  /* ---------- mercado ---------- */
  function refreshMarket(state) {
    const scoutQ = D.staff.scout.quality[state.staff.scout];
    state.market = [];
    const pool = state.world.clubs.filter(c => c.id !== state.clubId);
    const divFactor = { 1: 1, 2: .7, 3: .45, 4: .28 }[state.division];
    for (let i = 0; i < 18; i++) {
      const club = pick(pool);
      const cand = club.players.filter(p => !p.injury && p.media > 40 && p.media < 92 * scoutQ);
      if (!cand.length) continue;
      const p = JSON.parse(JSON.stringify(pick(cand)));
      p.id = uid(); p.from = club.name; p.value = Math.round(p.value * divFactor);
      p.asking = Math.round(p.value * rnd(1.08, 1.45));
      state.market.push(p);
    }
    state.market.sort((a, b) => b.media - a.media);
    // agentes livres
    state.freeAgents = [];
    for (let i = 0; i < 8; i++) {
      const p = genPlayer(state.world.country.id, state.division, 0);
      p.free = true;
      state.freeAgents.push(p);
    }
  }

  function buyPlayer(state, pid, offerPrice) {
    const p = state.market.find(x => x.id === pid);
    if (!p) return { ok: false, msg: "Jogador não encontrado." };
    if (state.flagCantera) return { ok: false, msg: "Regra do desafio impede contratar no mercado." };
    if (state.flagSangre) {
      const xi = pickXI(state, state.world.clubs.find(c => c.id === state.clubId), state.lineup, state.squad).xi;
      const avgBest = xi.reduce((s, x) => s + x.player.media, 0) / Math.max(1, xi.length);
      if (p.media > avgBest) return { ok: false, msg: `Média dele (${p.media}) é maior que a do seu melhor onze (${Math.round(avgBest)}). O talento te ignora.` };
    }
    if (state.cash < offerPrice) return { ok: false, msg: "Sem orçamento suficiente." };
    if (state.squad.length >= 20) return { ok: false, msg: "Plantel cheio (20). Venda ou empreste antes." };
    state.cash -= offerPrice;
    p.from = undefined; p.listed = false;
    state.squad.push(p);
    state.market = state.market.filter(x => x.id !== pid);
    state.news.unshift({ icon: "market", text: `Contratou ${p.name} (${p.pos}) por ${fmtM(offerPrice)}.`, day: state.day });
    return { ok: true, msg: `${p.name} assinou!` };
  }

  function signFree(state, pid) {
    const p = state.freeAgents.find(x => x.id === pid);
    if (!p) return { ok: false, msg: "Agente não encontrado." };
    if (state.flagCantera) return { ok: false, msg: "Regra do desafio impede agentes livres." };
    if (state.flagSangre) {
      const xi = pickXI(state, state.world.clubs.find(c => c.id === state.clubId), state.lineup, state.squad).xi;
      const avgBest = xi.reduce((s, x) => s + x.player.media, 0) / Math.max(1, xi.length);
      if (p.media > avgBest) return { ok: false, msg: "Média maior que a do seu melhor onze. O talento te ignora." };
    }
    const fee = p.wage * 2;
    if (state.cash < fee) return { ok: false, msg: "Sem orçamento para a prima de assinatura." };
    if (state.squad.length >= 20) return { ok: false, msg: "Plantel cheio (20)." };
    state.cash -= fee;
    state.squad.push(p);
    state.freeAgents = state.freeAgents.filter(x => x.id !== pid);
    state.news.unshift({ icon: "market", text: `Agente livre ${p.name} assinou (prima ${fmtM(fee)}).`, day: state.day });
    return { ok: true, msg: `${p.name} assinou como agente livre!` };
  }

  function listPlayer(state, pid, list) {
    const p = state.squad.find(x => x.id === pid);
    if (!p) return;
    p.listed = list;
    if (list) state.news.unshift({ icon: "market", text: `${p.name} entrou na lista de transferências.`, day: state.day });
  }

  function sellNow(state, pid) {
    const p = state.squad.find(x => x.id === pid);
    if (!p) return { ok: false, msg: "Não encontrado." };
    const offer = Math.round(p.value * rnd(.75, .95));
    state.cash += offer;
    removeFromSquad(state, p);
    state.news.unshift({ icon: "market", text: `Vendeu ${p.name} por ${fmtM(offer)}.`, day: state.day });
    return { ok: true, msg: `Vendeu ${p.name} por ${fmtM(offer)}.` };
  }

  function negotiateBuy(state, pid, offer, force) {
    const p = state.market.find(x => x.id === pid);
    if (!p) return { ok: false, msg: "Jogador não encontrado." };
    if (state.flagCantera) return { ok: false, msg: "Regra do desafio impede contratar no mercado." };
    if (state.flagSangre) {
      const xi = pickXI(state, state.world.clubs.find(c => c.id === state.clubId), state.lineup, state.squad).xi;
      const avgBest = xi.reduce((s, x) => s + x.player.media, 0) / Math.max(1, xi.length);
      if (p.media > avgBest) return { ok: false, msg: `Média dele (${p.media}) é maior que a do seu melhor onze (${Math.round(avgBest)}). O talento te ignora.` };
    }
    if (state.squad.length >= 20) return { ok: false, msg: "Plantel cheio (20). Venda ou empreste antes." };
    offer = Math.max(0, Math.round(offer));
    if (state.cash < offer) return { ok: false, msg: "Sem orçamento suficiente." };
    const accept = () => {
      state.cash -= offer;
      p.from = undefined; p.listed = false;
      state.squad.push(p);
      state.market = state.market.filter(x => x.id !== pid);
      state.news.unshift({ icon: "market", text: `Contratou ${p.name} (${p.pos}) por ${fmtM(offer)}.`, day: state.day });
      return { ok: true, msg: `${p.name} assinou por ${fmtM(offer)}!` };
    };
    if (force || offer >= p.asking) return accept();
    const ratio = offer / p.asking;
    if (ratio >= .92) {
      if (chance(.7)) return accept();
      return { ok: false, counter: Math.round(p.asking * .97), msg: "Perto, mas o clube quer mais." };
    }
    if (ratio >= .8) {
      if (chance(.45)) return accept();
      return { ok: false, counter: Math.round(p.asking * rnd(.94, 1)), msg: "O clube pede um pouco mais." };
    }
    if (chance(.25)) return { ok: false, reject: true, msg: "O clube recusa terminantemente. Volte com mais dinheiro." };
    return { ok: false, counter: Math.round(p.asking * rnd(.88, .95)), msg: "O clube recusa e contrapropõe." };
  }

  function sellOffers(state, pid) {
    const p = state.squad.find(x => x.id === pid);
    if (!p || p.loanedOut) return null;
    const pool = state.world.byDiv[state.division].filter(c => c.id !== state.clubId);
    if (!pool.length) return null;
    const clubs = [...pool].sort(() => Math.random() - .5).slice(0, 3);
    return clubs.map(c => ({ club: c.name, amount: Math.round(p.value * rnd(.75, 1.15)) })).sort((a, b) => b.amount - a.amount);
  }

  function acceptSellOffer(state, pid, amount) {
    const p = state.squad.find(x => x.id === pid);
    if (!p) return { ok: false, msg: "Não encontrado." };
    const cash = Math.round(amount * D.econ.sellFee);
    state.cash += cash;
    removeFromSquad(state, p);
    state.news.unshift({ icon: "market", text: `Vendeu ${p.name} por ${fmtM(cash)}.`, day: state.day });
    return { ok: true, msg: `Vendeu ${p.name} por ${fmtM(cash)}.` };
  }

  function listLoan(state, pid, list) {
    const p = state.squad.find(x => x.id === pid);
    if (!p || p.loanedOut) return;
    p.loanListed = list;
    if (list) state.news.unshift({ icon: "market", text: `${p.name} entrou na lista de empréstimos.`, day: state.day });
  }

  function contractEnd(state, p) {
    return "30/0" + p.contract.month + "/" + (state.cal.year + p.contract.year);
  }

  function playerRating(p) {
    if (!p.ratingN) return null;
    return Math.round((p.ratingSum / p.ratingN) * 10) / 10;
  }

  function renewPlayer(state, pid, years, wage) {
    const p = state.squad.find(x => x.id === pid);
    if (!p) return { ok: false, msg: "Jogador não encontrado." };
    years = clamp(Math.round(years), 1, 4);
    wage = Math.max(1000, Math.round(wage / 1000) * 1000);
    let chance = .75;
    if (wage >= p.wage * 1.1) chance += .15;
    else if (wage < p.wage) chance -= .3;
    if (p.morale > 70) chance += .1;
    else if (p.morale < 35) chance -= .15;
    if (p.wantOut) chance -= .3;
    if (p.age >= 33) chance += .1;
    if (p.age <= 21) chance += .05;
    if (p.contract.year >= 3) chance -= .1;
    if (Math.random() < chance) {
      p.contract = { month: 6, year: years };
      p.wage = wage;
      p.wantOut = false;
      p.morale = clamp(p.morale + 5, 5, 100);
      state.news.unshift({ icon: "contract", text: `✍️ ${p.name} renovou por ${years} ano(s) — ${fmtM(p.wage)}/mês.`, day: state.day });
      return { ok: true, msg: `${p.name} aceitou renovar por ${years} ano(s).` };
    }
    p.morale = clamp(p.morale - 5, 5, 100);
    if (chance(.3)) p.wantOut = true;
    state.news.unshift({ icon: "contract", text: `✖ ${p.name} recusou a proposta de renovação.`, day: state.day });
    return { ok: false, msg: `${p.name} recusou. Tente com salário maior.` };
  }

  function leagueStats(state) {
    const clubs = state.world.byDiv[state.division] || [];
    const rows = [];
    for (const c of clubs) for (const p of c.players) rows.push(p);
    const clubOf = p => { for (const c of clubs) if (c.players.includes(p)) return c.name; return ""; };
    const withStats = rows.filter(p => (p.goals || p.assists || p.ratingN));
    const gols = withStats.filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals || b.media - a.media).slice(0, 10)
      .map(p => ({ name: p.name, club: clubOf(p), v: p.goals, extra: p.assists || 0, media: p.media }));
    const assists = withStats.filter(p => p.assists > 0).sort((a, b) => b.assists - a.assists || b.media - a.media).slice(0, 10)
      .map(p => ({ name: p.name, club: clubOf(p), v: p.assists, extra: p.goals || 0, media: p.media }));
    const nota = withStats.filter(p => p.ratingN).map(p => ({ name: p.name, club: clubOf(p), v: playerRating(p), extra: p.goals || 0, media: p.media }))
      .sort((a, b) => b.v - a.v).slice(0, 10);
    return { gols, assists, nota };
  }

  function captureExtra(state) {
    if (state.extraCaptures >= 2) return { ok: false, msg: "Limite de capturas extras atingido (2/temporada)." };
    if (state.academy.length >= 12) return { ok: false, msg: "Academia cheia (12/12)." };
    const cost = 300000;
    if (state.cash < cost) return { ok: false, msg: "Sem orçamento." };
    state.cash -= cost;
    state.extraCaptures++;
    const p = genPlayer(state.world.country.id, state.division, 0);
    p.age = ri(15, 17);
    p.pot = clamp(p.pot + D.staff.youthDir.pot[state.staff.youthDir], 30, 96);
    state.academy.push(p);
    state.news.unshift({ icon: "youth", text: `Canterano extra ${p.name} (potencial ${p.pot}) por ${fmtM(cost)}.`, day: state.day });
    return { ok: true, msg: `${p.name} chegou à academia!` };
  }

  /* ---------- temporada ---------- */
  function newCareer(countryId, challengeKey, clubId, world) {
    world = world || genWorld(countryId);
    const chal = D.challenges[challengeKey];
    let club;
    if (clubId) club = world.clubs.find(c => c.id === clubId);
    else {
      const lowest = world.byDiv[world.country.divisions][0];
      club = lowest;
    }
    const division = club.division;
    const squad = JSON.parse(JSON.stringify(club.players));
    squad.forEach(p => { p.clubId = club.id; });
    if (chal.flag === "asilo") {
      squad.forEach(p => { p.age = clamp(p.age + 10, 28, 45); p.attrs.fisi = clamp(p.attrs.fisi - 15, 15, 80); });
    }
    if (chal.flag === "apest") {
      squad.forEach(p => { p.morale = clamp(p.morale - 25, 15, 60); if (chance(.5)) p.wantOut = true; });
    }
    const fixtures = fixturesFor(world.byDiv[division]);
    const state = {
      v: 1, world, clubId: club.id, division, club,
      challenge: challengeKey, challengeDesc: chal,
      cal: { day: 1, month: 9, year: 1 }, day: 1, round: 1,
      phase: "season", // season | offseason
      squad, academy: [], 
      lineup: { formation: "4-4-2", mentality: "EQU", style: "EQUI", press: "MED", captain: null, setPieces: null, bySlot: {}, autoSubs: true, subsUsed: 0 },
      cash: chal.startCash, boardConf: 55, fan: 55,
      negMonths: 0, monthHistory: [],
      sponsor: { shirt: null, stadium: null }, ticketPrice: D.econ.ticketBase,
      facilities: { training: 1, clinic: 1, cantera: 1, stadium: 1, shop: 1 },
      stadiumWork: null,
      staff: { coach: 1, doctor: 1, scout: 1, youthDir: 1 },
      fixtures, round: 1, tables: { [division]: {} }, scorers: {},
      results: [], news: [], pending: [], market: [], freeAgents: [],
      promise: null, promiseDone: false, promisedMinutes: null,
      tourDone: false, intakeDone: false, reviewDone: false, extraCaptures: 0, tourDev: 0,
      season: 1, squadGoals: 0,
      stats: { titles: 0, seasons: 1, challengesWon: [], promotions: 0, trophies: [] },
      dead: null, fired: false,
      flagHambre: chal.flag === "hambre", flagCantera: chal.flag === "cantera",
      flagSangre: chal.flag === "sangre", flagFragil: chal.flag === "fragil",
      flagBiberon: chal.flag === "biberon", flagIdolo: chal.flag === "idolo",
      flagJunta: chal.flag === "junta", flagGuerra: chal.flag === "guerra",
      flagApest: chal.flag === "apest", flagAsilo: chal.flag === "asilo"
    };
    if (state.flagHambre) { state.fan = 25; state.cash = 2000000; }
    if (state.flagIdolo) {
      const best = [...state.squad].sort((a, b) => b.media - a.media)[0];
      best.morale = 25; state.idoloId = best.id;
    }
    if (state.flagGuerra) state.fan = 40;
    // facilidades iniciais por nível
    refreshMarket(state);
    state.promise = null;
    state.news.unshift({ icon: "board", text: `Bem-vindo, presidente! ${club.name} na ${ordinal(division)} divisão de ${world.country.name}.`, day: 0 });
    return state;
  }

  const ordinals = ["", "1ª", "2ª", "3ª", "4ª"];
  const ordinal = d => ordinals[d] || d + "ª";

  function setPromise(state, key) {
    if (!D.promises[key]) return;
    state.promise = { key, ...D.promises[key] };
    state.cash += D.promises[key].adv;
    state.news.unshift({ icon: "board", text: `Promessa à diretiva: ${D.promises[key].name}. Antecipação: ${fmtM(D.promises[key].adv)}.`, day: state.day });
  }

  function advanceDay(state) {
    if (state.dead) return { type: "dead" };
    // dia de jogo?
    if (state.phase === "season" && isMatchDay(state)) {
      const f = userFixture(state);
      const home = state.world.clubs.find(c => c.id === f.home);
      const away = state.world.clubs.find(c => c.id === f.away);
      const isDerby = (f.home === state.clubId ? away.rivals : home.rivals).includes(state.clubId);
      return { type: "match", fixture: f, isDerby, home: f.home === state.clubId };
    }
    // offseason: avança para datas importantes
    if (state.phase === "offseason") {
      if (state.cal.month === 7 && state.cal.day === 10 && !state.tourDone && !state.pending.some(p => p.type === "tour")) {
        const evt = mkEvent(state, "tour"); ev.tour(state, evt);
        return { type: "event", event: evt };
      }
      if (state.cal.month === 7 && state.cal.day === 15 && !state.intakeDone && !state.pending.some(p => p.type === "intake")) {
        const evt = mkEvent(state, "intake"); ev.intake(state, evt);
        return { type: "event", event: evt };
      }
      if (state.cal.month === 8 && state.cal.day === 1 && !state.reviewDone) {
        return { type: "review" };
      }
    }
    // dia normal
    state.day++;
    state.cal.day++;
    if (state.cal.day > 30) { state.cal.day = 1; state.cal.month++; }
    if (state.cal.month > 12) { state.cal.month = 1; state.cal.year++; }
    if (state.cal.month === 9 && state.cal.day === 1 && state.phase === "offseason") {
      // nova temporada
      state.phase = "season";
      return { type: "seasonStart" };
    }
    injuryRecover(state);
    youthGrowth(state);
    for (const club of state.world.clubs) {
      for (const p of club.players) {
        if (!p.injury) p.energy = clamp(p.energy + 5, 10, 100);
      }
    }
    if (state.cal.day === 1) {
      monthPay(state);
      // Brasfoot: valor de mercado oscila mês a mês conforme a forma
      for (const p of state.squad) {
        if (p.loanedOut) continue;
        const f = p.form > 70 ? 1.03 : p.form < 40 ? .97 : 1;
        p.value = Math.round(clamp(p.value * rnd(.96, 1.06) * f, 20000, 90000000));
      }
    }
    if (state.stadiumWork) {
      state.stadiumWork.days--;
      if (state.stadiumWork.days <= 0) {
        state.facilities.stadium = state.stadiumWork.level;
        state.news.unshift({ icon: "stadium", text: `Ampliação do estádio pronta: capacidade ${D.facilities.stadium.seats[state.facilities.stadium].toLocaleString("pt-BR")} lugares.`, day: state.day });
        state.stadiumWork = null;
      }
    }
    if (state.phase === "season") {
      // fim da temporada (14 rodadas): fase de offseason
      if (state.round > state.fixtures.length / 4) {
        state.phase = "offseason";
        return { type: "seasonEnd" };
      }
    }
    // eventos do dia
    const evt = rollOffdayEvent(state);
    if (evt) {
      const maker = ev[evt.type];
      if (maker) {
        const keep = maker(state, evt);
        if (keep !== null) return { type: "event", event: evt };
      }
      state.pending = state.pending.filter(p => p.id !== evt.id);
    }
    // demissão por falta de confiança
    if (state.boardConf <= 0) {
      state.dead = { reason: "fired", text: "A diretiva perdeu a confiança e você foi despedido." };
      return { type: "dead" };
    }
    // regenerar mercado mensal
    if (state.cal.day === 15) refreshMarket(state);
    return { type: "day" };
  }

  /* ---------- partida do usuário ---------- */
  function playMatch(state, live) {
    const f = userFixture(state);
    const userHome = f.home === state.clubId;
    const lineup = state.lineup;
    const m = simMatch(state, f.home, f.away, live, lineup, userHome, null);
    const otherId = userHome ? f.away : f.home;
    return { m, userHome, other: state.world.clubs.find(c => c.id === otherId), otherId };
  }

  function finishMatch(state, m, userHome) {
    // resultado do usuário
    applyResult(state, m, state.world.clubs.find(c => c.id === state.clubId), state.lineup, null);
    applyScoreTable(state, m, m.home.id, m.away.id);
    simOtherFixtures(state, state.round);
    if (userHome) {
      const seats = D.facilities.stadium.seats[state.facilities.stadium];
      const attendance = Math.round(seats * (0.5 + state.fan / 200));
      state.cash += attendance * state.ticketPrice;
    }
    state.round++;
    state.lineup.subsUsed = 0;
    if (state.round > state.fixtures.length / 4) {
      state.phase = "offseason";
      state.news.unshift({ icon: "trophy", text: "A temporada terminou. Consulte as notícias para ver o balanço.", day: state.day });
      return { type: "seasonEnd" };
    }
    return { type: "played" };
  }

  function seasonReview(state) {
    state.reviewDone = true;
    const notes = [];
    const table = getTable(state);
    const pos = table.findIndex(r => r.club.id === state.clubId) + 1;
    const div = state.division;
    // promessa
    let promiseOk = null;
    if (state.promise) {
      const pr = state.promise;
      if (pr.check === "pos") promiseOk = pos <= pr.n;
      else if (pr.check === "youth") promiseOk = state.squad.filter(p => p.age <= 21).length >= pr.n;
      else if (pr.check === "goals") {
        const my = Object.entries(state.scorers).filter(([id]) => state.squad.some(p => p.id === id));
        const top = [...Object.entries(state.scorers)].sort((a, b) => b[1] - a[1]).slice(0, 3);
        promiseOk = top.some(([id]) => state.squad.some(p => p.id === id));
      }
      if (promiseOk) {
        state.cash += pr.bonus;
        state.boardConf = clamp(state.boardConf + 15, 0, 100);
        notes.push(`✅ Promessa cumprida: ${pr.name}. Bônus ${fmtM(pr.bonus)}.`);
      } else {
        state.boardConf = clamp(state.boardConf - (state.flagJunta ? 40 : 25), 0, 100);
        notes.push(`❌ Promessa falhada: ${pr.name}. A diretiva não esquece.`);
      }
    }
    // desafio biberon
    if (state.flagBiberon) {
      const n = state.squad.filter(p => p.age <= 21).length;
      if (n >= 3) { notes.push("✅ A Quinta do Biberão: 3 jovens no plantel."); state.stats.challengesWon.push("BIBERON"); }
      else { state.boardConf = clamp(state.boardConf - 20, 0, 100); notes.push(`❌ Desafio Biberão: só ${n} jogadores ≤21 no plantel.`); }
    }
    // título / promoção / descenso
    if (pos === 1) {
      state.stats.titles++;
      state.stats.trophies.push({ name: `Campeão ${state.world.country.name} — ${ordinal(div)} divisão`, season: state.season });
      state.news.unshift({ icon: "trophy", text: `!CAMPEÃO! ${state.world.country.name} — ${ordinal(div)} divisão!`, day: state.day });
      if (state.challenge !== "NONE" && div === 1) {
        state.stats.challengesWon.push(state.challenge);
        state.news.unshift({ icon: "trophy", text: `Logro desbloqueado: ${D.challenges[state.challenge].name}!`, day: state.day });
      }
    }
    const last = state.world.country.divisions;
    const promoted = pos <= 2 && div > 1;
    const relegated = pos >= 7 && div < last;
    const clubMedia = c => c.players.reduce((s, p) => s + p.media, 0) / Math.max(1, c.players.length);
    if (promoted) {
      state.division--; state.stats.promotions++;
      state.news.unshift({ icon: "cup", text: `!ASCENSO! O clube sobe para a ${ordinal(state.division)} divisão!`, day: state.day });
    }
    if (relegated) {
      state.division++;
      state.news.unshift({ icon: "warning", text: `O clube desce para a ${ordinal(state.division)} divisão.`, day: state.day });
    }
    if (promoted || relegated) {
      const oldDiv = state.club.division;
      const target = state.world.byDiv[state.division];
      const swap = promoted
        ? [...target].sort((a, b) => clubMedia(a) - clubMedia(b))[0]
        : [...target].sort((a, b) => clubMedia(b) - clubMedia(a))[0];
      state.world.byDiv[state.division] = target.filter(c => c.id !== swap.id);
      state.world.byDiv[oldDiv] = state.world.byDiv[oldDiv].filter(c => c.id !== state.clubId);
      state.world.byDiv[oldDiv].push(swap);
      swap.division = oldDiv;
      state.club.division = state.division;
      state.world.byDiv[state.division].push(state.club);
    }
    // TV
    const tv = D.econ.tvByDiv[state.division - 1] || 1500000;
    state.cash += tv;
    notes.push(`📺 Receita de TV da nova temporada: ${fmtM(tv)}.`);
    // promoção de canteranos com 18
    state.academy.forEach(p => p.age++);
    const turn18 = state.academy.filter(p => p.age >= 18);
    for (const p of turn18) {
      const evt = mkEvent(state, "youthPromote", { playerId: p.id });
      ev.youthPromote(state, evt);
    }
    // renovação de empréstimos
    state.squad = state.squad.filter(p => !p.loanedIn);
    state.squad.forEach(p => p.loanedOut = false);
    // contrato encerrando -> renovação automática ou saída
    const expiring = state.squad.filter(p => p.contract.year === 0);
    for (const p of expiring) {
      if (p.media >= 62 || (p.media >= 55 && chance(.7))) {
        p.contract = { month: 6, year: p.media >= 62 ? 2 : 1 };
        p.wage = Math.round(p.wage * (p.media >= 62 ? 1.1 : 1));
        notes.push(`📝 ${p.name} renovou automaticamente (média ${p.media}).`);
      } else {
        removeFromSquad(state, p);
        notes.push(`🚪 ${p.name} saiu (contrato encerrado).`);
      }
    }
    state.squad.forEach(p => { if (p.contract.year > 0) p.contract.year--; });
    // reset temporada
    const newDiv = state.division;
    state.round = 1; state.day = 1; state.cal = { day: 1, month: 9, year: state.cal.year + 1 };
    state.phase = "season";
    state.season++;
    state.fixtures = fixturesFor(state.world.byDiv[newDiv]);
    state.tables = { [newDiv]: {} };
    state.scorers = {};
    state.squad.forEach(p => { p.goals = 0; p.apps = 0; p.assists = 0; p.yellow = 0; p.ratingSum = 0; p.ratingN = 0; });
    for (const c of state.world.clubs) for (const p of c.players) { p.goals = 0; p.apps = 0; p.assists = 0; p.yellow = 0; }
    state.tourDone = false; state.intakeDone = false; state.reviewDone = false; state.extraCaptures = 0; state.tourDev = 0;
    state.promise = null; state.promisedMinutes = null; state.results = [];
    state.negMonths = 0; state.monthHistory = [];
    refreshMarket(state);
    // salários atualizam
    for (const k of D.staffKeys) if (state.staff[k] > 1) state.staff[k] = state.staff[k];
    state.news.unshift({ icon: "board", text: `Começa a ${ordinal(state.season)} temporada (${state.cal.year}).`, day: 0 });
    return { type: "reviewed", notes, pos, promiseOk };
  }

  /* ---------- helpers para UI ---------- */
  function getters(state) {
    return {
      userClub: () => state.world.clubs.find(c => c.id === state.clubId),
      squad: () => state.squad,
      academy: () => state.academy,
      table: () => getTable(state),
      nextFixture: () => userFixture(state),
      matchDay: () => matchDayFor(state),
      news: () => state.news,
      pending: () => state.pending,
      date: () => dayOf(state.cal),
      cash: () => state.cash,
      formatter: fmtM,
      slotKeys: () => D.formations[state.lineup.formation].slots.map((s, i) => s + "_" + i),
      raw: () => state
    };
  }

  /* ---------- save/load ---------- */
  const KEY = "palco90_save";
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { return false; }
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }
  function eraseSave() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  return {
    newCareer, advanceDay, playMatch, finishMatch, seasonReview,
    resolve, refreshMarket, buyPlayer, signFree, listPlayer, sellNow,
    negotiateBuy, sellOffers, acceptSellOffer, listLoan,
    renewPlayer, contractEnd, playerRating, leagueStats,
    captureExtra, setPromise, save, load, eraseSave,
    simMatch, getTable, fixturesFor, pickXI,
    getters, fmtM, dayOf, ordinal,
    D
  };
})();