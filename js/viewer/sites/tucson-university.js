// Real surroundings for site 'tucson-university' (traced from satellite imagery / OSM).
// Called at the end of buildSuburban. ctx: { THREE, scene, add, flat, box, W, D, front, site, r, mats }
// Coordinates: building centred at origin, +z = the building's street front, metres.
//
// The Link at 4th Ave, 415 E University Blvd. The model frame is the whole
// parcel (90 x 120 m): +z = south onto University Blvd, +x = east. 4th Ave
// (with the Sun Link streetcar curving in from University) runs along the
// west side; E 2nd St to the north; bungalows of West University around it.
// South across University: Trinity Presbyterian Church, a 4-storey block and
// Time Market (444 E University); SW corner: Cafe Maggie.
import { desertKit, arrow } from './tucson-snyder.js';

export function site_tucson_university(ctx) {
  const K = desertKit(ctx, { seed: 415 });
  const { mat, flat, road, rails, stalls, pole, tree, palm, bed, bldg, sign, monument, house, box, M, strip, wallRun, glazing } = K;
  // ground: city lots are dirt/gravel yards rather than open desert
  flat(M('#c2ab88', { roughness: 1 }), -400, 400, -400, 400, 0.02);

  // ---- streets ----
  road(-400, 70, -66.5, 70, 12.6, { walk: 3.5, centre: 'double' }); // University Blvd west of 4th
  road(-48.4, 70, 400, 70, 12.6, { walk: 3.5, centre: 'double' }); // University Blvd east of 4th
  road(-57.5, 63.4, -57.5, -400, 17.7, { walk: 3.2, lanes: [-4.4, 4.4] }); // 4th Ave north
  road(-57.5, 76.7, -57.5, 400, 17.7, { walk: 3.2, lanes: [] }); // 4th Ave south
  flat(mat.road, -66.5, -48.4, 63.4, 76.7, 0.046);
  for (const [ax, az, bx, bz] of [[-66, 62, -49, 62], [-66, 78, -49, 78], [-68, 64, -68, 76], [-47, 64, -47, 76]]) {
    const len = Math.hypot(bx - ax, bz - az);
    for (let t = 0; t < len; t += 0.9) strip(mat.white, ax + (bx - ax) * t / len, az + (bz - az) * t / len, ax + (bx - ax) * (t + 0.45) / len, az + (bz - az) * (t + 0.45) / len, 2.6, 0.07);
  }
  road(-400, -72, 400, -72, 8.8, { walk: 2, centre: 'none' }); // E 2nd St
  road(88, 63.4, 88, -400, 10, { walk: 2, centre: 'none' }); // N 5th Ave
  road(88, 76.7, 88, 400, 10, { walk: 2, centre: 'none' });
  road(-129.5, 63.4, -129.5, -400, 8, { walk: 2, centre: 'none' }); // N 3rd Ave
  road(-129.5, 76.7, -129.5, 400, 8, { walk: 2, centre: 'none' });
  road(-400, 215, 400, 215, 9, { walk: 2, centre: 'none' }); // E 1st St (south)
  // Sun Link streetcar: along University (both directions) and curving south onto 4th Ave.
  for (const [zc, xc] of [[66.8, -54.5], [73.2, -60.5]]) {
    rails(400, zc, -40, zc);
    const R = -40 - xc, cx = -40, cz = zc + R; // quarter circle from (-40, zc) to (xc, zc + R)
    let px = -40, pz = zc;
    for (let k = 1; k <= 8; k++) {
      const a = (k / 8) * (Math.PI / 2);
      const nx = cx - Math.sin(a) * R, nz = cz - Math.cos(a) * R;
      rails(px, pz, nx, nz);
      px = nx; pz = nz;
    }
    rails(xc, zc + R, xc, 400);
  }
  // University/3rd Ave streetcar stop (canopies on the median platform).
  for (const x of [57, 63]) {
    box(M('#cfd2d4'), 0.2, 3, 0.2, x, 1.5, 70);
    box(M('#7a8c99', { metalness: 0.4, roughness: 0.4 }), 4.5, 0.15, 2.2, x, 3.05, 70);
  }
  box(mat.concrete, 14, 0.25, 2.6, 60, 0.12, 70, 0, false);

  // ---- The Link parking lot (east half of the parcel) ----
  flat(mat.asphalt, -8.7, 32, -60, 57.5, 0.05);
  flat(mat.asphalt, 32, 44.8, -16, 28, 0.05); // east bump between the bungalow yards
  flat(mat.asphalt, 16.5, 23.5, 57.5, 63.6, 0.05); // driveway
  stalls(-3.2, -58, -3.2, -12.5, 1, { depth: 5.5, fill: 0.7 });
  stalls(-3.2, -12.5, -3.2, 17, 1, { depth: 5.5, fill: 0 }); // kept clear: view into the pool courtyard
  stalls(-3.2, 17, -3.2, 54, 1, { depth: 5.5, fill: 0.7, ada: 2 });
  stalls(9.3, -50, 9.3, 34, 1, { depth: 5.5, fill: 0.6 });
  stalls(9.3, -50, 9.3, 34, -1, { depth: 5.5, fill: 0.55 });
  bed(3.8, 14.8, -53, -50, { trees: 1, kind: 'ficus' });
  bed(3.8, 14.8, 34, 37, { trees: 1, kind: 'ficus' });
  stalls(21.8, -54, 21.8, 52, -1, { depth: 5.5, fill: 0.5 });
  stalls(33, -14, 33, 26, 1, { depth: 5.5, fill: 0.45 });
  stalls(44.8, -14, 44.8, 26, 1, { depth: 5.5, fill: 0.45 });
  stalls(-1, -60, 21, -60, -1, { depth: 5.5, fill: 0.4 });
  for (const [x, z] of [[9.3, -10], [9.3, 20], [27.4, 10], [-3, -30]]) pole(x, z, { h: 8, arms: 2, ry: 0 });
  arrow(ctx, K, 20, 50, Math.PI / 2);
  // Black steel fence + gate along University (sign photo), brick planter beds.
  const steel = M('#1d1f21', { roughness: 0.5, metalness: 0.6 });
  const fenceRun = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az);
    const ry = -Math.atan2(bz - az, bx - ax);
    box(steel, len, 0.06, 0.06, (ax + bx) / 2, 1.75, (az + bz) / 2, ry, false);
    box(steel, len, 0.06, 0.06, (ax + bx) / 2, 0.2, (az + bz) / 2, ry, false);
    for (let t = 0; t <= len; t += 0.4) box(steel, 0.04, 1.8, 0.04, ax + (bx - ax) * t / len, 0.9, az + (bz - az) * t / len, 0, false);
  };
  fenceRun(-8.5, 57.6, 8.5, 57.6);
  fenceRun(24, 57.6, 32, 57.6);
  fenceRun(32, 57.6, 32, 28);
  fenceRun(32, 28, 44.8, 28);
  fenceRun(44.8, 28, 44.8, -16);
  fenceRun(44.8, -16, 32, -16);
  fenceRun(32, -16, 32, -60);
  for (const x of [8.5, 16.6, 23.4, 24]) box(M('#9a5a44'), 0.5, 2, 0.5, x, 1, 57.6);
  // Landscaping strip and street trees along University.
  bed(-48, -9, 56.5, 60.3, { shrubs: 10, m: mat.redgravel });
  bed(-8.5, 16, 57.8, 60.3, { shrubs: 6, m: mat.redgravel });
  bed(24, 32, 57.8, 60.3, { shrubs: 3, m: mat.redgravel });
  for (const [x, z, h] of [[-44, 59, 13], [-26, 59, 12], [30, 59.3, 14], [27, 59.3, 12]]) palm(x, z, h);
  // 4th Ave side: gravel yard with palms between the blocks and the sidewalk.
  bed(-48.2, -45.2, -58, 55, { m: mat.gravel });
  // North edge: block wall to the alley along E 2nd St.
  wallRun(-46, -61, 32, -61, 1.8, '#cbb89a');
  bed(-46, 32, -67, -61.3, { trees: 0, shrubs: 8, m: mat.gravel });
  for (const x of [-30, 0, 30]) tree(x, -64, 1.0, 'mesquite');

  // ---- south of University: Trinity Presbyterian Church ----
  bldg({ x: -1.9, z: 110.5, w: 20.2, d: 40.4, h: 11, color: '#e8e2d8', roofColor: '#9ea8b3', rtu: 3 });
  bldg({ x: -15.2, z: 133.8, w: 51.8, d: 16.4, h: 7.5, color: '#efe6d6', roof: 'gable', roofColor: '#b5523a', rise: 4.5, eave: 0.6 });
  bldg({ x: -27.2, z: 107.2, w: 30.2, d: 34.4, h: 6.5, color: '#efe6d6', roofColor: '#c9ccd0', rtu: 2 });
  bldg({ x: -28.4, z: 171, w: 25.2, d: 58, h: 4.5, color: '#efe6d6', roofColor: '#c9ccd0', rtu: 2 });
  flat(mat.asphalt2, -10.7, 17, 144, 181, 0.045);
  stalls(-8, 150, 15, 150, -1, { depth: 5, fill: 0.3 });
  monument('TRINITY PRESBYTERIAN', -22, 84.5, Math.PI, { w: 4.6, h: 1.3, bg: '#f2ead8', color: '#5b2a1e', base: '#9a5a44', sub: 'CHURCH', font: '700 {s}px Georgia, serif' });
  for (const [x, z] of [[-40, 85], [-5, 85], [10, 88]]) tree(x, z, 1.1, 'ficus');
  // Mid-rise block on the SE corner of University & the church lot.
  bldg({ x: 38.5, z: 103.5, w: 25.2, d: 41.7, h: 13.6, color: '#f0f0ee', rtu: 6, roofColor: '#e8e8e6' });
  for (let f = 0; f < 4; f++) glazing(38.5, 82.6, Math.PI, 22, 1.4, 1.0 + f * 3.3, '#2f3a44');
  // Time Market (444 E University Blvd).
  bldg({ x: 68, z: 95, w: 16.9, d: 25.8, h: 5.2, color: '#f2efe8', rtu: 2 });
  glazing(68, 82.05, Math.PI, 10, 2.4, 0.3);
  sign('TIME MARKET', 68, 4.3, 82.0, Math.PI, { w: 9, h: 1.0, color: '#7a1f1a', bg: '#f4e7c9', glow: 0.1 });
  flat(mat.asphalt2, 52, 82, 110, 135, 0.045);
  // Cafe Maggie and its neighbour, SW corner of University & 4th Ave.
  bldg({ x: -78.5, z: 90.3, w: 18.5, d: 15.2, h: 7.0, color: '#f3f1ec', rtu: 1 });
  sign('CAFE MAGGIE', -69.2, 4.6, 90.3, Math.PI / 2, { w: 5, h: 0.9, color: '#3b5b3a', bg: '#f6f0e0', glow: 0.1 });
  glazing(-69.18, 90.3, Math.PI / 2, 8, 2.4, 0.3);
  bldg({ x: -77, z: 111, w: 16, d: 17, h: 6.0, color: '#ece9e2', rtu: 1 });
  bldg({ x: -147, z: 115, w: 25, d: 51, h: 7.5, color: '#f1f1ef', rtu: 4 }); // large white building west of 3rd Ave
  bldg({ x: -90, z: 158, w: 41, d: 23, h: 5.5, color: '#efede6', rtu: 2 });
  flat(mat.asphalt2, -118, -70, 127, 150, 0.045);
  // Tucson Bird Alliance Nature Shop (300 E University Blvd, OSM).
  bldg({ x: -176, z: 96, w: 16, d: 14, h: 5, color: '#e9dfcc', roof: 'hip', roofColor: '#9c5a3a', rise: 2.4 });
  sign('TUCSON BIRD ALLIANCE', -176, 3.6, 88.9, Math.PI, { w: 7, h: 0.9, color: '#ffffff', bg: '#3c6e47', sub: 'NATURE SHOP', glow: 0.15 });

  // ---- West University bungalows ----
  const roofs = ['#8b8f93', '#7b8085', '#a8623e', '#6d7a86', '#9a6b4f', '#7d8a95'];
  const walls = ['#e6dccb', '#d9c8ad', '#ece7dd', '#c9b08c', '#e0d2bc'];
  let k = 0;
  const bung = (px0, px1, py0, py1, ry = 0) => {
    const x0 = (px0 - 632.5) * 0.2526, x1 = (px1 - 632.5) * 0.2526, z0 = (py0 - 362.5) * 0.2526, z1 = (py1 - 362.5) * 0.2526;
    k++;
    house((x0 + x1) / 2, (z0 + z1) / 2, x1 - x0, z1 - z0, ry, { roof: roofs[k % roofs.length], wall: walls[k % walls.length], h: k % 4 ? 3.4 : 5.8 });
  };
  // NW block (west of 4th, north of University)
  for (const b of [[135, 195, 440, 578], [220, 258, 485, 572], [285, 340, 510, 570], [305, 350, 445, 500], [262, 322, 297, 345], [135, 190, 357, 435], [135, 200, 205, 270], [265, 320, 212, 275], [240, 325, 135, 185], [20, 90, 440, 520], [10, 70, 300, 360], [40, 100, 140, 200]]) bung(...b);
  // NE: east of the lot, then east of 5th Ave
  for (const b of [[765, 815, 488, 572], [820, 862, 483, 565], [873, 920, 490, 565], [845, 910, 275, 350], [765, 805, 140, 215], [820, 860, 145, 200], [875, 915, 135, 205], [1045, 1110, 480, 560], [1128, 1172, 450, 560], [1185, 1235, 480, 565], [1045, 1110, 355, 405], [1185, 1245, 330, 410], [1030, 1090, 125, 210], [1120, 1165, 140, 210], [1180, 1240, 130, 205], [1045, 1100, 290, 345]]) bung(...b);
  bldg({ x: (880 - 632.5) * 0.2526, z: 9, w: 20, d: 11, h: 6, color: '#8a5a3c', roof: 'flat', roofColor: '#6f4a33' }); // brick fourplex
  // North of E 2nd St
  for (const b of [[445, 530, 0, 50], [560, 640, 0, 45], [705, 760, 0, 45], [890, 950, 0, 45], [150, 230, 0, 45], [1020, 1090, 0, 45]]) bung(...b);
  // SE blocks (east of Time Market)
  for (const b of [[1050, 1100, 700, 800], [1105, 1150, 715, 800], [1155, 1200, 720, 800], [1200, 1250, 720, 830], [1045, 1135, 870, 920], [1145, 1225, 880, 935], [1045, 1115, 940, 985], [1040, 1100, 1060, 1130], [1120, 1170, 1090, 1150], [1190, 1240, 1090, 1150], [840, 910, 945, 1000], [860, 920, 1060, 1150]]) bung(...b);
  // SW blocks (west of 4th south of the cafe)
  for (const b of [[140, 185, 1080, 1160], [200, 250, 1060, 1160], [295, 345, 1090, 1150], [20, 100, 1090, 1150], [140, 240, 1040, 1080]]) bung(...b);
  // Yard trees and palms through the neighbourhood.
  const R = K.r;
  for (let i = 0; i < 40; i++) {
    const x = -150 + R() * 300, z = -150 + R() * 340;
    const inLot = x > -50 && x < 47 && z > -62 && z < 64;
    const nearCam = Math.hypot(x - 55, z) < 8 || Math.hypot(x - 41, z + 96) < 8 || Math.hypot(x, z + 115) < 8 || Math.hypot(x - 2, z - 6) < 4;
    if (nearCam) continue;
    const onRoad = Math.abs(z - 70) < 14 || Math.abs(x + 57.5) < 12 || Math.abs(z + 72) < 7 || Math.abs(x - 88) < 8 || Math.abs(x + 129.5) < 7;
    const inChurch = x > -45 && x < 55 && z > 78 && z < 205;
    if (inLot || onRoad || inChurch) continue;
    if (R() < 0.3) palm(x, z, 11 + R() * 5); else tree(x, z, 0.9 + R() * 0.5, R() < 0.5 ? 'ficus' : 'mesquite');
  }
}
