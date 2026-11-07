// Floor plans panel: a floor stack (top floor first) beside a plan viewer.
// Picking a floor shows its published plan(s) and lights that floor up on the
// 3D model; "View on 3D model" scrolls back up to the tour.
import { plansFor } from './data/floorplans.js';

const ord = (n) => {
  if (n === 1) return 'Ground floor';
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th');
  return `${n}${s} floor`;
};
const floorsLabel = (fl) => {
  if (fl.length === 1) return ord(fl[0]);
  const contiguous = fl.every((f, i) => i === 0 || f === fl[i - 1] + 1);
  return contiguous ? `Floors ${fl[0]}–${fl[fl.length - 1]}` : `Floors ${fl.join(', ')}`;
};

export function initPlans(p, viewer) {
  const section = document.getElementById('plans');
  if (!section) return;
  const plans = plansFor(p.id);
  const floors = p.model?.procedural?.floors ?? 1;
  const card = section.querySelector('[data-plans]');
  const count = section.querySelector('[data-plans-count]');

  if (!plans.length) {
    section.classList.add('is-empty');
    count.textContent = '';
    card.innerHTML = `<div class="plans-empty">
      <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="1"/><path d="M3.5 10h7v10.5M10.5 14H20.5M14 3.5v6.5"/></svg>
      <div><b>No floor plans have been published for this property.</b>
      <p>We searched the public listing archives and could not find a published plan. Our leasing team can share current plans on request.</p></div>
      <a class="btn btn-outline btn-sm" href="contact.html?property=${encodeURIComponent(p.id)}&topic=plans">Request floor plans</a>
    </div>`;
    return;
  }

  const byFloor = new Map();
  plans.forEach((pl, i) => pl.floors.forEach((f) => { if (!byFloor.has(f)) byFloor.set(f, []); byFloor.get(f).push(i); }));
  const covered = [...byFloor.keys()].length;
  count.textContent = `${plans.length} plan${plans.length > 1 ? 's' : ''} · ${covered} of ${floors} floor${floors > 1 ? 's' : ''}`;

  const stack = card.querySelector('[data-plan-stack]');
  const tabs = card.querySelector('[data-plan-tabs]');
  const stage = card.querySelector('[data-plan-stage]');
  const img = stage.querySelector('img');
  const kind = card.querySelector('[data-plan-kind]');
  const title = card.querySelector('[data-plan-title]');
  const note = card.querySelector('[data-plan-note]');
  const src = card.querySelector('[data-plan-src]');
  const full = card.querySelector('[data-plan-full]');
  const to3d = card.querySelector('[data-plan-3d]');

  // Floor stack, top floor first. Floors without a plan stay visible but muted,
  // so the stack reads like the building.
  stack.innerHTML = Array.from({ length: floors }, (_, k) => floors - k).map((f) => {
    const n = byFloor.get(f)?.length ?? 0;
    return `<li><button type="button" data-floor="${f}" ${n ? '' : 'disabled'} aria-label="${ord(f)}${n ? `, ${n} plan${n > 1 ? 's' : ''}` : ', no published plan'}">
      <span class="fl-n">${f === 1 ? 'G' : f}</span><span class="fl-bar"></span>${n ? `<span class="fl-c">${n}</span>` : ''}</button></li>`;
  }).join('');
  stack.classList.toggle('tall', floors > 8);

  let floor = null;
  let planIdx = null;

  function showPlan(i) {
    planIdx = i;
    const pl = plans[i];
    unzoom();
    stage.classList.add('loading');
    img.onload = () => stage.classList.remove('loading');
    img.src = pl.src;
    img.alt = `${pl.kind}: ${pl.label}, ${p.address}`;
    stage.classList.toggle('photo', pl.kind === 'Unit');
    kind.textContent = pl.kind;
    title.textContent = pl.kind === 'Typical floor' ? `${floorsLabel(pl.floors)} · typical`
      : pl.kind === 'Full floor' ? ord(floor)
      : pl.kind === 'Unit' ? `${pl.label} unit`
      : `${pl.label} · ${ord(floor)}`;
    note.textContent = pl.note;
    src.textContent = pl.source.name;
    src.href = pl.source.url;
    full.href = pl.src;
    tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(Number(b.dataset.i) === i)));
  }

  function showFloor(f, { focus3d = true } = {}) {
    floor = f;
    const list = byFloor.get(f);
    stack.querySelectorAll('button').forEach((b) => b.classList.toggle('on', Number(b.dataset.floor) === f));
    tabs.innerHTML = list.map((i) => `<button type="button" role="tab" data-i="${i}">${plans[i].label}</button>`).join('');
    tabs.hidden = list.length < 2;
    const keep = list.includes(planIdx) ? planIdx : list[0];
    showPlan(keep);
    if (focus3d) show3d();
  }

  // The plan to lay into the 3D model for the current floor: the one on screen
  // if it is a full-floor plan, else the floor's full-floor/typical plan.
  const plan3dFor = (f, i) => {
    if (plans[i]?.model3d && plans[i].floors.includes(f)) return plans[i];
    return (byFloor.get(f) ?? []).map((k) => plans[k]).find((pl) => pl.model3d) ?? null;
  };
  function show3d() {
    if (!viewer?.model) return;
    const pl = plan3dFor(floor, planIdx);
    if (pl) viewer.showPlan(floor, pl);
    else { viewer.clearPlan(); viewer.focusFloor(floor); }
  }

  stack.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-floor]');
    if (b && !b.disabled) showFloor(Number(b.dataset.floor));
  });
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (b) { showPlan(Number(b.dataset.i)); if (viewer?.plan) show3d(); }
  });
  to3d.addEventListener('click', () => {
    const tour = document.getElementById('tour');
    const y = tour.getBoundingClientRect().top + scrollY - (document.querySelector('.site-header')?.offsetHeight || 0) - 14;
    scrollTo({ top: y, behavior: 'smooth' });
    show3d();
  });

  // In-viewer control while a floor is cut open: step between floors that have
  // a full-floor plan, or go back to the whole building.
  const floors3d = [...byFloor.keys()].filter((f) => plan3dFor(f)).sort((a, b) => a - b);
  const pill = document.getElementById('plan-pill');
  if (pill && viewer) {
    const lab = pill.querySelector('[data-pill-label]');
    const up = pill.querySelector('[data-pill-up]');
    const down = pill.querySelector('[data-pill-down]');
    viewer.onPlan = (n, pl) => {
      pill.hidden = n == null;
      document.getElementById('hint')?.classList.toggle('hidden-for-plan', n != null);
      if (n == null) return;
      lab.textContent = `${ord(n)} plan`;
      up.disabled = !floors3d.some((f) => f > n);
      down.disabled = !floors3d.some((f) => f < n);
      if (floor !== n) showFloor(n, { focus3d: false });
    };
    up.addEventListener('click', () => { const f = floors3d.find((x) => x > viewer.plan?.n); if (f) showFloor(f); });
    down.addEventListener('click', () => { const f = [...floors3d].reverse().find((x) => x < viewer.plan?.n); if (f) showFloor(f); });
    pill.querySelector('[data-pill-close]').addEventListener('click', () => viewer.clearPlan());
  }
  to3d.textContent = floors3d.length ? 'See it in 3D' : 'View on 3D model';

  // Click to zoom; while zoomed the plan follows the pointer. Esc / click resets.
  function unzoom() { stage.classList.remove('zoomed'); img.style.transformOrigin = ''; }
  function pan(e) {
    const r = stage.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
  }
  stage.addEventListener('click', (e) => {
    if (stage.classList.toggle('zoomed')) pan(e); else unzoom();
  });
  stage.addEventListener('pointermove', (e) => { if (stage.classList.contains('zoomed')) pan(e); });
  stage.addEventListener('mouseleave', unzoom);
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') unzoom();
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stage.classList.toggle('zoomed'); }
  });

  // Start on the most useful floor: the lowest floor with a full-floor or
  // typical plan, else the lowest floor with any plan. Don't move the 3D camera.
  const pref = plans.find((pl) => pl.kind === 'Full floor' || pl.kind === 'Typical floor' || pl.kind === 'Site plan');
  const first = pref ? Math.min(...pref.floors) : Math.min(...byFloor.keys());
  showFloor(first, { focus3d: false });
}
