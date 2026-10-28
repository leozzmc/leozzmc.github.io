/*
 * ASCII Koi Pond — homepage cover backdrop for leozzmc.github.io (Hexo + Butterfly 5.5.1)
 * Simulation adapted from a standalone prototype (seeded RNG, follow-chain spine,
 * speed-limited steering, water refraction, leaf feeding). Integration changes:
 *   - homepage-only guard (/ and /en/ first page; skips /page/2 etc.)
 *   - self-mounts an opaque canvas into #page-header as a backdrop layer
 *   - preview UI (toolbar/dialog/immerse) removed; nav/title stay clickable above
 *   - pointer coords relative to the canvas; pauses off-screen / hidden / reduced-motion
 *   - pond kept dark in both site themes so the white header title stays legible
 * No external dependencies, no network, no image assets.
 */
(function () {
  'use strict';

  // ---- homepage-only guard ----
  var path = location.pathname.replace(/index\.html$/, '');
  if (path !== '/' && path !== '/en/') return;
  var header = document.getElementById('page-header');
  if (!header || !header.classList.contains('full_page')) return;      // only the full cover
  if (document.getElementById('koi-pond-canvas')) return;              // no double-mount

  // ---- mount canvas as a backdrop inside the header ----
  var canvas = document.createElement('canvas');
  canvas.id = 'koi-pond-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  header.insertBefore(canvas, header.firstChild);
  header.classList.add('koi-pond-header');

  // ---- GPT-style cover overlay: replace Butterfly's centered title / social row ----
  (function buildCover () {
    var nameEl = header.querySelector('.nav-site-title .site-name') || header.querySelector('.site-name');
    if (nameEl) nameEl.innerHTML = 'kevin<span class="koi-dot">.</span>';
    var icon = header.querySelector('.nav-site-title .site-icon'); if (icon) icon.style.display = 'none';
    var intro = document.createElement('section');
    intro.className = 'koi-intro';
    intro.innerHTML =
      '<h1 class="koi-headline">Just looking<br><em>around.</em></h1>' +
      '<p class="koi-desc">Made a few things. Went a few places.</p>';
    header.appendChild(intro);
  })();

  const ctx = canvas.getContext('2d', { alpha: false });
  const source = document.createElement('canvas');
  const g = source.getContext('2d', { willReadFrequently: true });

  let W = 1, H = 1, cols = 1, rows = 1, cw = 6, ch = 9, dpr = 1;
  const light = false;                                                 // pond stays dark
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let immersed = false;                                                // fish avoid the left intro text (GPT behavior)
  let onScreen = true;
  let time = 0, last = 0, raf = 0, dirty = true;

  const pointer = { x: 0, y: 0, active: false }, foods = [], ripples = [], surfaceWaves = [];
  let waterX = new Float32Array(0), waterY = new Float32Array(0), waterLight = new Float32Array(0);
  const TAU = Math.PI * 2;
  let seed = 81724; function rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hash = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };

  const fish = Array.from({ length: 6 }, (_, i) => ({ x: .52 + rand() * .4, y: .15 + rand() * .72, a: rand() * TAU, s: [90, 120, 155, 190, 235, 280][i] * (.96 + rand() * .08), speed: 17 + rand() * 10, phase: rand() * TAU, pattern: i, turn: 0, target: rand() * TAU, velocity: 38 + rand() * 24, pace: .85 + rand() * .55, strokePower: 1.3 + rand() * .7, glidePace: .65 + rand() * .3, angularVelocity: 0, beat: 0, finPhase: rand() * TAU, nextStroke: rand() * 2, strokeEnd: 0, curiosity: .35 + rand() * .6, food: null, wanderAngle: 0, nextWander: 0, wanderGoal: 0 }));

  function resize() { let r = canvas.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); cw = W < 650 ? 5.5 : 7; ch = cw * 1.5; cols = Math.ceil(W / cw); rows = Math.ceil(H / ch); source.width = cols; source.height = rows; dirty = true; }
  resize();
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas);

  function size(f) { return f.s * (W < 650 ? 1.02 : 1.5 * Math.min(1.3, W / 1250)); }
  const JOINTS = 32;
  const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const ease = (current, target, rate, dt) => current + (target - current) * (1 - Math.exp(-rate * dt));
  function ensureTrack(f) {
    const L = size(f), hx = f.x * W, hy = f.y * H;
    if (!f.track || f.trackLength !== L || f.trackW !== W || f.trackH !== H) {
      f.track = Array.from({ length: JOINTS + 1 }, (_, i) => ({ x: hx - Math.cos(f.a) * L * .94 * i / JOINTS, y: hy - Math.sin(f.a) * L * .94 * i / JOINTS }));
      f.trackLength = L; f.trackW = W; f.trackH = H; f.geometryVersion = (f.geometryVersion || 0) + 1;
    } return f.track;
  }
  function followHead(f) {
    const nodes = ensureTrack(f), step = size(f) * .94 / JOINTS;
    nodes[0].x = f.x * W; nodes[0].y = f.y * H;
    let previous = f.a + Math.PI;
    for (let i = 1; i <= JOINTS; i++) {
      const ahead = nodes[i - 1], joint = nodes[i];
      const desired = Math.atan2(joint.y - ahead.y, joint.x - ahead.x);
      const a = previous + clamp(angleDelta(previous, desired), -.105, .105);
      joint.x = ahead.x + Math.cos(a) * step; joint.y = ahead.y + Math.sin(a) * step; previous = a;
    } f.geometryVersion = (f.geometryVersion || 0) + 1;
  }
  function backbone(f) {
    const nodes = ensureTrack(f), L = size(f);
    if (f.spine && f.spineVersion === f.geometryVersion && f.spinePhase === f.phase && f.spineBeat === f.beat) return f.spine;
    const result = [];
    for (let i = 0; i <= JOINTS; i++) {
      const t = i / JOINTS, a = nodes[Math.max(0, i - 1)], b = nodes[Math.min(JOINTS, i + 1)];
      let dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
      const envelope = Math.pow(t, 2.4), off = L * .028 * envelope * (.10 + .90 * (f.beat || 0)) * Math.sin(f.phase - t * 5.2);
      result.push({ x: nodes[i].x + dy * off, y: nodes[i].y - dx * off });
    }
    f.spine = result; f.spineVersion = f.geometryVersion; f.spinePhase = f.phase; f.spineBeat = f.beat; return result;
  }
  function point(f, t, v = 0) {
    const spine = backbone(f), L = size(f), end = .94; let x, y, dx, dy;
    if (t < 0) { dx = -Math.cos(f.a); dy = -Math.sin(f.a); x = spine[0].x + dx * t * L; y = spine[0].y + dy * t * L; }
    else if (t >= end) { const a = spine[JOINTS - 1], b = spine[JOINTS], len = Math.hypot(b.x - a.x, b.y - a.y) || 1; dx = (b.x - a.x) / len; dy = (b.y - a.y) / len; x = b.x + dx * (t - end) * L; y = b.y + dy * (t - end) * L; }
    else { const q = t / end * JOINTS, i = Math.floor(q), u = q - i, a = spine[i], b = spine[i + 1]; x = a.x + (b.x - a.x) * u; y = a.y + (b.y - a.y) * u;
      const left = spine[Math.max(0, i - 1)], right = spine[Math.min(JOINTS, i + 2)], len = Math.hypot(right.x - left.x, right.y - left.y) || 1; dx = (right.x - left.x) / len; dy = (right.y - left.y) / len; }
    return [x + dy * v, y - dx * v];
  }
  function width(f, t) { return size(f) * (.105 * Math.pow(Math.sin(Math.PI * clamp((t + .06) / 1.06, 0, 1)), .65) * (1 - t * .60) + .009); }
  function polygon(points, color) { g.fillStyle = color; g.beginPath(); points.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); }
  function ribbon(f, a, b, sideA, sideB, color, steps = 25) { let ps = []; for (let i = 0; i <= steps; i++) { let t = a + (b - a) * i / steps; ps.push(point(f, t, width(f, t) * sideA(t))); } for (let i = steps; i >= 0; i--) { let t = a + (b - a) * i / steps; ps.push(point(f, t, width(f, t) * sideB(t))); } polygon(ps, color); }
  function drawFish(f, shadow = false) { const L = size(f), white = light ? '#6d8478' : '#c3d0b9', red = light ? '#b8482f' : '#d77950', dark = light ? '#293e37' : '#263b31';
    for (const side of [-1, 1]) { let flutter = (1 - (f.beat || 0)) * .022 * Math.sin((f.finPhase || 0) + side * 1.5) + side * clamp(f.turn * .035, -.025, .025) - (f.beat || 0) * .035; polygon([point(f, .20, width(f, .2) * side * .7), point(f, .39, L * (.21 + flutter) * side), point(f, .54, L * .13 * side), point(f, .42, width(f, .42) * side * .65)], light ? '#a6b4a4' : '#586951'); for (let j = 1; j < 5; j++) { g.strokeStyle = light ? '#7c9384' : '#7a896d'; g.lineWidth = .55; g.beginPath(); const a = point(f, .24, width(f, .24) * side * .6), b = point(f, .36 + j * .035, L * (.20 - j * .012 + flutter) * side); g.moveTo(...a); g.lineTo(...b); g.stroke(); } }
    polygon([point(f, .91, 0), point(f, .99, L * .035), point(f, 1.18, L * .14), point(f, 1.14, L * .045), point(f, 1.075, 0), point(f, 1.14, -L * .045), point(f, 1.18, -L * .14), point(f, .99, -L * .035)], light ? '#96a996' : '#879779');
    for (let j = -3; j <= 3; j++) { g.strokeStyle = light ? '#687f6d' : '#b3b99b'; g.lineWidth = .65; g.beginPath(); g.moveTo(...point(f, .94)); g.lineTo(...point(f, 1.08 + .10 * Math.abs(j) / 3, L * .044 * j)); g.stroke(); }
    ribbon(f, 0, .94, () => -1, () => 1, white);
    for (let k = 0; k < 4; k++) { let a = .045 + k * .19 + hash(f.pattern, k) * .05, b = Math.min(.91, a + .11 + hash(k, f.pattern) * .09); const offset = (hash(k + 1, f.pattern + 6) - .5) * 1.2;
      ribbon(f, a, b, t => clamp(offset - .65 + Math.sin(t * 48 + f.pattern) * .19, -.98, .98), t => clamp(offset + .65 + Math.sin(t * 36 + 2) * .22, -.98, .98), (f.pattern === 2 && k > 1) || (f.pattern === 4 && k === 2) ? dark : red, 15); }
    for (let i = 3; i < 22; i++) { const t = i / 25, w = width(f, t); for (let j = -2; j <= 2; j++) { const p = point(f, t, w * j * .32); g.fillStyle = light ? '#f3f1e94a' : '#18251b45'; g.fillRect(p[0], p[1], 1.5, 1.4); } }
    g.strokeStyle = light ? '#344c4055' : '#e6e9c844'; g.lineWidth = 1; g.beginPath(); for (let i = 3; i < 17; i++) { const p = point(f, i / 24, 0); i === 3 ? g.moveTo(...p) : g.lineTo(...p); } g.stroke();
    for (let side of [-1, 1]) { const p = point(f, .07, width(f, .07) * .75 * side); g.fillStyle = light ? '#18271e' : '#142319'; g.beginPath(); g.ellipse(p[0], p[1], L * .013, L * .010, f.a, 0, TAU); g.fill(); g.strokeStyle = light ? '#49634d' : '#a7b394'; g.lineWidth = .7; g.beginPath(); g.moveTo(...point(f, .015, L * .025 * side)); g.lineTo(...point(f, -.035, L * .055 * side)); g.stroke(); } }
  function update(dt) {
    if (dt <= 0) return;
    time += dt;
    for (let i = surfaceWaves.length - 1; i >= 0; i--) { surfaceWaves[i].age += dt; if (surfaceWaves[i].age >= surfaceWaves[i].life) surfaceWaves.splice(i, 1); }
    for (const food of foods) {
      food.life -= dt;
      if (food.age !== undefined) { food.age += dt; if (food.leaf) { positionLeafFragment(food, dt); } else if (food.age >= (food.breakAt ?? food.fall)) { const damp = Math.exp(-dt * .65); food.vx *= damp; food.vy *= damp; food.x += food.vx * dt; food.y += food.vy * dt; } }
    }
    for (let i = foods.length - 1; i >= 0; i--) if (foods[i].life <= 0) foods.splice(i, 1);
    for (let i = ripples.length - 1; i >= 0; i--) { ripples[i].age += dt; if (ripples[i].age > 4) ripples.splice(i, 1); }
    const neighbours = fish.map(f => ({ fish: f, x: f.x * W, y: f.y * H, a: f.a, L: size(f), nodes: ensureTrack(f).map(p => ({ ...p })) }));
    for (const f of fish) {
      const x = f.x * W, y = f.y * H, L = size(f);
      if (time >= f.nextWander) { f.wanderGoal = (rand() - .5) * 1.35; f.nextWander = time + 1.8 + rand() * 3.5; }
      f.wanderAngle = ease(f.wanderAngle, f.wanderGoal, .6, dt);
      let sx = Math.cos(f.a) * 1.25 + Math.cos(f.a + f.wanderAngle) * .65;
      let sy = Math.sin(f.a) * 1.25 + Math.sin(f.a + f.wanderAngle) * .65;
      let nearest = null, best = Infinity;
      for (const food of foods) { const d = Math.hypot(food.x - x, food.y - y); if (d < best && food.life > 0 && foodReady(food)) { best = d; nearest = food; } }
      if (f.food && (!foods.includes(f.food) || f.food.life <= 0 || !foodReady(f.food))) f.food = null;
      if (!f.food) f.food = nearest;
      else if (nearest && best < Math.hypot(f.food.x - x, f.food.y - y) * .45) f.food = nearest;
      let chasing = !!f.food, arrival = 0, curious = false;
      if (chasing) { const dx = f.food.x - x, dy = f.food.y - y, d = Math.hypot(dx, dy) || 1; arrival = clamp(1 - d / (L * .65), 0, 1); sx += dx / d * 3.5; sy += dy / d * 3.5;
        if (d < Math.max(12, L * .045)) { f.food.life = 0; f.food = null; chasing = false; ripples.push({ x, y, age: 0, small: true }); } }
      else if (pointer.active) { const dx = pointer.x - x, dy = pointer.y - y, d = Math.hypot(dx, dy) || 1, range = Math.min(420, L * 1.5);
        if (d < range) { const close = clamp(1 - d / (L * .65), 0, 1), pull = f.curiosity * (1 - d / range) * 1.6, orbit = f.pattern % 2 ? 1 : -1;
          sx += (dx / d * (1 - close) - dy / d * close * orbit) * pull; sy += (dy / d * (1 - close) + dx / d * close * orbit) * pull; curious = true; } }
      for (const n of neighbours) { if (n.fish === f) continue;
        for (let j = 0; j < n.nodes.length; j += 4) { const dx = x - n.nodes[j].x, dy = y - n.nodes[j].y, d = Math.hypot(dx, dy), space = (L + n.L) * (chasing ? .10 : .15); if (d > 1 && d < space) { const w = (1 - d / space) ** 2 * .85; sx += dx / d * w; sy += dy / d * w; } }
        if (!chasing && Math.hypot(x - n.x, y - n.y) < L * 1.3) { sx += Math.cos(n.a) * .12; sy += Math.sin(n.a) * .12; } }
      const look = L * .32 + f.velocity * .8, px = x + Math.cos(f.a) * look, py = y + Math.sin(f.a) * look;
      const bank = Math.min(Math.min(W, H) * .22, L * .55), edgeWeight = 3.4;
      sx += clamp((bank - px) / bank, 0, 2) * edgeWeight - clamp((px - W + bank) / bank, 0, 2) * edgeWeight;
      sy += clamp((bank - py) / bank, 0, 2) * edgeWeight - clamp((py - H + bank) / bank, 0, 2) * edgeWeight;
      if (!immersed && W > 650) { const bx = clamp(x, W * .065, W * .39), by = clamp(y, H * .30, H * .78), dx = x - bx, dy = y - by, d = Math.hypot(dx, dy), range = L * .25;
        if (d < range) { if (d > 1) { const w = (1 - d / range) * (chasing || curious ? .2 : .65); sx += dx / d * w; sy += dy / d * w; } else { sx += .7; } } }
      const desired = Math.atan2(sy, sx), error = angleDelta(f.a, desired);
      const maxRate = Math.min(chasing ? .9 : .6, Math.max(.035, f.velocity / L * 2.5));
      const wanted = clamp(error * 1.5, -maxRate, maxRate);
      f.angularVelocity = ease(f.angularVelocity, wanted, 2.2, dt);
      f.a += f.angularVelocity * dt; f.turn = ease(f.turn, f.angularVelocity, 3, dt);
      if (time >= f.nextStroke) { const sprint = rand() < .28; f.strokePower = sprint ? 2.1 + rand() * .6 : 1.25 + rand() * .65; f.glidePace = .65 + rand() * .3; f.strokeEnd = time + (sprint ? .55 + rand() * .65 : .8 + rand() * 1.1); f.nextStroke = f.strokeEnd + .9 + rand() * 2.1; }
      const stroking = chasing || time < f.strokeEnd;
      f.beat = ease(f.beat, stroking ? 1 : 0, stroking ? 3.5 : 2.4, dt);
      const cruise = (26 + L * .12) * f.pace;
      const cornering = clamp(1 - Math.abs(error) * .23, .48, 1);
      const targetSpeed = (chasing ? cruise * (1.85 - arrival * 1.1) : cruise * (stroking ? f.strokePower : f.glidePace) * (curious ? 1.10 : 1)) * cornering;
      f.velocity = ease(f.velocity, targetSpeed, stroking ? 1.55 : .65, dt);
      f.phase += dt * (.35 + f.beat * (2 + f.velocity / 16)); f.finPhase += dt * 1.9;
      f.x += Math.cos(f.a) * f.velocity * dt / W; f.y += Math.sin(f.a) * f.velocity * dt / H;
      followHead(f);
    }
  }
  function leafPose(leaf, age) {
    const q = clamp(age / leaf.fall, 0, 1), settled = Math.max(0, age - leaf.fall), air = 1 - q;
    return { x: leaf.x + Math.sin(q * TAU + leaf.phase) * Math.sin(q * Math.PI) * 25 + Math.sin(settled * .65) * 4,
      y: leaf.y - leaf.height * (1 - q * q) + Math.sin(settled * 1.1) * 1.4,
      a: leaf.rotation + Math.sin(q * TAU) * air * .6 + Math.sin(settled * .7) * .08 };
  }
  function positionLeafFragment(f, dt) {
    if (f.age >= f.leaf.fall && !f.leaf.landed) { f.leaf.landed = true; const impact = leafPose(f.leaf, f.leaf.fall); disturbWater(impact.x, impact.y); }
    if (!f.detached) { const pose = leafPose(f.leaf, Math.min(f.age, f.breakAt)), c = Math.cos(pose.a), s = Math.sin(pose.a);
      f.x = pose.x + f.offsetX * c - f.offsetY * s; f.y = pose.y + f.offsetX * s + f.offsetY * c; f.renderAngle = pose.a;
      if (f.age >= f.breakAt) { f.detached = true; const a = pose.a + Math.atan2(f.offsetY, f.offsetX) + f.spread; f.vx = Math.cos(a) * f.driftSpeed; f.vy = Math.sin(a) * f.driftSpeed; }
    } else { const damp = Math.exp(-dt * .48); f.vx *= damp; f.vy *= damp; f.x += f.vx * dt; f.y += f.vy * dt; f.renderAngle += f.spin * dt * Math.exp(-(f.age - f.breakAt) * .6); }
  }
  function foodReady(f) { return f.age === undefined || (f.age >= (f.breakAt ?? f.fall) && f.age < f.fall + f.floatTime + f.sinkTime * .92); }
  function mapleTiles(unit, dry) {
    const outline = [[0, -10], [1.6, -5.1], [4.7, -7.4], [4.2, -3.2], [8.8, -4.4], [6.7, -.6], [9, .5], [4.6, 2.8], [5, 5.5], [1.1, 4.2], [0, 6], [-1.2, 4.2], [-5, 5.5], [-4.5, 2.8], [-9, .5], [-6.7, -.6], [-8.8, -4.4], [-4.2, -3.2], [-4.7, -7.4], [-1.6, -5.1]];
    const tips = [[0, -10], [-4.7, -7.4], [4.7, -7.4], [-8.8, -4.4], [8.8, -4.4], [-9, .5], [9, .5]], root = [0, 5];
    const groups = new Map();
    function nearest(x, y, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], u = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy), 0, 1); return { d: Math.hypot(x - a[0] - dx * u, y - a[1] - dy * u), a: Math.atan2(dy, dx) }; }
    for (let row = -10; row <= 6; row++) for (let col = -9; col <= 9; col++) {
      let inside = false, edgeDist = Infinity, direction = 0;
      for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
        const a = outline[i], b = outline[j]; if ((a[1] > row) !== (b[1] > row) && col < (b[0] - a[0]) * (row - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
        const hit = nearest(col, row, a, b); if (hit.d < edgeDist) { edgeDist = hit.d; direction = hit.a; }
      } if (!inside && edgeDist > .35) continue;
      let veinDist = Infinity, veinAngle = 0;
      for (const tip of tips) { const hit = nearest(col, row, root, tip); if (hit.d < veinDist) { veinDist = hit.d; veinAngle = hit.a; } }
      const edge = edgeDist < .65, vein = Math.abs(col) < .35 && row < 5, branch = !vein && veinDist < .37;
      if (dry && edge && rand() < .14 && !vein) continue;
      if (vein || branch) direction = veinAngle;
      const key = Math.floor((col + 10) / 4) + ':' + (row < 0 ? 'upper' : 'lower'); if (!groups.has(key)) groups.set(key, []);
      const grain = rand(); groups.get(key).push({ x: col * unit, y: row * unit + (dry ? Math.sin(col * .45) * unit * .35 : 0), glyph: vein || branch || edge ? '-' : grain < .55 ? ':' : grain < .88 ? '.' : '+', vein, branch, edge, direction, u: (row + 10) / 16, shade: .78 + rand() * .28 });
    }
    groups.set('stem', [0, 1, 2, 3].map(i => ({ x: Math.sin(i * .25) * unit * .4, y: (7 + i) * unit, glyph: '|', vein: true, direction: 1.5, u: 1, shade: 1 })));
    return groups;
  }
  function scatterFood(x, y) {
    if (foods.length > 48) return;
    const roll = rand(), style = roll < .4 ? 'green' : roll < .7 ? 'maple-red' : 'maple-dry';
    const unit = W < 650 ? 4 : 5, groups = new Map(), fall = 1.25 + rand() * .7;
    const leaf = { style, tint: .92 + rand() * .16, x: clamp(x, 42, W - 42), y: clamp(y, 90, H - 35), rotation: rand() * TAU, phase: rand() * TAU, fall, height: 60 + rand() * 28 };
    if (style === 'green') {
      for (let col = 0; col <= 24; col++) {
        const u = col / 24, curve = -1.4 * Math.sin(Math.PI * u), half = 5.1 * Math.pow(Math.sin(Math.PI * u), .78) * (1.12 - .24 * u);
        const top = Math.ceil(curve - half), bottom = Math.floor(curve + half * .88);
        for (let row = top; row <= bottom; row++) {
          const mid = Math.abs(row - curve) < .48, edge = row === top || row === bottom;
          const branch = !mid && !edge && Math.abs(Math.abs(row - curve) - (col % 5) * .75) < .45;
          const key = Math.floor(col / 5) + ':' + (row < curve ? 'upper' : 'lower');
          if (!groups.has(key)) groups.set(key, []);
          const upper = row < curve;
          const direction = mid ? Math.atan(-1.4 * Math.PI / 24 * Math.cos(Math.PI * u)) : branch ? (upper ? -.72 : .72) : Math.atan((upper ? -1 : 1) * 5.1 * Math.PI / 24 * Math.cos(Math.PI * u));
          const grain = rand();
          groups.get(key).push({ x: (col - 12) * unit * .8, y: row * unit, glyph: mid || branch || edge ? '-' : grain < .45 ? ':' : grain < .8 ? '.' : '+', vein: mid, branch, edge, direction: Math.atan2(Math.sin(direction), Math.cos(direction) * .8), u, shade: upper ? .85 : 1.0 });
        }
      }
      groups.set('stem', [0, 1, 2].map(i => ({ x: (-13 - i) * unit * .8, y: i * unit * .22, glyph: '-', vein: true, direction: -.2, u: 0, shade: 1 })));
    } else { for (const [key, tiles] of mapleTiles(unit, style === 'maple-dry')) groups.set(key, tiles); }
    let index = 0;
    for (const tiles of groups.values()) {
      const ox = tiles.reduce((v, t) => v + t.x, 0) / tiles.length, oy = tiles.reduce((v, t) => v + t.y, 0) / tiles.length;
      const breakAt = fall + 1.4 + rand() * 2.0, floatTime = breakAt - fall + .6 + rand(), sinkTime = 3.2 + rand() * 2;
      const f = { x: leaf.x, y: leaf.y, leaf, offsetX: ox, offsetY: oy, renderAngle: leaf.rotation, detached: false, spread: (rand() - .5) * 1.8, driftSpeed: 9 + rand() * 19, spin: (rand() - .5) * .6, age: 0, fall, breakAt, floatTime, sinkTime, life: fall + floatTime + sinkTime, height: 0, scale: 1, unit, vx: 0, vy: 0, seed: rand() * TAU, splashMaster: index++ === 0, tiles: tiles.map(t => ({ ...t, x: t.x - ox, y: t.y - oy })) };
      positionLeafFragment(f, 0); foods.push(f);
    }
  }
  function pelletLook(f) {
    const age = f.age || 0, fall = f.fall || 0, landed = age >= fall;
    const fallProgress = fall ? clamp(age / fall, 0, 1) : 1;
    const depth = landed ? clamp((age - fall - (f.floatTime || 0)) / (f.sinkTime || 1), 0, 1) : 0;
    const softness = depth * depth * (3 - 2 * depth);
    return { landed, depth, alpha: (.95 - .55 * depth) * (1 - Math.pow(depth, 3)), size: (f.scale || 1) * (1 - .50 * softness), yOffset: f.leaf ? softness * 24 : landed ? softness * 24 + Math.sin(age * 2 + (f.seed || 0)) * 1.1 * (1 - depth) : -Math.pow(1 - fallProgress, 2) * (f.height || 0), splash: landed ? clamp(1 - (age - fall) / .65, 0, 1) : 0 };
  }
  function drawFood(underwater = false) {
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const f of foods) {
      const look = pelletLook(f); if ((look.depth > 0) !== underwater) continue;
      const cell = clamp(Math.floor(f.y / ch), 0, rows - 1) * cols + clamp(Math.floor(f.x / cw), 0, cols - 1);
      const x = f.x + waterX[cell], y = f.y + look.yOffset + waterY[cell], depth = look.depth;
      if (look.splash > 0 && f.splashMaster) { ctx.globalAlpha = look.splash * .35; ctx.fillStyle = light ? '#8caa98' : '#b6d1bb'; ctx.font = `${ch * (4 - look.splash)}px monospace`; ctx.fillText('~', x, y); }
      ctx.globalAlpha = look.alpha;
      ctx.font = `bold ${Math.max(6, (f.unit || 8) * 1.24 * look.size)}px "Courier New",monospace`;
      for (const tile of f.tiles || []) {
        const c = Math.cos(f.renderAngle || 0), s = Math.sin(f.renderAngle || 0);
        const shade = tile.shade || 1, dim = 1 - depth * .46;
        if (f.leaf?.style === 'maple-red' || f.leaf?.style === 'maple-dry') {
          const dry = f.leaf.style === 'maple-dry', vein = tile.vein || tile.branch;
          const color = dry ? (vein ? [193, 160, 96] : tile.edge ? [134, 94, 50] : [170, 124, 64]) : (vein ? [199, 127, 104] : tile.edge ? [139, 62, 60] : [181, 79, 72]);
          const strength = (vein ? 1 : shade) * (f.leaf.tint || 1) * (light ? .76 : 1) * dim;
          ctx.fillStyle = `rgb(${color.map(v => Math.round(v * strength)).join(',')})`;
        } else {
          if (tile.vein || tile.branch) ctx.fillStyle = light ? '#788047' : `rgb(${Math.round(182 * dim)},${Math.round(183 * dim)},${Math.round(109 * dim)})`;
          else if (tile.edge) ctx.fillStyle = light ? '#486747' : `rgb(${Math.round(111 * dim)},${Math.round(149 * dim)},${Math.round(94 * dim)})`;
          else ctx.fillStyle = light ? `rgb(${Math.round(75 * shade)},${Math.round(109 * shade)},${Math.round(60 * shade)})` : `rgb(${Math.round(126 * shade * dim)},${Math.round(165 * shade * dim)},${Math.round(99 * shade * dim)})`;
        }
        ctx.globalAlpha = look.alpha * (tile.branch ? .65 : tile.edge ? .80 : 1);
        ctx.font = `${tile.vein ? 'bold ' : ''}${Math.max(5, (f.unit || 5) * 1.45 * look.size)}px "Courier New",monospace`;
        let glyph = tile.glyph;
        if (tile.vein || tile.branch || tile.edge) { const a = (f.renderAngle || 0) + (tile.direction || 0), dx = Math.cos(a), dy = Math.sin(a); glyph = Math.abs(dy) < .35 ? '-' : Math.abs(dx) < .35 ? '|' : dx * dy > 0 ? '\\' : '/'; }
        ctx.fillText(glyph, x + (tile.x * c - tile.y * s) * look.size, y + (tile.x * s + tile.y * c) * look.size);
      }
      if (depth > 0 && depth < .45) { const t = depth / .45; ctx.globalAlpha = Math.sin(t * Math.PI) * .3; ctx.fillStyle = light ? '#75998b' : '#b9d8c3'; ctx.font = `${ch * .8}px monospace`; ctx.fillText('o', f.x + 5 + Math.sin(t * 5 + f.seed) * 2, f.y - t * 22); }
    }
    ctx.restore();
  }
  function disturbWater(x, y) {
    const reach = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
    const speed = Math.max(150, reach / 2.8);
    if (surfaceWaves.length >= 8) surfaceWaves.shift();
    surfaceWaves.push({ x, y, age: 0, speed, life: reach / speed + 1.7 });
  }
  function waterSample(x, y) {
    let ox = 0, oy = 0, shine = 0;
    for (const w of surfaceWaves) {
      const dx = x - w.x, dy = y - w.y, d = Math.hypot(dx, dy), front = w.age * w.speed;
      if (d > front + 30) continue;
      const q = d - front, width = 24 + w.age * 5;
      if (q < -width * 4 || q > width * 1.5) continue;
      const packet = Math.exp(-Math.pow((q + width * .6) / (width * 1.25), 2));
      const fade = Math.exp(-w.age * .46) * Math.min(1, w.age * 9) * Math.min(1, (w.life - w.age) * 2);
      const phase = q / 13;
      const slope = Math.cos(phase) * packet * fade;
      const displacement = slope * 9;
      const distance = d || 1; ox += dx / distance * displacement; oy += dy / distance * displacement;
      shine += Math.max(0, Math.cos(phase)) * packet * fade;
    }
    return [clamp(ox, -12, 12), clamp(oy, -12, 12), Math.min(1, shine)];
  }
  function buildWaterField() {
    const length = cols * rows; if (waterX.length !== length) { waterX = new Float32Array(length); waterY = new Float32Array(length); waterLight = new Float32Array(length); }
    waterX.fill(0); waterY.fill(0); waterLight.fill(0);
    if (!surfaceWaves.length) return;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const i = y * cols + x, sample = waterSample(x * cw + cw / 2, y * ch + ch / 2); waterX[i] = sample[0]; waterY[i] = sample[1]; waterLight[i] = sample[2];
    }
  }
  function render() { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = light ? '#f3f1e9' : '#101411'; ctx.fillRect(0, 0, W, H); ctx.font = `${ch * .93}px "Courier New",monospace`; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    buildWaterField();
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const i = y * cols + x, n = hash(x, y), glow = waterLight[i], wave = Math.sin(x * .055 + y * .09 - time * .15) + Math.sin(x * .025 - y * .11 + time * .11);
      const px = x * cw + cw / 2 + waterX[i], py = y * ch + ch / 2 + waterY[i];
      if (glow > .055 && n > .13) { ctx.fillStyle = light ? `rgba(69,103,88,${glow * .40})` : `rgba(168,201,184,${glow * .53})`; ctx.fillText(glow > .3 ? '~' : n > .6 ? '·' : '-', px, py); }
      else if (y % 2 === 0 && n > .963 && wave > .3) { ctx.fillStyle = light ? '#84947a25' : '#84947a20'; ctx.fillText(n > .987 ? '~' : '·', px, py); }
    }
    drawFood(true);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cols, rows); g.setTransform(1 / cw, 0, 0, 1 / ch, 0, 0); for (const f of fish) drawFish(f);
    const data = g.getImageData(0, 0, cols, rows).data; const glyphs = '.:;=+*#%@';
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const i = (y * cols + x) * 4, a = data[i + 3]; if (a < 35) continue; const r = data[i], gr = data[i + 1], b = data[i + 2]; let density = clamp((a / 255) * .7 + hash(x, y) * .3, 0, 1); let glyph = glyphs[Math.floor(density * (glyphs.length - 1))]; if (r > gr * 1.15) glyph = '=+*#%'[Math.floor(hash(x + 2, y) * 5)]; else if (a < 150) glyph = '.:;+'[Math.floor(hash(x, y) * 4)]; ctx.fillStyle = `rgba(${r},${gr},${b},${a / 255})`; const cell = y * cols + x; ctx.fillText(glyph, x * cw + cw / 2 + waterX[cell], y * ch + ch / 2 + waterY[cell]); }
    for (const r of ripples) { const radius = r.age * (r.small ? 15 : 34) + 3; for (let ring = 0; ring < 2; ring++) { const rad = radius - ring * 15; if (rad < 1) continue; const count = Math.max(8, Math.ceil(rad * .5)); ctx.fillStyle = light ? `rgba(83,110,88,${.45 * (1 - r.age / 4)})` : `rgba(139,165,129,${.45 * (1 - r.age / 4)})`; for (let k = 0; k < count; k++) { const a = k / count * TAU; const x = Math.round((r.x + Math.cos(a) * rad) / cw) * cw, y = Math.round((r.y + Math.sin(a) * rad * .65) / ch) * ch; ctx.fillText(k % 3 ? '·' : '~', x, y); } } }
    drawFood(); dirty = false;
  }
  function loop(now) { let dt = Math.min((now - last) / 1000, .04) || 0; last = now; if (!paused && !document.hidden && onScreen) { let remaining = dt; while (remaining > 0) { const step = Math.min(remaining, 1 / 120); update(step); remaining -= step; } render(); } else if (dirty) render(); raf = requestAnimationFrame(loop); }

  // ---- interaction (coords relative to the canvas) ----
  canvas.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true; } });
  canvas.addEventListener('pointerleave', () => pointer.active = false);
  canvas.addEventListener('pointerdown', e => { const r = canvas.getBoundingClientRect(); scatterFood(e.clientX - r.left, e.clientY - r.top); dirty = true; });

  // pause when the cover is scrolled off-screen
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { onScreen = es[0].isIntersecting; if (onScreen) { last = performance.now(); } }, { threshold: 0 }); io.observe(header); }
  // keep reduced-motion honoured if the OS setting changes
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => { paused = e.matches; dirty = true; });
  document.addEventListener('visibilitychange', () => { last = performance.now(); });

  render();
  raf = requestAnimationFrame(loop);
})();
