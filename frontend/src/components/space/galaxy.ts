/**
 * Procedural spiral galaxy, tilted like a disc seen from above at an angle.
 * Stars sit in two logarithmic arms with spurs, a bright warm core, pink inner
 * arms, purple/blue outer arms, soft nebula clouds and dark dust lanes.
 * Inner stars orbit faster. The timeline (seconds) drives a slow approach,
 * then a dive into the core. Returns a function that stops the animation.
 */
export function startGalaxy(canvas: HTMLCanvasElement, duration = 5): () => void {
  const ctx = canvas.getContext?.('2d')
  if (!ctx) return () => undefined
  const DURATION = duration
  let w = 0, h = 0, dpr = 1, frame = 0;

  const resize = (): void => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.round(canvas.clientWidth * dpr);
    h = canvas.height = Math.round(canvas.clientHeight * dpr);
  };
  resize();
  window.addEventListener('resize', resize);

  const small = window.innerWidth < 700;
  const N = small ? 5000 : 13000;
  const DUST = small ? 1500 : 4200;
  const CLOUDS = small ? 150 : 380;
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  // colour buckets: core → inner pink → magenta → violet → blue
  const BUCKETS = [
    'rgba(255,248,235,0.95)', 'rgba(255,214,232,0.85)', 'rgba(249,168,212,0.75)',
    'rgba(240,171,252,0.7)', 'rgba(192,132,252,0.65)', 'rgba(167,139,250,0.6)',
    'rgba(129,140,248,0.55)', 'rgba(96,165,250,0.5)', 'rgba(147,197,253,0.55)',
  ];
  const rr = new Float32Array(N), th = new Float32Array(N), sz = new Float32Array(N), bk = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    let r: number
    do { r = -Math.log(1 - Math.random()) / 2.6; } while (r > 1.15);
    const inArm = Math.random() < 0.72;
    const arm = i % 2;
    let a: number
    if (inArm) {
      const spread = 0.55 * (1 - Math.min(r, 1)) + 0.28;
      a = arm * Math.PI + r * 4.6 + gauss() * spread;
      if (Math.random() < 0.22) a += 0.7 + gauss() * 0.2; // spurs between the main arms
      r *= 1 + gauss() * 0.06;
    } else {
      a = Math.random() * Math.PI * 2;
    }
    rr[i] = r; th[i] = a;
    sz[i] = (Math.random() < 0.025 ? 2.6 : 1) * (0.5 + Math.random() * 0.8);
    const c = r < 0.05 ? 0 : r < 0.12 ? 1 : r < 0.22 ? 2 : r < 0.33 ? 3 : r < 0.45 ? 4 : r < 0.58 ? 5 : r < 0.7 ? 6 : r < 0.84 ? 7 : 8;
    bk[i] = Math.max(0, Math.min(8, c + (Math.random() < 0.25 ? 1 : 0) - (Math.random() < 0.15 ? 1 : 0)));
  }
  const dr = new Float32Array(DUST), dth = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    const r = 0.1 + Math.pow(Math.random(), 0.85) * 0.85;
    dr[i] = r; dth[i] = (i % 2) * Math.PI + r * 4.6 + 0.4 + gauss() * 0.32;
  }
  // soft nebula clouds that give the arms their glow
  const CLOUD_COL = ['244,114,182', '232,121,249', '192,132,252', '167,139,250', '129,140,248', '96,165,250'];
  const cr = new Float32Array(CLOUDS), cth = new Float32Array(CLOUDS), csz = new Float32Array(CLOUDS), cc = new Uint8Array(CLOUDS);
  for (let i = 0; i < CLOUDS; i++) {
    const r = 0.08 + Math.pow(Math.random(), 0.9) * 0.95;
    cr[i] = r; cth[i] = (i % 2) * Math.PI + r * 4.6 + gauss() * 0.3;
    csz[i] = 0.05 + Math.random() * 0.09;
    cc[i] = Math.min(5, Math.floor(r * 5.5 + Math.random() * 1.2));
  }
  const bg = Array.from({ length: 260 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.3 + 0.3, p: Math.random() * 6 }));

  const omega = (r: number): number => 0.16 / (0.25 + r); // differential rotation (rad/s)
  const t0 = performance.now();

  const draw = (now: number): void => {
    const t = (now - t0) / 1000;
    // slow approach, then dive into the core
    // the ship reaches the core at 40% of the timeline; the camera follows it in
    const diveAt = DURATION * 0.4
    let zoom = 0.78 + 0.16 * Math.min(1, t / diveAt)
    if (t > diveAt) zoom *= 1 + Math.pow(Math.min(1, (t - diveAt) / (DURATION * 0.38)), 2.4) * 7
    const flash = Math.exp(-Math.pow((t - DURATION * 0.42) / 0.22, 2))

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#03020a';
    ctx.fillRect(0, 0, w, h);

    // distant stars
    for (const s of bg) {
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 2 + s.p);
      ctx.fillStyle = '#e9e5ff';
      ctx.fillRect(s.x * w, s.y * h, s.s * dpr, s.s * dpr);
    }
    ctx.globalAlpha = 1;

    const R = Math.min(w * 0.62, h * 0.95) * zoom;
    const tilt = 0.44;
    ctx.save();
    ctx.translate(w / 2, h * 0.46);
    ctx.rotate(-0.22);
    ctx.scale(1, tilt);

    // soft disc haze + core glow
    ctx.globalCompositeOperation = 'lighter';
    let g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.05);
    g.addColorStop(0, 'rgba(244,114,182,0.34)');
    g.addColorStop(0.3, 'rgba(192,132,252,0.18)');
    g.addColorStop(0.65, 'rgba(99,102,241,0.1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, R * 1.05, 0, Math.PI * 2); ctx.fill();

    // nebula clouds along the arms
    for (let i = 0; i < CLOUDS; i++) {
      const a = cth[i] + t * omega(cr[i]);
      const x = Math.cos(a) * cr[i] * R, y = Math.sin(a) * cr[i] * R, s = csz[i] * R;
      const cg = ctx.createRadialGradient(x, y, 0, x, y, s);
      cg.addColorStop(0, `rgba(${CLOUD_COL[cc[i]]},0.075)`);
      cg.addColorStop(1, `rgba(${CLOUD_COL[cc[i]]},0)`);
      ctx.fillStyle = cg;
      ctx.fillRect(x - s, y - s, s * 2, s * 2);
    }

    // stars, batched by colour
    const unit = dpr * (0.75 + zoom * 0.3);
    for (let b = 0; b < BUCKETS.length; b++) {
      ctx.fillStyle = BUCKETS[b];
      for (let i = 0; i < N; i++) {
        if (bk[i] !== b) continue;
        const a = th[i] + t * omega(rr[i]);
        const x = Math.cos(a) * rr[i] * R;
        const y = Math.sin(a) * rr[i] * R;
        const s = sz[i] * unit;
        ctx.fillRect(x, y, s, s / tilt);
      }
    }

    // dust lanes darken the inner edge of each arm
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(10,5,26,0.12)';
    for (let i = 0; i < DUST; i++) {
      const a = dth[i] + t * omega(dr[i]);
      const s = 7 * unit;
      ctx.fillRect(Math.cos(a) * dr[i] * R, Math.sin(a) * dr[i] * R, s, s / tilt);
    }

    // bright core (+ flash when the ship reaches it)
    ctx.globalCompositeOperation = 'lighter';
    const coreR = R * (0.3 + flash * 0.3);
    g = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
    g.addColorStop(0, 'rgba(255,255,248,1)');
    g.addColorStop(0.12, 'rgba(255,240,235,0.85)');
    g.addColorStop(0.35, `rgba(253,186,210,${0.38 + flash * 0.4})`);
    g.addColorStop(0.7, 'rgba(236,72,153,0.12)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, coreR, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.globalCompositeOperation = 'source-over';
    if (t < DURATION + 0.5) frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', resize)
  }
}
