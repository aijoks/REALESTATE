// Real surroundings for site 'tucson-speedway-1815' (traced from satellite imagery / OSM).
// Called at the end of buildSuburban. ctx: { THREE, scene, add, flat, box, W, D, front, site, r, mats }
//
// Palm Shadows, 1815 E Speedway Blvd, Tucson. Model frame = the 42 x 112 m
// parcel: +z = south onto Speedway Blvd, +x = east toward Campbell Ave.
//   - Speedway: 6-lane arterial (north roadway z 58.7..74.5, raised median,
//     south roadway z 76.5..94.3); Campbell Ave (x 44.8..84.7, planted median)
//     at the signalised corner east of the vacant corner lot.
//   - West: the twin complex (1801 E Speedway, a mirror image across the
//     shared drive aisle), then the Babcock Office Building (UA, a former
//     motel with its own pool), McDonald's and Wells Fargo.
//   - North: E Helen St and UofA Lot 2030; NE corner: Coph-Center for Health
//     Equality (UA) with its lot.
//   - South across Speedway: Dirtbags, 7-Eleven, Taco Bell, Wendy's, the
//     Bentley's / Kingdom Textbooks strip; SE: Aloft Tucson University.
//   - East of Campbell: Chipotle and the Pizza Hut / Verizon / Subway /
//     Cold Stone strip, UofA Lot 9003, Our Savior Church.
import { desertKit, arrow } from './tucson-snyder.js';
import { buildCourtyard } from '../courtyard.js';

export function site_tucson_speedway_1815(ctx) {
  const K = desertKit(ctx, { seed: 1815 });
  const { THREE, mat, flat, strip, road, stalls, pole, tree, palm, shrub, bed, bldg, sign, monument, house, box, M, car, rails, glazing } = K;
  const R = K.r;
  flat(M('#c2ab88', { roughness: 1 }), -500, 500, -500, 500, 0.02);
  const pavers = M('#a8694d', { roughness: 0.95 });
  const walkM = mat.concrete;

  // ---------------- streets ----------------
  // Speedway Blvd (west and east of Campbell).
  const speedway = (x0, x1) => {
    road(x0, 66.6, x1, 66.6, 15.8, { centre: 'none', lanes: [-2.9, 0.5] });
    road(x0, 85.4, x1, 85.4, 17.8, { centre: 'none', lanes: [-1.6, 1.8] });
    for (const z of [60.3, 90.8]) strip(mat.white, x0, z, x1, z, 0.14, 0.075); // bike lanes
    for (const z of [74.25, 76.75]) strip(mat.yellow, x0, z, x1, z, 0.12, 0.075);
    box(mat.kerb, x1 - x0, 0.18, 2.0, (x0 + x1) / 2, 0.09, 75.5, 0, false); // median
    strip(pavers, x0, 75.5, x1, 75.5, 1.6, 0.185);
  };
  speedway(-500, 39.5);
  speedway(90, 500);
  flat(mat.road, 39.5, 90, 58.7, 94.3, 0.046); // intersection + crosswalk zone
  // Campbell Ave north and south of Speedway, with planted medians.
  const campbell = (z0, z1, xs) => {
    const [a, b, c, d] = xs; // west curb, median W, median E, east curb
    road((a + b) / 2, z0, (a + b) / 2, z1, b - a, { centre: 'none', lanes: [-(b - a) / 6, (b - a) / 6] });
    road((c + d) / 2, z0, (c + d) / 2, z1, d - c, { centre: 'none', lanes: [-(d - c) / 6, (d - c) / 6] });
    for (const x of [b + 0.25, c - 0.25]) strip(mat.yellow, x, z0, x, z1, 0.12, 0.075);
  };
  campbell(53, -500, [44.8, 59.4, 68.9, 84.7]);
  campbell(99.5, 500, [44.4, 59.6, 64.6, 80.0]);
  flat(mat.road, 44.6, 84.7, 53, 58.7, 0.046);
  flat(mat.road, 44.4, 84.7, 94.3, 99.5, 0.046);
  // Campbell north median: red pavers, desert trees and shrubs, rounded nose.
  box(mat.kerb, 9.5, 0.18, 107, 64.15, 0.09, -5.5, 0, false);
  flat(pavers, 59.6, 68.7, -58.8, 47.8, 0.19);
  for (let z = -52; z < 44; z += 13) tree(64.15, z + R() * 3, 0.9, R() < 0.5 ? 'paloverde' : 'mesquite');
  for (let z = -57; z < 46; z += 4.5) shrub(61.5 + R() * 5, z, 0.6);
  box(mat.kerb, 9.5, 0.18, 425, 64.15, 0.09, -287, 0, false);
  box(mat.kerb, 5.0, 0.18, 400, 62.1, 0.09, 300, 0, false);
  // Crosswalks (continental bars) and stop bars on all four legs.
  for (let z = 59.4; z < 94; z += 1.25) if (z < 74 || z > 77) { strip(mat.white, 40.2, z, 44.2, z, 0.55, 0.075); strip(mat.white, 85.3, z, 89.3, z, 0.55, 0.075); }
  for (let x = 45.4; x < 84.2; x += 1.25) if (x < 59 || x > 69.4) strip(mat.white, x, 53.6, x, 57.6, 0.55, 0.075);
  for (let x = 45.0; x < 79.6; x += 1.25) if (x < 59.4 || x > 64.8) strip(mat.white, x, 95.4, x, 99.0, 0.55, 0.075);
  strip(mat.white, 39.2, 58.9, 39.2, 74.3, 0.4, 0.075);
  strip(mat.white, 89.9, 76.7, 89.9, 94.1, 0.4, 0.075);
  strip(mat.white, 45, 52.5, 59.2, 52.5, 0.4, 0.075);
  strip(mat.white, 64.8, 99.9, 79.8, 99.9, 0.4, 0.075);
  for (const [x, z, ry] of [[52, 46, Math.PI], [56, 46, Math.PI], [72, 105, 0], [76, 105, 0], [33, 63, Math.PI / 2], [33, 70, Math.PI / 2], [96, 82, -Math.PI / 2], [96, 89, -Math.PI / 2]]) arrow(ctx, K, x, z, ry);
  // E Helen St (two-way, parking on both sides) and N Martin Ave.
  road(-500, -66.7, 44.8, -66.7, 10.1, { centre: 'double' });
  road(84.7, -66.7, 500, -66.7, 10.1, { centre: 'double' });
  flat(mat.road, 44.8, 84.7, -71.8, -61.6, 0.046);
  road(-58.2, -71.8, -58.2, -500, 9, { centre: 'double' });
  road(204, -71.8, 204, -500, 8.5, { centre: 'none' }); // N Norris Ave
  road(-200, -61.6, -200, 55.6, 10, { centre: 'double' }); // N Warren Ave (to the underpass)
  // Sun Link streetcar on Helen St from Warren Ave (west of the site).
  for (const dz of [-1.6, 1.6]) rails(-214, -66.7 + dz, -112, -66.7 + dz);
  box(walkM, 26, 0.3, 2.6, -166, 0.15, -60.2, 0, false);
  for (const x of [-172, -160]) { box(M('#cfd2d4'), 0.2, 3, 0.2, x, 1.5, -60.2); box(M('#7a8c99', { metalness: 0.4, roughness: 0.4 }), 5, 0.15, 2.4, x, 3.05, -60.2); }

  // Sidewalks.
  const walk = (x0, x1, z0, z1, m = walkM) => flat(m, x0, x1, z0, z1, 0.12);
  walk(-500, 41.6, 55.6, 58.7, pavers); // Speedway north (red pavers)
  walk(88, 500, 55.6, 58.7, pavers);
  walk(-500, 41.0, 94.3, 97.5, pavers); // Speedway south
  walk(83.4, 500, 94.3, 97.5, pavers);
  walk(41.6, 44.8, -61.6, 58.7); // Campbell west (north of Speedway)
  walk(84.7, 88, -61.6, 58.7); // Campbell east
  walk(41.0, 44.4, 94.3, 500);
  walk(80, 83.4, 94.3, 500);
  walk(-500, 44.8, -61.6, -58.6); // Helen south
  walk(-500, 44.8, -74.9, -71.8); // Helen north
  walk(84.7, 500, -61.6, -58.6);
  walk(84.7, 500, -74.9, -71.8);
  walk(41.6, 44.8, -500, -71.8);
  walk(84.7, 88, -500, -71.8);
  // Kerb returns at the four corners of Speedway & Campbell.
  for (const [x, z] of [[44.8, 58.7], [84.7, 58.7], [44.4, 94.3], [80, 94.3]]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.14, 20), walkM);
    c.position.set(x + (x < 60 ? -1.6 : 1.6), 0.07, z + (z < 70 ? -1.6 : 1.6));
    ctx.add(c);
  }
  // Traffic signals: mast arms over the roadways at each corner.
  const poleM = M('#6b6e70', { roughness: 0.5, metalness: 0.6 });
  const headM = M('#1f2224', { roughness: 0.6 });
  const signal = (x, z, ax, az, len) => {
    box(poleM, 0.35, 7.2, 0.35, x, 3.6, z);
    const ry = -Math.atan2(az, ax);
    box(poleM, len, 0.22, 0.22, x + (ax * len) / 2, 6.9, z + (az * len) / 2, ry);
    for (const t of [len * 0.45, len * 0.7, len * 0.95]) {
      const hx = x + ax * t, hz = z + az * t;
      box(headM, 0.45, 1.25, 0.45, hx, 6.1, hz, ry);
      for (const [dy, c] of [[0.38, '#5a1d18'], [0, '#5d4a17'], [-0.38, '#2bd96b']]) box(M(c, { emissive: c, emissiveIntensity: c === '#2bd96b' ? 0.8 : 0.1 }), 0.28, 0.28, 0.5, hx, 6.1 + dy, hz, ry, false);
    }
    box(M('#2f3a33'), 1.0, 1.6, 0.6, x + 1.2 * az, 0.8, z - 1.2 * ax); // controller cabinet
  };
  signal(43.6, 57.4, 1, 0, 14); // NW corner, over southbound Campbell
  signal(86, 57.4, 0, 1, 15); // NE corner, over westbound Speedway
  signal(42.6, 96, 1, 0, 14); // SW corner, over northbound Campbell
  signal(81.8, 95.8, 0, -1, 16); // SE corner, over eastbound Speedway
  // Street lights along Speedway and Campbell.
  for (let x = -180; x < 300; x += 38) {
    if (Math.abs(x - 64) < 30) continue;
    pole(x, 57.9, { h: 10, arms: 1, ry: -Math.PI / 2 });
    pole(x + 19, 95.4, { h: 10, arms: 1, ry: Math.PI / 2 });
  }
  for (let z = -40; z > -200; z -= 40) pole(43.2, z, { h: 10, arms: 1, ry: 0 });

  // ---------------- the parcel and its twin: parking ----------------
  // Shared drive aisle x -26.7..-19.7 from Helen St to Speedway.
  flat(mat.asphalt, -69.5, 21.6, -58.6, 55.6, 0.05);
  flat(walkM, -26.9, -19.5, 55.6, 58.75, 0.125); // driveway apron on Speedway
  flat(walkM, -26.9, -19.5, -61.65, -58.6, 0.125); // and on Helen St
  // This property (east of the aisle).
  stalls(-19.7, -48.4, -19.7, -16.6, -1, { depth: 5.2, fill: 0.7 });
  stalls(-19.7, 28.8, -19.7, 52.8, -1, { depth: 5.2, fill: 0.65 });
  stalls(-19.7, 2.4, 20.0, 2.4, -1, { depth: 5.4, fill: 0.85, ada: 1 });
  stalls(-19.7, 9.8, 20.0, 9.8, 1, { depth: 5.4, fill: 0.55, ada: 1 });
  // The twin (1801), mirrored across the aisle.
  stalls(-26.7, -48.4, -26.7, -16.6, 1, { depth: 5.2, fill: 0.65 });
  stalls(-26.7, 28.8, -26.7, 52.8, 1, { depth: 5.2, fill: 0.6 });
  stalls(-66.2, 2.4, -26.7, 2.4, -1, { depth: 5.4, fill: 0.75, ada: 1 });
  stalls(-66.2, 9.8, -26.7, 9.8, 1, { depth: 5.4, fill: 0.6 });
  for (const [x, z, ry] of [[-23.2, 5.8, 0], [-23.2, -30, Math.PI / 2], [-23.2, 40, -Math.PI / 2]]) arrow(ctx, K, x, z, ry);
  // North strip behind the rear buildings.
  for (const [x, z] of [[1.1, -54], [12, -54], [-40, -54], [-58, -54]]) car(x, z, 0);
  bed(14, 21.4, -55.6, -50, { trees: 1, kind: 'mesquite' });
  for (const [x, z] of [[-23.2, -20], [-23.2, 22]]) pole(x, z, { h: 8, arms: 2, ry: 0 });
  // The twin complex: same buildings, mirrored about the aisle centre.
  {
    const tw = buildCourtyard({ width: 42, depth: 112, seed: 1801 });
    tw.group.scale.x = -1;
    tw.group.position.x = -46.4;
    ctx.add(tw.group);
  }

  // ---------------- east: corner lot + Coph-Center ----------------
  flat(mat.dirt, 21.6, 41.6, -12, 55.6, 0.04);
  flat(mat.asphalt2, 21.6, 41.6, -58.6, -30.5, 0.05);
  stalls(27.2, -55.5, 27.2, -31.5, 1, { depth: 5.4, fill: 0.5 });
  stalls(36.3, -55.5, 36.3, -31.5, -1, { depth: 5.3, fill: 0.15 });
  bldg({ x: 32.8, z: -20.5, w: 17.2, d: 16.1, h: 4.6, color: '#e6dccb', roofColor: '#e9e7e2', rtu: 3 });
  glazing(41.42, -20.5, Math.PI / 2, 6, 2.2, 0.3);
  sign('CENTER FOR HEALTH EQUALITY', 41.45, 3.6, -20.5, Math.PI / 2, { w: 9, h: 0.55, color: '#0c234b', bg: '#ffffff', glow: 0.1 });
  flat(mat.gravel, 21.6, 41.6, -30.5, -12, 0.045);
  for (const [x, z, k] of [[37, 4.8, 'paloverde'], [25, 25.7, 'mesquite'], [26.5, 32.7, 'paloverde'], [22.7, 42.8, 'mesquite'], [31, 48, 'paloverde'], [39, -8, 'mesquite']]) tree(x, z, 0.9, k);
  for (let k = 0; k < 14; k++) shrub(22 + R() * 19, -10 + R() * 64, 0.5 + R() * 0.4, '#8e9160');
  // Bus shelters (Speedway/Campbell stops).
  const shelter = (x, z, ry) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    const steel = M('#5b6166', { metalness: 0.5, roughness: 0.5 });
    for (const dx of [-2.3, 2.3]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.6, 0.12), steel); p.position.set(dx, 1.3, -0.7); g.add(p); }
    const roofM = new THREE.Mesh(new THREE.BoxGeometry(5, 0.12, 1.9), M('#7f8a8f', { metalness: 0.4 }));
    roofM.position.set(0, 2.65, -0.2);
    roofM.castShadow = true;
    const back = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.9, 0.05), M('#9fb6c2', { transparent: true, opacity: 0.45 }));
    back.position.set(0, 1.25, -0.75);
    const bench = new THREE.Mesh(new THREE.BoxGeometry(3, 0.08, 0.45), steel);
    bench.position.set(0, 0.45, -0.45);
    g.add(roofM, back, bench);
    ctx.add(g);
  };
  shelter(25.3, 56.9, 0);
  shelter(86.6, -3, Math.PI / 2);
  shelter(42.6, 113, -Math.PI / 2);
  shelter(101, 96.2, Math.PI);

  // ---------------- west: Babcock Office Building, McDonald's, Wells Fargo ----------------
  const cream = '#ece6da';
  flat(mat.asphalt2, -200, -69.5, -58.6, 55.6, 0.05);
  bldg({ x: -109, z: -36, w: 40, d: 14, h: 6.4, color: cream, rtu: 5 });
  bldg({ x: -81, z: -9.5, w: 17.1, d: 53, h: 9.2, color: cream, rtu: 6 });
  bldg({ x: -100.8, z: -8.2, w: 22.4, d: 15.5, h: 6.4, color: cream, rtu: 3 });
  bldg({ x: -103.4, z: 16.7, w: 17.3, d: 34.4, h: 6.4, color: cream, rtu: 4 });
  bldg({ x: -91.3, z: 43.4, w: 43.1, d: 13.2, h: 7.2, color: cream, rtu: 5 }); // Babcock Office Building (OSM)
  bldg({ x: -84.1, z: 51.8, w: 23.5, d: 4.6, h: 4.2, color: '#d9d2c4' });
  {
    const water = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 13.6), M('#3cc3dc', { roughness: 0.1, emissive: '#0d6f86', emissiveIntensity: 0.3 }));
    water.rotation.x = -Math.PI / 2;
    water.position.set(-80.8, 0.07, 26.8);
    ctx.add(water);
    flat(mat.concrete, -94.5, -72.5, 17.2, 36.8, 0.055);
    for (const [x, z] of [[-91, 20], [-74, 35], [-91, 34]]) palm(x, z, 12);
  }
  stalls(-112.6, -26, -112.6, 30, 1, { depth: 5.4, fill: 0.55 });
  stalls(-126, -26, -126, 30, -1, { depth: 5.4, fill: 0.5 });
  stalls(-131.5, -26, -131.5, 30, 1, { depth: 5.4, fill: 0.4 });
  stalls(-150, -50, -105, -50, 1, { depth: 5.4, fill: 0.45 });
  bldg({ x: -142.3, z: 32.7, w: 13.9, d: 30.7, h: 5.2, color: '#e0c9a6', roofColor: '#c8a26a', rtu: 2 }); // McDonald's (1711)
  sign("McDonald's", -142.3, 4.2, 48.1, 0, { w: 6, h: 1.1, color: '#ffc72c', bg: '#da291c', glow: 0.25 });
  monument('M', -133, 53, 0, { w: 1.8, h: 2.2, color: '#ffc72c', bg: '#da291c', base: '#9a5a44', font: '900 {s}px Arial' });
  bldg({ x: -174.9, z: 28.8, w: 20.8, d: 41.3, h: 6.5, color: '#d8cfbf', rtu: 3 }); // Wells Fargo
  sign('WELLS FARGO', -164.4, 4.6, 28.8, Math.PI / 2, { w: 8, h: 1.0, color: '#ffcd41', bg: '#d71e28', glow: 0.2 });

  // ---------------- north of Helen St ----------------
  // UofA Lot 2030 (between Martin Ave and Campbell) and the campus beyond.
  flat(mat.asphalt2, -51.7, 15.9, -206, -80, 0.05);
  for (const x of [-42, -24, -6, 12]) {
    stalls(x - 0.5, -82, x - 0.5, -200, 1, { depth: 5.2, fill: 0.55 });
    stalls(x + 0.5, -82, x + 0.5, -200, -1, { depth: 5.2, fill: 0.5 });
  }
  bed(15.9, 41.6, -206, -75, { trees: 0, m: mat.gravel });
  for (let z = -200; z < -78; z += 12) tree(28 + R() * 8, z, 1.0, R() < 0.5 ? 'mesquite' : 'ficus');
  for (let x = -48; x < 14; x += 11) tree(x, -77.5, 0.9, 'mesquite');
  flat(mat.asphalt2, -183, -69, -120, -77, 0.05); // UofA Lot 2029
  stalls(-180, -90, -72, -90, -1, { depth: 5, fill: 0.5 });
  stalls(-180, -102, -72, -102, 1, { depth: 5, fill: 0.5 });
  flat(mat.lawn, -170, -120, -160, -122, 0.04);
  bldg({ x: -155, z: -188.5, w: 54, d: 39, h: 14, color: '#efece6', rtu: 6 });
  bldg({ x: -94, z: -190, w: 42, d: 38, h: 15, color: '#f1eee8', rtu: 5 }); // Roy P. Drachman Hall
  bldg({ x: -94.5, z: -159, w: 41, d: 22, h: 8, color: '#8a5f48', roofColor: '#c9b9a4', rtu: 2 });
  bldg({ x: -150, z: -245, w: 55, d: 50, h: 16, color: '#e9e4da', rtu: 6 });
  bldg({ x: -92, z: -255, w: 38, d: 50, h: 18, color: '#f0ece4', rtu: 4 });
  // UofA Lot 2032 (south of Helen, west of Babcock).
  stalls(-190, -40, -155, -40, 1, { depth: 5, fill: 0.4 });
  // East of Campbell: UofA Lot 9003, houses, Our Savior Church.
  flat(mat.asphalt2, 88, 159, -56, 0.6, 0.05);
  for (const x of [98, 116, 134, 152]) {
    stalls(x - 0.5, -53, x - 0.5, -3, 1, { depth: 5, fill: 0.55 });
    stalls(x + 0.5, -53, x + 0.5, -3, -1, { depth: 5, fill: 0.5 });
  }
  for (const z of [-28]) for (const x of [98, 116, 134, 152]) tree(x, z, 0.9, 'ficus');
  for (const [x, z, w, d, h] of [[163.8, -37.9, 15.7, 21, 4.5], [181.8, -37.8, 11.9, 18.6, 4.2], [181.1, -5.4, 10.4, 10.8, 3.8], [162.8, -7.8, 6.6, 7.1, 3.6]]) house(x, z, w, d, 0, { h, roof: '#a8623e', wall: '#e3d3b8' });
  for (const [x, z, w, d] of [[109, -116, 42, 24], [138.7, -96.7, 40.2, 21], [167.4, -102.5, 33.4, 33]]) bldg({ x, z, w, d, h: 6.5, color: '#eadfcc', roof: 'hip', roofColor: '#b5523a', rise: 3.4 });
  for (let k = 0; k < 14; k++) house(218 + (k % 4) * 22 + R() * 4, -110 + Math.floor(k / 4) * 28, 12 + R() * 4, 10 + R() * 4, 0, { roof: R() < 0.5 ? '#a8623e' : '#7d8a95', wall: '#e3d3b8' });

  // ---------------- east of Campbell, north of Speedway ----------------
  flat(mat.asphalt2, 88, 200, 0.6, 55.6, 0.05);
  bldg({ x: 113.2, z: 21.3, w: 18.3, d: 14.7, h: 6.2, color: '#b9a48a', roofColor: '#d7d2c8', rtu: 2 }); // Chipotle (1903)
  glazing(113.2, 28.67, 0, 12, 2.6, 0.3);
  sign('CHIPOTLE', 113.2, 4.8, 28.7, 0, { w: 7, h: 1.1, color: '#ffffff', bg: '#441500', glow: 0.2, font: '800 {s}px Georgia, serif' });
  bldg({ x: 164.5, z: 19.9, w: 46.5, d: 21.4, h: 5.4, color: '#e6d9c2', roofColor: '#d8d4cc', rtu: 4 }); // strip (1927)
  box(M('#b5523a'), 46.8, 1.3, 1.3, 164.5, 5.4, 30.2, 0); // red tile mansard band
  glazing(164.5, 30.64, 0, 44, 2.6, 0.3);
  for (const [t, x, c, bg] of [['Pizza Hut', 146.5, '#ffffff', '#c8102e'], ['verizon', 155.5, '#000000', '#ffffff'], ['Couture', 166.5, '#3a2a1e', '#f4ece0'], ['SUBWAY', 176.5, '#ffc20e', '#008c15'], ['COLD STONE', 184.2, '#ffffff', '#5b2a86']]) sign(t, x, 3.6, 30.9, 0, { w: 7.0, h: 0.95, color: c, bg, glow: 0.2 });
  stalls(92, 33.5, 196, 33.5, 1, { depth: 5.2, fill: 0.45 });
  stalls(92, 47, 196, 47, -1, { depth: 5.2, fill: 0.4 });
  bed(88.5, 196, 52.5, 55.5, { trees: 0, shrubs: 10, m: mat.redgravel });
  bldg({ x: 269, z: 19.5, w: 124, d: 16.4, h: 5.2, color: '#ebe2d2', rtu: 6 }); // Buffalo Exchange / Trident Grill block
  sign('BUFFALO EXCHANGE', 226, 3.6, 27.75, 0, { w: 9, h: 0.9, color: '#ffffff', bg: '#1f1f1f', glow: 0.2 });
  sign('TRIDENT GRILL', 287, 3.6, 27.75, 0, { w: 7, h: 0.9, color: '#ffffff', bg: '#1a3d6d', glow: 0.2 });
  flat(mat.asphalt2, 205, 335, 27.8, 55.6, 0.05);

  // ---------------- south of Speedway ----------------
  flat(mat.asphalt2, -200, 41, 97.5, 150, 0.05);
  flat(mat.dirt, -66, -48, 97.5, 139, 0.052);
  // Dirtbags (pub), with its teal-roofed patio wing.
  bldg({ x: -36.3, z: 112.6, w: 21.4, d: 15.8, h: 5.6, color: '#d8cdb8', roofColor: '#cfcac0', rtu: 2 });
  box(M('#2f7f7a'), 9.4, 0.6, 3.6, -28.9, 4.0, 103.2);
  sign('DIRTBAGS', -40.5, 4.0, 104.62, Math.PI, { w: 9, h: 1.2, color: '#ffffff', bg: '#1d1d1b', glow: 0.25 });
  // 7-Eleven (1750).
  bldg({ x: -77.6, z: 127.9, w: 18.2, d: 12.5, h: 5.0, color: '#f2efe8', rtu: 2 });
  glazing(-77.6, 121.6, Math.PI, 12, 2.4, 0.3);
  box(M('#f47b20'), 18.3, 0.35, 0.1, -77.6, 3.6, 121.58);
  box(M('#00843d'), 18.3, 0.35, 0.1, -77.6, 3.95, 121.58);
  box(M('#ee2722'), 18.3, 0.35, 0.1, -77.6, 4.3, 121.58);
  sign('7-ELEVEN', -77.6, 4.0, 121.5, Math.PI, { w: 5, h: 1.0, color: '#00843d', bg: '#ffffff', glow: 0.2 });
  stalls(-86, 116, -69, 116, -1, { depth: 5, fill: 0.5 });
  // Taco Bell (1818) with its drive-thru lane.
  bldg({ x: 2.85, z: 127.35, w: 28.3, d: 11.9, h: 5.4, color: '#e9dfcf', roofColor: '#d8d4cc', rtu: 2 });
  box(M('#6b2c91'), 8, 5.9, 0.4, -6, 2.95, 121.3);
  sign('TACO BELL', -6, 4.2, 121.05, Math.PI, { w: 6.5, h: 1.0, color: '#ffffff', bg: '#6b2c91', glow: 0.3 });
  monument('TACO BELL', 10, 100.5, Math.PI, { w: 3.4, h: 1.8, color: '#ffffff', bg: '#6b2c91', base: '#b9a58a' });
  stalls(-10, 116, 16, 116, -1, { depth: 5, fill: 0.6 });
  flat(mat.asphalt, -14, 20, 134, 139, 0.055);
  // Wendy's (1005 N Campbell) behind it.
  bldg({ x: 15.2, z: 167.7, w: 11.6, d: 25.9, h: 5.2, color: '#d9cdb8', roofColor: '#c9b49a', rtu: 1 });
  sign("Wendy's", 21.1, 3.8, 167.7, Math.PI / 2, { w: 5, h: 1.0, color: '#e2203d', bg: '#ffffff', glow: 0.2, font: 'italic 800 {s}px Georgia, serif' });
  // Strip to the west: Bentley's, The Painted Lady, Kingdom Textbooks, G's Barber Shop, University Postal, Greek House...
  bldg({ x: -154.8, z: 117.6, w: 70.4, d: 30, h: 4.8, color: '#e7dccb', rtu: 6 });
  glazing(-154.8, 102.55, Math.PI, 66, 2.6, 0.3, '#384550');
  for (const [t, x, w] of [["Bentley's Breakfast", -122.9, 6], ['The Painted Lady', -129.2, 6], ['Kingdom Textbooks', -135.3, 5.5], ["G's Barber Shop", -144.3, 6], ['University Postal', -150.3, 5.5], ['Greek House', -165.7, 6], ['Endless Summer Tans', -171.7, 6], ['1702', -182.2, 6]]) sign(t, x, 3.7, 102.45, Math.PI, { w: w * 0.95, h: 0.8, color: '#2a2a2a', bg: '#f6f1e6', glow: 0.15 });
  // SE corner: Aloft Tucson University (1900) and the Campbell pads.
  bldg({ x: 131.3, z: 116.4, w: 64.5, d: 21.4, h: 20, color: '#e9e9e6', roofColor: '#d4d6d8', rtu: 6 });
  bldg({ x: 140.8, z: 102.8, w: 10.7, d: 6, h: 20.6, color: '#3d4a57' });
  bldg({ x: 100, z: 110.7, w: 3, d: 10.3, h: 6, color: '#3d4a57' });
  for (let f = 0; f < 5; f++) glazing(131.3, 105.6, Math.PI, 62, 1.7, 4.0 + f * 3.2, '#405366');
  glazing(118, 105.6, Math.PI, 30, 3.2, 0.3, '#3a4a58');
  sign('aloft', 140.8, 18.2, 99.75, Math.PI, { w: 7, h: 2.0, color: '#ffffff', glow: 0.35, font: '700 {s}px "Helvetica Neue", Arial' });
  sign('WXYZ', 108, 4.0, 105.55, Math.PI, { w: 3.5, h: 0.9, color: '#ffffff', bg: '#7a2a8a', glow: 0.3 });
  flat(mat.asphalt2, 83.4, 200, 97.5, 145, 0.05);
  flat(mat.concrete, 99, 164, 97.5, 105.5, 0.055);
  bldg({ x: 97.2, z: 153.4, w: 17.9, d: 11.1, h: 5, color: '#efe2c8', rtu: 1 }); // Miss Saigon
  sign('MISS SAIGON', 88.15, 3.6, 153.4, -Math.PI / 2, { w: 6, h: 0.9, color: '#b8202a', bg: '#fff6e0', glow: 0.2 });
  bldg({ x: 97.2, z: 173.8, w: 17.9, d: 30, h: 5, color: '#e7ddcc', rtu: 2 });
  sign("BRUEGGER'S BAGELS", 88.15, 3.6, 171, -Math.PI / 2, { w: 8, h: 0.9, color: '#ffffff', bg: '#7a1a1f', glow: 0.2 });

  // ---------------- neighbourhood fill (far context) ----------------
  // Single-storey houses and yards south of the Speedway businesses and east
  // of Norris Ave, as in the satellite; kept clear of the traced lots above.
  {
    const roofs = ['#a8623e', '#7d8a95', '#9a6b4f', '#8b8f93', '#b07a52'];
    const walls = ['#e3d3b8', '#d9c8ad', '#ece7dd', '#c9b08c'];
    const zones = [[-200, 40, 200, 330], [110, 330, 150, 330], [210, 330, -330, -125], [80, 200, -330, -150], [-330, -215, 100, 330], [-330, -215, -330, -80]];
    for (const [x0, x1, z0, z1] of zones) {
      for (let x = x0 + 8; x < x1 - 8; x += 24) {
        for (let z = z0 + 8; z < z1 - 8; z += 26) {
          if (R() < 0.2) continue;
          const k = Math.floor(R() * 5);
          house(x + (R() - 0.5) * 6, z + (R() - 0.5) * 6, 11 + R() * 6, 10 + R() * 5, 0, { roof: roofs[k], wall: walls[k % 4], h: 3.2 });
          if (R() < 0.6) tree(x + 9, z + 9, 0.9 + R() * 0.4, R() < 0.5 ? 'mesquite' : 'ficus');
        }
      }
      for (let z = z0 + 21; z < z1; z += 52) road(x0, z, x1, z, 8, { centre: 'none' });
    }
  }

  // ---------------- traffic ----------------
  for (const [x, z, ry] of [[-120, 61.5, Math.PI], [-60, 65, Math.PI], [-18, 68.4, Math.PI], [24, 61.5, Math.PI], [130, 65, Math.PI], [-150, 82, 0], [-95, 85.6, 0], [-30, 78.8, 0], [110, 85.6, 0], [30, 82, 0], [33, 78.8, 0], [140, 85.6, 0]]) car(x, z, ry);
  for (const [x, z, ry] of [[49.5, -30, -Math.PI / 2], [54.5, 20, -Math.PI / 2], [49.5, 30, -Math.PI / 2], [74, 10, Math.PI / 2], [79, -60, Math.PI / 2], [69, 130, Math.PI / 2], [49, 150, -Math.PI / 2], [74, -120, Math.PI / 2]]) car(x, z, ry);
  // Parallel-parked cars along Helen St.
  for (let x = -110; x < 40; x += 6.5) if (R() < 0.55 && Math.abs(x + 23) > 6 && Math.abs(x + 58) > 7) car(x, -62.8, 0);
  for (let x = -110; x < 40; x += 6.5) if (R() < 0.4 && Math.abs(x + 58) > 7) car(x, -70.6, Math.PI);
}
