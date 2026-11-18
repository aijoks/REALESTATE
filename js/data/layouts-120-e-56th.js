// 120 E 56th St — furnished cut-away layouts (see js/data/furnishings.js for
// the format, js/viewer/floorplan3d.js for `compose`).
//
// What is published (js/data/floorplans.js):
//   - 1960s typical floors 3–9, 10–12 and 13–15 (open shells round the core);
//   - today's 5th-floor plan (front half + core): the common corridor and the
//     front divided into three suites — Suite 510 (the shaded middle strip
//     between the column lines) with a suite either side;
//   - test fits: Suite 740 (rear east quadrant, floor 7: its demising wall on
//     the column line east of the elevators), Suite 900 (front east suite,
//     floor 9: the same demising line as on floor 5) and Suite 1040 (rear
//     east, floor 10: from the elevators to the east wall).
//
// So floors 3–12 are multi-tenant: the 3D shows each as five suites off the
// common corridor — front west / middle (510 line) / front east from the
// 5th-floor plan, rear west / rear east split where 740 (3–9) and 1040
// (10–12) put the demising wall — lightly furnished in proportion to their
// size (a few desks, a table, an office), not as one open office. The
// floor's own test fit, where one was published, is laid into its real place
// and furnished as drawn. Floors 13–15 (one plate under the crown, no suite
// evidence) stay a single, sparsely furnished tenant floor.
//
// Every drawing is placed by matching its walls to the base drawing (exterior
// walls, corridor, stair and restroom walls): the maps below.
import { lin, at, layer, placed, merge } from './compose.js';

const F = (file) => `assets/properties/120-e-56th/plans/${file}.webp`;
const T39 = F('typical-floors-03-09-1960s'); // 1397 × 2000 px: walls x 37–1330 (63'-0"), corridor y 1014–1134, bays to y 1991
const T1012 = F('typical-floors-10-12-1960s'); // 1468 × 2000 px: walls x 62–1353, corridor y 1015–1133, bays to y 1989
const F5 = F('floor-05-suite-510'); // 1998 × 2000 px: walls x 27–1967, corridor y 467–646, bays to y 1969
const S740 = F('floor-07-suite-740'); // 965 × 1547 px: east wall x 943, corridor top y 1118
const S900 = F('floor-09-suite-900'); // 832 × 1602 px: east wall x 810, corridor's south wall y 192, bay front y 1422
const S1040o = F('floor-10-suite-1040-office'); // 1998 × 2000: east wall x 1970, corridor top y 1602, rear wall y 34
const S1040m = F('floor-10-suite-1040-medical'); // 1954 × 2000: east wall x 1927, corridor top y 1610, rear wall y 78

// Drawing → base maps (corridor and exterior walls matched).
const M = {
  f5t39: lin(0.6665, 0.6505, [27, 467], [37, 1014]),
  f5t1012: lin(0.6655, 0.6485, [27, 467], [62, 1015]),
  s740: lin(0.672, 0.672, [943, 1118], [1330, 1014]),
  s900: lin(0.705, 0.697, [810, 192], [1330, 1134]),
  s1040o: lin(0.4177, 0.4177, [1970, 1602], [1353, 1015]),
  s1040m: lin(0.4276, 0.4276, [1927, 1610], [1353, 1015]),
};

// ------------------------------------------------------------ core + front (5th-floor plan, its px)
// Shared by every floor 3–12: the 5th-floor drawing replaces the 1960s core
// and front half (same walls, newer core: mech room, shafts, restrooms).
const core = {
  rooms: [
    ['stone', 320, 467, 1680, 646],
    ['tile', 58, 652, 420, 880], ['tile', 1565, 652, 1940, 880],
    ['stair', 52, 280, 320, 645], ['stair', 1680, 280, 1945, 645],
    ['shaft', 860, 290, 1000, 430], ['shaft', 1030, 290, 1170, 430],
    ['shaft', 665, 35, 785, 305], ['shaft', 805, 45, 1225, 165],
    ['concrete', 430, 90, 650, 455], ['concrete', 670, 330, 780, 455],
    // recess between the street bays: roof of the base
    ['terrace', 440, 1660, 1525, 1975],
  ],
  erase: [
    [835, 525, 1135, 575], [500, 225, 590, 285], [700, 365, 770, 430], [280, 740, 375, 780], [1610, 740, 1680, 780], [780, 1820, 1150, 1885],
    [62, 302, 300, 640], [1700, 302, 1935, 640], [868, 298, 992, 422], [1038, 298, 1162, 422],
  ],
  items: [
    { t: 'elevator', x: 925, y: 452, r: 0, w: 0.9 }, { t: 'elevator', x: 1095, y: 452, r: 0, w: 0.9 },
    { t: 'stair', x: 186, y: 462, r: 0, w: 2.45, d: 3.5, flights: 2 },
    { t: 'stair', x: 1812, y: 462, r: 0, w: 2.45, d: 3.5, flights: 2 },
    { t: 'toilet', x: 112, y: 718, r: 270 }, { t: 'toilet', x: 112, y: 822, r: 270 }, { t: 'vanity', x: 392, y: 800, r: 90, w: 1.0, sinks: 2 },
    { t: 'toilet', x: 1888, y: 718, r: 90 }, { t: 'toilet', x: 1888, y: 822, r: 90 }, { t: 'vanity', x: 1594, y: 800, r: 270, w: 1.0, sinks: 2 },
  ],
};
// Partitions the 5th-floor plan draws as hairlines (too thin to read as
// walls): Suite 510's side walls, the corridor's south wall (doors left
// open) and the recess window wall between the street bays.
const frontInk = (fe = true) => [
  [801, 656, 812, 1650], ...(fe ? [[1170, 656, 1181, 1650]] : []),
  [420, 646, 680, 659], [760, 646, 840, 659], [905, 646, 1170, 659],
  ...(fe ? [[1181, 646, 1215, 659], [1305, 646, 1565, 659]] : []),
  [464, 1652, 1530, 1666],
];
// Front suites, lightly furnished (≈1 desk per 9–10 m²).
const frontWest = {
  items: [
    { t: 'desks', x: 470, y: 1250, r: 0, n: 2, w: 1.4, d: 0.7, double: true },
    { t: 'desk', x: 650, y: 1535, r: 0, w: 1.5, d: 0.75 },
    { t: 'credenza', x: 240, y: 908, r: 0, w: 1.6, d: 0.45 },
    { t: 'confTable', x: 242, y: 1812, r: 0, shape: 'round', w: 1.1, d: 1.1, seats: 4, top: 'oak', a0: 0.785 },
    { t: 'plant', x: 110, y: 960, size: 'tall' },
  ],
};
const suite510 = {
  items: [
    { t: 'desk', x: 990, y: 1535, r: 0, w: 1.5, d: 0.75 },
    { t: 'desk', x: 852, y: 1150, r: 270, w: 1.4, d: 0.7 },
    { t: 'confTable', x: 1040, y: 880, r: 0, shape: 'round', w: 0.9, d: 0.9, seats: 3, top: 'oak', a0: 1.57 },
    { t: 'shelf', x: 1144, y: 1260, r: 90, w: 1.6 },
    { t: 'plant', x: 1120, y: 1600, size: 'small' },
  ],
};
const frontEast = {
  items: [
    { t: 'desks', x: 1560, y: 1250, r: 0, n: 2, w: 1.4, d: 0.7, double: true },
    { t: 'desk', x: 1380, y: 1535, r: 0, w: 1.5, d: 0.75 },
    { t: 'credenza', x: 1760, y: 908, r: 0, w: 1.6, d: 0.45 },
    { t: 'confTable', x: 1737, y: 1812, r: 0, shape: 'round', w: 1.1, d: 1.1, seats: 4, top: 'walnut', a0: 0.785 },
    { t: 'plant', x: 1890, y: 960, size: 'tall' },
  ],
};

// ------------------------------------------------------------ floors 3–9 (typical 3–9 px)
// opts: setback (floors 7–9: rear corner bays are the 7th-floor terraces),
//       f510 (5th floor: Suite 510 marked), fe / re (generic front-east /
//       rear-east suites — off where a test fit takes their place).
function floors39({ setback = false, f510 = false, fe = true, re = true } = {}) {
  const m = M.f5t39;
  const mapped = (f) => placed(m, f);
  const ink = [
    // 1960s rear columns (the 5th-floor drawing stops just short of them)
    [377, 735, 408, 762], [533, 735, 563, 762], [806, 735, 834, 762], [1035, 735, 1064, 762],
    // rear window wall (drawn thin)
    [300, 256, 1035, 271],
    // rear west | rear east demising wall, on the column line (Suite 740)
    [817, 290, 828, 735],
    ...placed(m, { erase: frontInk(fe) }).erase,
    // rear-east suite's corridor wall (door left open)
    ...(re ? [[837, 1006, 885, 1014], [955, 1006, 1139, 1014]] : []),
    // floors 7–9: the setback wall across the corner bays
    ...(setback ? [[62, 258, 300, 272], [1035, 258, 1308, 272]] : [[62, 157, 300, 173], [1035, 157, 1308, 173]]),
  ];
  return merge(
    {
      grid: [1397, 2000],
      base: 'oak',
      compose: { clear: [[0, 726, 1397, 2000]], layers: [{ src: F5, crop: [0, 25, 1998, 2000], at: [...at(m, 0, 25), ...at(m, 1998, 2000)] }], ink },
      rooms: [
        // behind the building (open air above the base) and, from the 7th
        // floor, the rear corner terraces
        ['concrete', 0, -20, 1397, 157], ['concrete', 300, 150, 1035, 256],
        ...(setback ? [['terrace', 62, 157, 300, 258], ['terrace', 1035, 157, 1308, 258]] : []),
      ],
      erase: [[0, 0, 1397, 150], [100, 192, 250, 240], [1115, 192, 1268, 240]],
    },
    mapped(core),
    mapped(frontWest),
    f510 ? { rooms: [['carpetBlue', ...placed(m, { erase: [[808, 652, 1166, 1655]] }).erase[0]]] } : null,
    mapped({ erase: [[812, 660, 1162, 1650]], tags: f510 ? [['510', 1000, 1350, 0.42]] : [] }),
    mapped(suite510),
    fe ? mapped(frontEast) : null,
    // rear west
    {
      items: [
        { t: 'desks', x: 560, y: 520, r: 0, n: 2, w: 1.4, d: 0.7, double: true },
        { t: 'confTable', x: 205, y: 470, r: 90, w: 2.4, d: 1.0, seats: 6 },
        { t: 'desk', x: 690, y: 350, r: 180, w: 1.5, d: 0.75 },
        { t: 'plant', x: 400, y: 305, size: 'tall' },
        { t: 'printer', x: 105, y: 790, r: 270 },
        ...(setback ? [{ t: 'planter', x: 180, y: 182, r: 0, w: 2.6, d: 0.4 }, { t: 'cafeTable', x: 180, y: 228, r: 0.35, chairs: 2, a0: 0, top: 'white' }]
          : [{ t: 'sofa', x: 180, y: 222, r: 0, seats: 3, w: 2.2, fab: 'navy' }]),
      ],
    },
    // rear east (where no test fit is shown)
    re ? {
      items: [
        { t: 'reception', x: 920, y: 845, r: 0, R: 1.0, span: 1.6, deep: 0.55 },
        { t: 'desks', x: 1090, y: 545, r: 0, n: 2, w: 1.4, d: 0.7, double: true },
        { t: 'desk', x: 1180, y: 350, r: 180, w: 1.5, d: 0.75 },
        { t: 'confTable', x: 925, y: 420, r: 0, shape: 'round', w: 1.1, d: 1.1, seats: 4, top: 'oak', a0: 0.785 },
        ...(setback ? [{ t: 'planter', x: 1170, y: 182, r: 0, w: 2.6, d: 0.4 }, { t: 'cafeTable', x: 1170, y: 228, r: 0.35, chairs: 2, a0: 0, top: 'white' }]
          : [{ t: 'sofa', x: 1170, y: 222, r: 0, seats: 3, w: 2.2, fab: 'charcoal' }]),
      ],
    } : null,
  );
}

// Suite 740 test fit (its own px): reception, meeting room, private office,
// seven 24"×48" workstations, server/storage and closet. The test fit draws
// no partitions — none are raised; the rooms are where its labels put them.
const fit740 = {
  rooms: [['carpet', 197, 62, 505, 700], ['carpet', 505, 62, 918, 300], ['stone', 237, 724, 508, 1105], ['concrete', 562, 965, 655, 1105]],
  erase: [[215, 325, 355, 365], [535, 465, 750, 505], [765, 565, 850, 630], [630, 135, 740, 170]],
  tags: [['MEETING RM.', 345, 640, 0.22], ['OFFICE', 860, 95, 0.22], ['WORKSTATIONS (7)', 700, 765, 0.2], ['740', 300, 1065, 0.4]],
  items: [
    { t: 'reception', x: 400, y: 790, r: 0, R: 1.0, span: 1.5, deep: 0.55 },
    { t: 'plant', x: 270, y: 760, size: 'small' },
    { t: 'confTable', x: 350, y: 360, r: 90, w: 2.4, d: 1.0, seats: 6 },
    { t: 'whiteboard', x: 214, y: 360, r: 270, w: 1.6 },
    { t: 'desk', x: 715, y: 165, r: 180, w: 1.6, d: 0.75 },
    { t: 'boardChair', x: 670, y: 262, r: 180 }, { t: 'boardChair', x: 760, y: 262, r: 180 },
    { t: 'credenza', x: 890, y: 165, r: 90, w: 1.4, d: 0.42 },
    // 7 workstations, 24"×48": a bench of 6 and one on the east wall
    { t: 'desks', x: 690, y: 520, r: 90, n: 3, w: 1.22, d: 0.61, double: true },
    { t: 'desk', x: 884, y: 520, r: 90, w: 1.22, d: 0.61 },
    { t: 'lockers', x: 608, y: 1000, r: 0, w: 0.8 },
    { t: 'shelf', x: 790, y: 922, r: 180, w: 1.6 },
  ],
};

// Suite 900 medical test fit (its own px): furnished from the drawing's
// symbols. Its labels stay on the floor.
const fit900 = {
  rooms: [
    ['tile', 560, 425, 775, 615], ['tile', 560, 805, 782, 1110], ['tile', 470, 1145, 782, 1415],
    ['carpet', 86, 815, 400, 1125], ['carpet', 610, 625, 782, 800],
  ],
  tags: [['900', 210, 540, 0.4]],
  items: [
    { t: 'desk', x: 300, y: 312, r: 270, w: 2.3, d: 0.7, ped: false },
    { t: 'shellChair', x: 120, y: 634, r: 270, fab: 'sand' }, { t: 'shellChair', x: 120, y: 708, r: 270, fab: 'sand' },
    { t: 'sideTable', x: 127, y: 771 },
    { t: 'shellChair', x: 213, y: 771, r: 180, fab: 'sand' }, { t: 'shellChair', x: 280, y: 771, r: 180, fab: 'sand' }, { t: 'shellChair', x: 357, y: 771, r: 180, fab: 'sand' },
    { t: 'desk', x: 170, y: 957, r: 0, w: 1.6, d: 0.55 },
    { t: 'boardChair', x: 136, y: 893, r: 0 }, { t: 'boardChair', x: 209, y: 893, r: 0 },
    { t: 'kitchen', x: 739, y: 518, r: 90, w: 1.9, d: 0.6 },
    { t: 'desk', x: 720, y: 730, r: 90, w: 1.5, d: 0.5 },
    { t: 'examTable', x: 750, y: 900, r: 90, w: 1.8 },
    { t: 'kitchen', x: 668, y: 1074, r: 180, w: 2.2, d: 0.55 }, { t: 'stool', x: 600, y: 1010 },
    { t: 'kitchen', x: 682, y: 1158, r: 0, w: 2.0, d: 0.55 }, { t: 'stool', x: 650, y: 1222 },
    { t: 'examTable', x: 555, y: 1385, r: 0, w: 1.9 },
    { t: 'shellChair', x: 730, y: 1355, r: 225, fab: 'sage' },
  ],
};

// ------------------------------------------------------------ floors 10–12 (typical 10–12 px)
function floors1012({ floor = 11, re = true, cols = true } = {}) {
  const m = M.f5t1012;
  const mapped = (f) => placed(m, f);
  const ink = [
    [397, 735, 429, 765], ...(cols ? [[554, 735, 585, 765], [828, 735, 856, 765], [1055, 735, 1084, 765]] : []),
    // rear window wall (a test fit laid in brings its own)
    [62, 362, re ? 1353 : 530, 378],
    // rear west | rear east demising wall (Suite 1040's west wall)
    ...(re ? [[545, 382, 556, 778]] : []),
    ...placed(m, { erase: frontInk() }).erase,
    ...(re ? [[863, 1007, 990, 1015], [1040, 1007, 1162, 1015]] : []),
  ];
  return merge(
    {
      grid: [1468, 2000],
      base: 'oak',
      compose: { clear: [[0, 728, 1468, 2000]], layers: [{ src: F5, crop: [0, 25, 1998, 2000], at: [...at(m, 0, 25), ...at(m, 1998, 2000)] }], ink },
      rooms: [['concrete', 0, -20, 1468, 262], ['terrace', 62, 262, 1353, 362]],
      erase: [[0, 0, 1468, 340]],
    },
    mapped(core),
    mapped({ erase: [[812, 660, 1162, 1650]] }),
    mapped(frontWest), mapped(suite510), mapped(frontEast),
    {
      items: [
        { t: 'confTable', x: 215, y: 560, r: 90, w: 2.4, d: 1.0, seats: 6 },
        { t: 'desk', x: 420, y: 435, r: 180, w: 1.5, d: 0.75 },
        { t: 'desks', x: 410, y: 640, r: 0, n: 1, w: 1.4, d: 0.7, double: true },
        { t: 'plant', x: 110, y: 420, size: 'tall' },
      ],
    },
    re ? {
      items: [
        { t: 'reception', x: 1015, y: 850, r: 0, R: 1.0, span: 1.6, deep: 0.55 },
        { t: 'confTable', x: 715, y: 545, r: 0, w: 2.4, d: 1.0, seats: 6 },
        { t: 'desks', x: 1110, y: 560, r: 0, n: 2, w: 1.4, d: 0.7, double: true },
        { t: 'desk', x: 1250, y: 435, r: 180, w: 1.5, d: 0.75 },
        { t: 'plant', x: 1300, y: 640, size: 'tall' },
      ],
    } : null,
    // 10th floor: the rear terrace; 12th floor: the street terrace
    floor === 10 ? {
      items: [
        { t: 'planter', x: 360, y: 285, r: 0, w: 3.2, d: 0.45 }, { t: 'planter', x: 1060, y: 285, r: 0, w: 3.2, d: 0.45 },
        { t: 'cafeTable', x: 707, y: 320, r: 0.35, chairs: 2, a0: 0, top: 'white' },
      ],
    } : null,
    floor === 12 ? {
      items: [
        { t: 'planter', x: 707, y: 1972, r: 0, w: 5.0, d: 0.45 },
        { t: 'cafeTable', x: 560, y: 1880, r: 0.4, chairs: 4, top: 'white' }, { t: 'cafeTable', x: 855, y: 1880, r: 0.4, chairs: 4, top: 'white' },
      ],
    } : null,
  );
}

// Suite 1040 test fit 1 (office): three meeting rooms on the windows,
// pantry, reception, private office, waiting area.
const side4 = (x, y, dx) => [{ t: 'boardChair', x: x - dx, y: y - 45, r: 270 }, { t: 'boardChair', x: x - dx, y: y + 45, r: 270 }, { t: 'boardChair', x: x + dx, y: y - 45, r: 90 }, { t: 'boardChair', x: x + dx, y: y + 45, r: 90 }];
const fit1040o = {
  rooms: [['carpet', 62, 130, 555, 590], ['carpet', 700, 130, 1270, 590], ['carpet', 1415, 130, 1910, 590], ['tile', 62, 600, 520, 880]],
  erase: [[285, 290, 475, 325], [1520, 290, 1705, 325]],
  tags: [['1040', 1180, 1380, 0.4]],
  items: [
    { t: 'confTable', x: 358, y: 342, r: 0, w: 1.5, d: 1.2, seats: 4, ends: 0 }, ...side4(358, 342, 175),
    { t: 'confTable', x: 1590, y: 382, r: 0, w: 1.5, d: 1.2, seats: 4, ends: 0 }, ...side4(1590, 382, 170),
    ...[840, 936, 1032, 1128].map((x) => ({ t: 'shellChair', x, y: 232, r: 0, fab: 'navy' })),
    { t: 'shellChair', x: 1212, y: 342, r: 90, fab: 'navy' }, { t: 'shellChair', x: 1212, y: 432, r: 90, fab: 'navy' },
    ...[920, 1016, 1112].map((x) => ({ t: 'shellChair', x, y: 528, r: 180, fab: 'navy' })),
    { t: 'tv', x: 960, y: 155, r: 0, w: 1.4 },
    { t: 'kitchen', x: 300, y: 838, r: 180, w: 2.6, d: 0.6, fridge: 'right' },
    { t: 'desk', x: 1060, y: 1045, r: 180, w: 2.4, d: 0.8 },
    { t: 'desk', x: 1845, y: 788, r: 90, w: 1.6, d: 0.7 },
    ...[1186, 1296, 1407].map((y) => ({ t: 'shellChair', x: 878, y, r: 270, fab: 'sand' })),
    { t: 'sideTable', x: 886, y: 1507 }, { t: 'shellChair', x: 1010, y: 1514, r: 180, fab: 'sand' },
    { t: 'sofa', x: 1686, y: 1075, r: 0, seats: 2, w: 1.7, d: 0.8, fab: 'charcoal' },
    { t: 'credenza', x: 1665, y: 1270, r: 180, w: 1.6, d: 0.4 },
  ],
};
// Suite 1040 test fit 2 (medical): two consultation rooms and three exam
// rooms on the windows, a fourth exam room, pantry, reception, waiting.
const fit1040m = {
  rooms: [['carpet', 62, 90, 420, 580], ['tile', 445, 90, 1490, 580], ['carpet', 1500, 90, 1870, 580], ['tile', 1545, 785, 1870, 1310], ['tile', 62, 600, 520, 900]],
  erase: [[0, 0, 1954, 70], [95, 315, 290, 375], [1645, 320, 1830, 380], [62, 330, 92, 420], [1530, 722, 1880, 768], [1470, 930, 1515, 1130]],
  tags: [['1040', 1060, 1460, 0.4]],
  items: [
    { t: 'desk', x: 180, y: 335, r: 180, w: 1.5, d: 0.6 }, { t: 'boardChair', x: 110, y: 445, r: 180 }, { t: 'boardChair', x: 245, y: 445, r: 180 },
    { t: 'desk', x: 1755, y: 345, r: 180, w: 1.5, d: 0.6 }, { t: 'boardChair', x: 1700, y: 455, r: 180 }, { t: 'boardChair', x: 1815, y: 455, r: 180 },
    { t: 'examTable', x: 640, y: 225, r: 0, w: 1.8 }, { t: 'kitchen', x: 492, y: 440, r: 270, w: 1.25, d: 0.45 }, { t: 'stool', x: 570, y: 412 },
    { t: 'examTable', x: 940, y: 225, r: 0, w: 1.8 }, { t: 'kitchen', x: 1082, y: 440, r: 90, w: 1.25, d: 0.45 }, { t: 'stool', x: 1020, y: 412 },
    { t: 'examTable', x: 1330, y: 265, r: 0, w: 1.8 }, { t: 'kitchen', x: 1195, y: 440, r: 270, w: 1.25, d: 0.45 }, { t: 'stool', x: 1256, y: 412 },
    { t: 'examTable', x: 1585, y: 1170, r: 90, w: 1.8 }, { t: 'kitchen', x: 1823, y: 900, r: 90, w: 1.2, d: 0.45 }, { t: 'stool', x: 1756, y: 950 },
    { t: 'shellChair', x: 1730, y: 1250, r: 225, fab: 'sage' },
    { t: 'kitchen', x: 295, y: 862, r: 180, w: 2.6, d: 0.6, fridge: 'right' },
    ...[1020, 1130, 1230, 1420, 1520].map((y) => ({ t: 'shellChair', x: 870, y, r: 270, fab: 'sand' })),
    { t: 'sideTable', x: 870, y: 1322 },
    { t: 'desk', x: 1240, y: 1145, r: 270, w: 1.9, d: 0.75, ped: false },
    { t: 'printer', x: 1385, y: 1525, r: 0 },
  ],
};

export const layouts120e56 = {
  '120-e-56th/floors-3-6': floors39(),
  '120-e-56th/floor-5': floors39({ f510: true }),
  '120-e-56th/floor-5-suite-510': merge(floors39({ f510: true }), { focus: [300, 1000, 1060, 1991] }),
  '120-e-56th/floors-7-9': floors39({ setback: true }),
  '120-e-56th/floor-7-suite-740': merge(
    { focus: [812, 250, 1340, 1140] },
    floors39({ setback: true, re: false }),
    { compose: { layers: [layer(S740, M.s740, [175, 0, 965, 1300], [812, 250, 1346, 1137])] } },
    placed(M.s740, fit740),
  ),
  '120-e-56th/floor-9-suite-900': merge(
    { focus: [773, 1129, 1340, 2000] },
    floors39({ setback: true, fe: false }),
    { compose: { layers: [layer(S900, M.s900, [20, 185, 832, 1450], [773, 1129, 1346, 2011])] } },
    placed(M.s900, fit900),
  ),
  '120-e-56th/floor-10': floors1012({ floor: 10 }),
  '120-e-56th/floor-11': floors1012({ floor: 11 }),
  '120-e-56th/floor-12': floors1012({ floor: 12 }),
  '120-e-56th/floor-10-suite-1040-office': merge(
    { focus: [528, 340, 1360, 1019] },
    floors1012({ floor: 10, re: false, cols: false }),
    { compose: { layers: [{ ...layer(S1040o, M.s1040o, [0, 0, 1998, 1610], [528, 340, 1366, 1019]), bold: 1 }] } },
    placed(M.s1040o, fit1040o),
  ),
  '120-e-56th/floor-10-suite-1040-medical': merge(
    { focus: [528, 340, 1360, 1019] },
    floors1012({ floor: 10, re: false, cols: false }),
    { compose: { layers: [{ ...layer(S1040m, M.s1040m, [0, 60, 1954, 1618], [528, 340, 1366, 1019]), bold: 1 }] } },
    placed(M.s1040m, fit1040m),
  ),
};
