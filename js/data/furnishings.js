// Furnishings for the 3D cut-away floor plans (see js/viewer/floorplan3d.js
// and js/viewer/furniture.js), keyed by the plan's src in floorplans.js.
//
// Coordinates are in the ORIGINAL plan image (the same system as model3d.box),
// measured on a `grid` of [GW, GH] units across the whole image — i.e. the
// fraction is x / GW, y / GH (grids are the image's size or a scaled view of it).
//
//   base  : floor finish everywhere inside the footprint
//   rooms : [finish, x0, y0, x1, y1, ('x' | 'y' plank direction on screen)]
//           finishes: oak, oakDark, carpet, carpetBlue, tile, stone,
//           concrete, terrace, shaft, stair
//   erase : [x0, y0, x1, y1] — text labels and flat furniture symbols painted
//           out of the drawing (the 3D items replace them)
//   tags  : [text, x, y, size m] — small room numbers painted on the floor
//   items : { t: type, x, y, r, ...params } — r = degrees CLOCKWISE in the
//           drawing; r = 0 means the item's front (seat / user side) faces DOWN
//           the drawing. Sizes are in metres. Types: see js/viewer/furniture.js,
//           plus `office` = { box: [x0, y0, x1, y1], desks, wall, layout } which
//           lays out desks for a room from its desk count.
//   wallH : height of the raised walls (m)

const F = (id, file) => `assets/properties/${id}/plans/${file}.webp`;

// Number-plate rectangles to erase, around label centres (grid units).
const box = (x, y, hw = 34, hh = 16) => [x - hw, y - hh, x + hw, y + hh];

export const furnishings = {
  // ------------------------------------------------------------------ 115 E 23rd St, 4th floor
  // Coworking floor: offices 401–420 (desk counts from the drawing's legend:
  // dark 1–2, green 2–3, magenta 3–4, blue 4–5, gold 6–8).
  [F('115-e-23rd', 'floor-04')]: {
    grid: [2000, 1333],
    base: 'oak',
    rooms: [
      // offices (carpet tile)
      ['carpet', 95, 90, 262, 250], ['carpet', 265, 90, 485, 245], ['carpet', 65, 262, 262, 555], ['carpet', 65, 560, 262, 805],
      ['carpet', 90, 808, 262, 1190], ['carpet', 262, 1005, 370, 1190], ['carpet', 370, 1005, 515, 1190],
      ['carpet', 362, 332, 550, 548], ['carpet', 362, 552, 550, 672], ['carpet', 362, 676, 520, 908], ['carpet', 520, 676, 700, 908],
      ['carpet', 790, 1010, 1830, 1190], ['carpet', 1665, 480, 1850, 1190],
      ['carpet', 1118, 425, 1402, 725], ['carpet', 1398, 575, 1590, 725], ['carpet', 1318, 730, 1590, 935],
      // meeting rooms
      ['carpetBlue', 788, 330, 1115, 545], ['carpetBlue', 552, 435, 785, 672],
      // reception / elevator lobby
      ['stone', 490, 245, 830, 432],
      // kitchen & restrooms
      ['tile', 1400, 245, 1860, 485], ['tile', 1120, 85, 1520, 248], ['tile', 1118, 330, 1402, 425],
      // elevator shafts, stairs
      ['shaft', 503, 93, 637, 234], ['shaft', 665, 93, 799, 234], ['shaft', 533, 1018, 672, 1170],
      ['stair', 882, 92, 1103, 236], ['stair', 1545, 92, 1847, 236],
    ],
    erase: [
      // labels
      [1530, 312, 1665, 348], [865, 415, 1065, 485], [575, 528, 770, 596], [965, 825, 1162, 860], [712, 1078, 762, 1106],
      // phone booths (outlines + TEL)
      [798, 550, 1106, 625],
      // lounge: plants, sofa, rug, high table
      [783, 636, 845, 694], [1066, 638, 1122, 694], [781, 736, 854, 930], [858, 736, 968, 930], [1166, 772, 1300, 892],
      // kitchen: café tables, counter
      [1462, 362, 1592, 494], [1695, 336, 1822, 460], [1516, 246, 1754, 294],
      // reception desk
      [586, 302, 760, 428],
      // drawn desks in 403 / 404
      [72, 568, 258, 662], [72, 712, 162, 802], [92, 812, 182, 898],
      // elevators (X + labels), stairs
      [503, 93, 637, 234], [665, 93, 799, 234], [533, 1018, 672, 1170], [884, 92, 1100, 234], [1548, 92, 1844, 234],
      // restroom fixtures
      [1126, 92, 1180, 145], [1212, 92, 1258, 128], [1414, 92, 1460, 140], [1485, 92, 1518, 135], [1283, 92, 1400, 150],
      [1122, 360, 1150, 400], [1196, 360, 1310, 400], [1365, 360, 1398, 400],
      // the chair drawn by the column in 411
      [1782, 682, 1822, 772],
      // room numbers (redrawn small as tags)
      box(167, 168), box(378, 169), box(167, 433), box(457, 440), box(468, 612), box(163, 688), box(439, 791), box(613, 791),
      box(166, 946), box(447, 1095), box(879, 1095), box(1076, 1095), box(1288, 1095), box(1464, 1095), box(1599, 1095),
      box(1766, 1064), box(1759, 838), box(1771, 661), box(1761, 538), box(1260, 570), box(1492, 653), box(1449, 833),
    ],
    tags: [
      ['402', 230, 230], ['401', 300, 222], ['402', 230, 300], ['420', 385, 520], ['419', 385, 650], ['403', 240, 690], ['418', 440, 885], ['417', 615, 885],
      ['404', 240, 980], ['404', 395, 1030], ['405', 820, 1035], ['406', 1000, 1035], ['407', 1215, 1035], ['408', 1420, 1035], ['409', 1555, 1035],
      ['410', 1700, 975], ['411', 1700, 900], ['412', 1700, 710], ['413', 1700, 570], ['414', 1375, 450], ['415', 1560, 600], ['416', 1345, 915],
    ],
    items: [
      // --- offices
      { t: 'office', box: [95, 92, 262, 248], desks: 2, wall: 'left' },
      { t: 'office', box: [268, 92, 482, 245], desks: 2, wall: 'top' },
      { t: 'office', box: [70, 265, 262, 555], desks: 4, layout: 'bench' },
      // 403: desks as drawn
      { t: 'desk', x: 115, y: 598, r: 0, w: 1.2, d: 0.6 }, { t: 'desk', x: 210, y: 598, r: 0, w: 1.2, d: 0.6 },
      { t: 'desk', x: 115, y: 775, r: 180, w: 1.2, d: 0.6 },
      // 404: drawn desk + bench in the long room + two desks in the side room
      { t: 'desk', x: 137, y: 840, r: 0, w: 1.2, d: 0.6 },
      { t: 'office', box: [100, 920, 262, 1180], desks: 4, layout: 'bench', axis: 'y' },
      { t: 'office', box: [375, 1012, 512, 1180], desks: 2, wall: 'bottom' },
      { t: 'office', box: [798, 1015, 965, 1180], desks: 2, wall: 'bottom' },
      { t: 'office', box: [978, 1015, 1180, 1180], desks: 3, wall: 'bottom' },
      { t: 'office', box: [1192, 1015, 1388, 1180], desks: 3, wall: 'bottom' },
      { t: 'office', box: [1402, 1015, 1528, 1180], desks: 1, wall: 'bottom' },
      { t: 'office', box: [1538, 1015, 1663, 1180], desks: 1, wall: 'bottom' },
      { t: 'office', box: [1672, 955, 1845, 1180], desks: 4, layout: 'bench', axis: 'y' },
      { t: 'office', box: [1672, 742, 1780, 942], desks: 2, wall: 'right', w: 1.3 },
      { t: 'office', box: [1672, 602, 1845, 728], desks: 2, wall: 'right' },
      { t: 'office', box: [1672, 488, 1845, 590], desks: 1, wall: 'right' },
      { t: 'office', box: [1125, 432, 1398, 718], desks: 6, layout: 'bench', axis: 'y' },
      { t: 'office', box: [1405, 582, 1582, 718], desks: 2, wall: 'bottom' },
      { t: 'office', box: [1325, 738, 1582, 928], desks: 4, layout: 'bench' },
      { t: 'office', box: [525, 682, 698, 902], desks: 4, layout: 'bench', axis: 'y' },
      { t: 'office', box: [370, 692, 515, 902], desks: 3, wall: 'left' },
      { t: 'office', box: [368, 558, 545, 668], desks: 1, wall: 'top' },
      { t: 'office', box: [368, 338, 545, 545], desks: 4, layout: 'bench', axis: 'y' },

      // --- reception (curved desk facing the elevator lobby)
      { t: 'reception', x: 672, y: 398, r: 180, R: 1.28, span: 2.3, deep: 0.55 },
      { t: 'plant', x: 525, y: 300, size: 'tall' },
      // --- elevators, stairs
      { t: 'elevator', x: 570, y: 243, r: 0, w: 1.15 }, { t: 'elevator', x: 733, y: 243, r: 0, w: 1.15 },
      { t: 'elevator', x: 603, y: 1008, r: 180, w: 1.3 },
      { t: 'stair', x: 990, y: 163, r: 90, w: 2.0, d: 3.1, flights: 2 },
      { t: 'stair', x: 1697, y: 163, r: 90, w: 2.0, d: 4.2, flights: 2 },

      // --- conference room: 8-seat table + screen on the end wall
      { t: 'confTable', x: 965, y: 438, r: 0, w: 2.9, d: 1.15, seats: 8, ends: 1 },
      { t: 'tv', x: 1095, y: 438, r: 90, w: 1.5, console: false },
      { t: 'credenza', x: 830, y: 438, r: 270, w: 1.6, d: 0.42 },
      // --- conference & podcast: table with mics, acoustic panels, screen
      { t: 'confTable', x: 670, y: 560, r: 90, w: 1.9, d: 1.0, seats: 6, top: 'oak', fab: 'navy', ends: 0 },
      { t: 'mic', x: 640, y: 525, r: 270 }, { t: 'mic', x: 700, y: 525, r: 90 }, { t: 'mic', x: 640, y: 600, r: 270 }, { t: 'mic', x: 700, y: 600, r: 90 },
      { t: 'panels', x: 568, y: 560, r: 270, w: 2.4 },
      { t: 'tv', x: 670, y: 452, r: 0, w: 1.3 },
      // --- phone booths
      { t: 'booth', x: 835, y: 587, r: 0, w: 1.0, d: 1.0 }, { t: 'booth', x: 913, y: 587, r: 0, w: 1.0, d: 1.0 },
      { t: 'booth', x: 991, y: 587, r: 0, w: 1.0, d: 1.0 }, { t: 'booth', x: 1068, y: 587, r: 0, w: 1.0, d: 1.0 },
      { t: 'booth', x: 737, y: 1122, r: 180, w: 1.1, d: 1.4 },

      // --- lounge area
      { t: 'plant', x: 812, y: 662, size: 'tall' }, { t: 'plant', x: 1094, y: 666, size: 'bush' },
      { t: 'rug', x: 935, y: 833, r: 90, w: 2.9, d: 2.4, color: 'Sand' },
      { t: 'sofa', x: 818, y: 833, r: 270, seats: 3, w: 2.6, fab: 'charcoal' },
      { t: 'coffeeTable', x: 912, y: 833, r: 90, w: 1.2, d: 0.6 },
      { t: 'armchair', x: 1010, y: 785, r: 60, fab: 'cognac' }, { t: 'armchair', x: 1010, y: 885, r: 120, fab: 'cognac' },
      { t: 'sideTable', x: 818, y: 735, lamp: true },
      { t: 'highTable', x: 1233, y: 840, r: 0, w: 1.85, d: 0.85, stools: 3 },

      // --- kitchen
      { t: 'kitchen', x: 1640, y: 272, r: 0, w: 3.6, d: 0.62, sink: -0.6, fridge: 'right' },
      { t: 'cafeTable', x: 1527, y: 432, r: 0.4, chairs: 4 },
      { t: 'cafeTable', x: 1760, y: 397, r: 0.4, chairs: 4 },
      { t: 'plant', x: 1830, y: 462, size: 'small' },

      // --- restrooms
      { t: 'toilet', x: 1150, y: 118, r: 0 }, { t: 'vanity', x: 1235, y: 112, r: 0, w: 0.55 },
      { t: 'toilet', x: 1437, y: 118, r: 0 }, { t: 'vanity', x: 1500, y: 114, r: 90, w: 0.55 },
      { t: 'toilet', x: 1228, y: 380, r: 90 }, { t: 'toilet', x: 1290, y: 380, r: 270 },
      { t: 'vanity', x: 1137, y: 380, r: 270, w: 0.55 }, { t: 'vanity', x: 1383, y: 380, r: 90, w: 0.55 },
    ],
  },
  // ------------------------------------------------------------------ 115 E 23rd St, 5th floor
  // Legend: dark 1–2, green 3–4, magenta 5–6, blue 6–8, gold 8–11 desks.
  [F('115-e-23rd', 'floor-05')]: {
    grid: [2000, 1295],
    base: 'oak',
    rooms: [
      ['carpet', 95, 68, 492, 392], ['carpet', 70, 300, 140, 440], ['carpet', 905, 388, 1032, 672], ['carpet', 1518, 362, 1848, 560],
      ['carpet', 1518, 562, 1848, 852], ['carpet', 1518, 852, 1848, 1155], ['carpet', 1205, 675, 1410, 900], ['carpet', 1205, 1000, 1515, 1155],
      ['carpet', 378, 690, 525, 1160],
      ['carpetBlue', 525, 680, 800, 905], ['carpetBlue', 1035, 388, 1208, 672],
      ['stone', 490, 215, 880, 392],
      ['tile', 1210, 388, 1520, 680], ['tile', 1128, 70, 1522, 298],
      ['shaft', 504, 71, 643, 214], ['shaft', 664, 71, 804, 214], ['shaft', 536, 1005, 679, 1150],
      ['stair', 880, 70, 1102, 214], ['stair', 1543, 70, 1845, 214],
    ],
    erase: [
      // labels
      [610, 290, 768, 324], [200, 536, 462, 572], [1050, 510, 1192, 537], [1300, 528, 1430, 562], [885, 952, 1112, 1016],
      [1548, 250, 1590, 275], [290, 1086, 372, 1165], [928, 673, 1006, 750], [1006, 673, 1082, 750], [1128, 673, 1204, 750],
      // vestibule bench + plant, suite plant, sofa + rug
      [612, 348, 780, 382], [496, 332, 550, 390], [152, 395, 212, 460], [737, 394, 798, 552], [673, 410, 731, 535],
      // oval conference table and chairs; lounge sofa, oval table, high table, plant
      [559, 712, 773, 875], [698, 999, 757, 1151], [775, 1045, 818, 1105], [952, 798, 1084, 917], [1130, 1081, 1195, 1151],
      // desks drawn in 504 / 508, kitchen sink
      [919, 584, 1002, 681], [1530, 566, 1806, 656], [1530, 756, 1806, 846], [1222, 523, 1256, 570],
      // elevators, stairs, restroom fixtures
      [504, 71, 643, 214], [664, 71, 804, 214], [536, 1005, 679, 1150], [882, 72, 1100, 212], [1546, 72, 1842, 212],
      [1223, 80, 1270, 113], [1223, 137, 1270, 170], [1416, 84, 1461, 109], [1359, 152, 1406, 184], [1237, 221, 1270, 259], [1359, 239, 1427, 284], [1282, 71, 1404, 132],
      // room numbers
      box(280, 219), box(970, 459), box(967, 562), box(1680, 465), box(1673, 702), box(1313, 800), box(1358, 1076), box(1675, 1008),
    ],
    tags: [
      ['501', 420, 250], ['503', 968, 412], ['504', 968, 548], ['509', 1585, 392], ['508', 1600, 705], ['510', 1250, 712], ['506', 1262, 1030], ['507', 1580, 885],
    ],
    items: [
      // --- offices
      { t: 'office', box: [100, 72, 488, 388], desks: 8, layout: 'bench', axis: 'x' },
      { t: 'desk', x: 967, y: 470, r: 0, w: 1.2, d: 0.6 },
      { t: 'desk', x: 962, y: 640, r: 180, w: 1.2, d: 0.6 },
      { t: 'office', box: [1522, 368, 1845, 556], desks: 6, layout: 'bench', axis: 'x' },
      { t: 'desk', x: 1578, y: 598, r: 0, w: 1.22, d: 0.66 }, { t: 'desk', x: 1667, y: 598, r: 0, w: 1.22, d: 0.66 }, { t: 'desk', x: 1758, y: 598, r: 0, w: 1.22, d: 0.66 },
      { t: 'desk', x: 1578, y: 808, r: 180, w: 1.22, d: 0.66 }, { t: 'desk', x: 1667, y: 808, r: 180, w: 1.22, d: 0.66 }, { t: 'desk', x: 1758, y: 808, r: 180, w: 1.22, d: 0.66 },
      { t: 'office', box: [1522, 860, 1845, 1150], desks: 8, layout: 'bench', axis: 'x' },
      { t: 'office', box: [1212, 682, 1402, 893], desks: 6, layout: 'bench', axis: 'y' },
      { t: 'office', box: [1212, 1008, 1508, 1150], desks: 4, layout: 'wall', wall: 'bottom' },
      // enterprise suite: two benches, two private offices, a small meeting room, a phone booth
      { t: 'office', box: [150, 445, 700, 670], desks: 8, layout: 'bench', axis: 'x', dx: 0 },
      { t: 'office', box: [85, 700, 368, 1080], desks: 6, layout: 'bench', axis: 'y' },
      { t: 'office', box: [386, 696, 518, 795], desks: 1, wall: 'right' },
      { t: 'office', box: [386, 812, 518, 905], desks: 1, wall: 'right' },
      { t: 'confTable', x: 450, y: 1080, r: 0, shape: 'round', w: 1.1, d: 1.1, seats: 4, top: 'oak', a0: 0.785 },
      { t: 'booth', x: 330, y: 1124, r: 180, w: 1.0, d: 1.05 },
      { t: 'plant', x: 182, y: 428, size: 'tall' },
      { t: 'shelf', x: 92, y: 1110, r: 270, w: 1.4, h: 1.1 },

      // --- vestibule: bench console, plant, sofa + rug
      { t: 'credenza', x: 695, y: 366, r: 180, w: 2.3, d: 0.42, h: 0.75, top: 'oak' },
      { t: 'plant', x: 522, y: 360, size: 'bush' },
      { t: 'sofa', x: 768, y: 473, r: 90, seats: 3, w: 2.3, fab: 'navy' },
      { t: 'rug', x: 700, y: 473, r: 90, w: 2.4, d: 1.6, color: 'Grey' },
      { t: 'coffeeTable', x: 700, y: 473, r: 90, w: 1.0, d: 0.55, top: 'oak' },
      { t: 'armchair', x: 620, y: 473, r: 270, fab: 'sand' },
      // --- elevators, stairs
      { t: 'elevator', x: 573, y: 222, r: 0, w: 1.15 }, { t: 'elevator', x: 734, y: 222, r: 0, w: 1.15 },
      { t: 'elevator', x: 607, y: 992, r: 180, w: 1.3 },
      { t: 'stair', x: 990, y: 141, r: 90, w: 2.0, d: 3.1, flights: 2 },
      { t: 'stair', x: 1694, y: 141, r: 90, w: 2.0, d: 4.2, flights: 2 },

      // --- conference (oval, 8 seats) and small conference (6 seats)
      { t: 'confTable', x: 666, y: 795, r: 0, shape: 'oval', w: 2.5, d: 1.05, seats: 8 },
      { t: 'tv', x: 538, y: 795, r: 270, w: 1.5, console: false },
      { t: 'confTable', x: 1120, y: 545, r: 90, w: 2.2, d: 1.0, seats: 6, ends: 0, top: 'oak', fab: 'navy' },
      { t: 'tv', x: 1120, y: 402, r: 0, w: 1.3 },
      // --- phone booths
      { t: 'booth', x: 968, y: 712, r: 0, w: 1.0, d: 1.0 }, { t: 'booth', x: 1044, y: 712, r: 0, w: 1.0, d: 1.0 }, { t: 'booth', x: 1166, y: 712, r: 0, w: 1.0, d: 1.0 },
      { t: 'booth', x: 1570, y: 262, r: 0, w: 0.95, d: 0.85 },

      // --- lounge & event space
      { t: 'rug', x: 815, y: 1075, r: 90, w: 2.8, d: 2.3, color: 'Navy' },
      { t: 'sofa', x: 727, y: 1075, r: 270, seats: 3, w: 2.2, fab: 'charcoal', pillow: 'mustard' },
      { t: 'coffeeTable', x: 800, y: 1075, r: 90, round: true, w: 1.0, d: 0.55 },
      { t: 'armchair', x: 885, y: 1030, r: 110, fab: 'sand' }, { t: 'armchair', x: 885, y: 1120, r: 70, fab: 'sand' },
      { t: 'highTable', x: 1018, y: 864, r: 0, w: 1.85, d: 0.8, stools: 3 },
      { t: 'plant', x: 1162, y: 1112, size: 'tall' },
      { t: 'cafeTable', x: 1040, y: 1060, r: 0.4, chairs: 3, a0: 1.57 },

      // --- kitchen: counter with sink on the wall, island with stools
      { t: 'kitchen', x: 1242, y: 535, r: 270, w: 3.6, d: 0.62, sink: 0, fridge: 'right' },
      { t: 'island', x: 1385, y: 535, r: 270, w: 2.2, d: 0.95, stools: 3 },
      { t: 'cafeTable', x: 1460, y: 440, r: 0.4, chairs: 2, a0: 0 },

      // --- restrooms
      { t: 'toilet', x: 1246, y: 97, r: 90 }, { t: 'toilet', x: 1246, y: 154, r: 90 },
      { t: 'toilet', x: 1440, y: 97, r: 270 }, { t: 'toilet', x: 1383, y: 168, r: 270 },
      { t: 'vanity', x: 1255, y: 240, r: 90, w: 0.5 }, { t: 'vanity', x: 1393, y: 258, r: 180, w: 0.9, sinks: 2 },
    ],
  },

  // ------------------------------------------------------------------ 10 E 38th St (loft floors; the drawings
  // are the architect's plans with no furniture — open areas are furnished
  // sparsely: benches between the columns, reception by the elevators,
  // meeting tables where the drawing shows rooms).
  [F('10-e-38th', 'floor-03')]: {
    grid: [2000, 1027],
    base: 'concrete',
    rooms: [
      ['oak', 100, 410, 1700, 990], ['stone', 320, 205, 520, 410],
      ['carpet', 100, 62, 325, 335], ['carpet', 1504, 697, 1700, 882], ['carpetBlue', 520, 222, 818, 372],
      ['tile', 1275, 90, 1545, 305], ['tile', 1545, 45, 1595, 325],
      ['shaft', 332, 67, 498, 203], ['shaft', 542, 67, 660, 203], ['shaft', 682, 67, 801, 203], ['stair', 848, 40, 1005, 207],
    ],
    erase: [[332, 67, 498, 203], [542, 67, 660, 203], [682, 67, 801, 203], [850, 40, 1005, 205], [1555, 240, 1590, 285], [1505, 150, 1532, 232]],
    items: [
      // private office on the street and the meeting room off the lobby
      { t: 'desk', x: 215, y: 130, r: 0, w: 1.6, d: 0.75 },
      { t: 'credenza', x: 215, y: 76, r: 0, w: 1.8, d: 0.42 },
      { t: 'boardChair', x: 185, y: 215, r: 180 }, { t: 'boardChair', x: 245, y: 215, r: 180 },
      { t: 'plant', x: 135, y: 300, size: 'tall' },
      { t: 'confTable', x: 668, y: 292, r: 0, w: 3.0, d: 1.05, seats: 8, ends: 0 },
      { t: 'tv', x: 532, y: 292, r: 270, w: 1.3, console: false },
      // reception facing the elevators
      { t: 'reception', x: 425, y: 330, r: 180, R: 1.05, span: 1.7, deep: 0.55 },
      { t: 'plant', x: 500, y: 240, size: 'small' },
      // workstation benches between the column lines
      { t: 'desks', x: 300, y: 560, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 690, y: 560, r: 0, n: 3, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 1080, y: 560, r: 0, n: 3, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 390, y: 862, r: 0, n: 3, w: 1.4, d: 0.7, double: true },
      // lounge beside the half-height partition
      { t: 'rug', x: 880, y: 860, r: 0, w: 3.0, d: 2.3, color: 'Grey' },
      { t: 'sofa', x: 880, y: 935, r: 180, seats: 3, w: 2.4, fab: 'navy' },
      { t: 'coffeeTable', x: 880, y: 858, r: 0, w: 1.2, d: 0.6 },
      { t: 'armchair', x: 820, y: 790, r: 340, fab: 'cognac' }, { t: 'armchair', x: 940, y: 790, r: 20, fab: 'cognac' },
      { t: 'highTable', x: 1190, y: 870, r: 0, w: 2.0, d: 0.85, stools: 3 },
      // pantry counter and café tables by the restrooms
      { t: 'kitchen', x: 1572, y: 187, r: 90, w: 4.3, d: 0.55, sink: 1.3, fridge: 'left' },
      { t: 'cafeTable', x: 1330, y: 520, r: 0.42, chairs: 4 }, { t: 'cafeTable', x: 1480, y: 520, r: 0.42, chairs: 4 },
      // private office at the rear
      { t: 'office', box: [1510, 703, 1696, 878], desks: 2, wall: 'right' },
      // restrooms
      { t: 'toilet', x: 1305, y: 122, r: 0 }, { t: 'toilet', x: 1370, y: 122, r: 0 }, { t: 'toilet', x: 1445, y: 122, r: 0 },
      { t: 'vanity', x: 1395, y: 255, r: 90, w: 0.5 }, { t: 'vanity', x: 1518, y: 190, r: 90, w: 0.9, sinks: 2 },
      // elevators, stair, plants
      { t: 'elevator', x: 423, y: 213, r: 0, w: 1.15 }, { t: 'elevator', x: 586, y: 213, r: 0, w: 0.85 }, { t: 'elevator', x: 735, y: 213, r: 0, w: 0.85 },
      { t: 'stair', x: 928, y: 122, r: 90, w: 2.6, d: 2.6, flights: 2 },
      { t: 'plant', x: 135, y: 690, size: 'tall' }, { t: 'plant', x: 1650, y: 420, size: 'tall' }, { t: 'plant', x: 630, y: 955, size: 'bush' },
    ],
  },

  [F('10-e-38th', 'floor-08')]: {
    grid: [2000, 1109],
    base: 'oak',
    rooms: [
      ['stone', 335, 225, 555, 455],
      ['carpet', 99, 59, 337, 345], ['carpet', 99, 760, 316, 1057], ['carpet', 851, 455, 1050, 634], ['carpet', 820, 634, 1050, 796],
      ['carpet', 1049, 459, 1247, 752], ['carpet', 622, 903, 1386, 1057],
      ['carpetBlue', 554, 238, 851, 352], ['carpetBlue', 555, 634, 820, 796], ['carpetBlue', 1572, 673, 1817, 947],
      ['tile', 1238, 70, 1585, 345], ['tile', 1585, 62, 1630, 270],
      ['shaft', 352, 67, 536, 215], ['shaft', 578, 67, 711, 215], ['shaft', 729, 67, 862, 215], ['stair', 878, 52, 1090, 216],
    ],
    erase: [
      [352, 67, 536, 215], [578, 67, 711, 215], [729, 67, 862, 215], [878, 52, 1125, 216], [1585, 62, 1632, 272],
      [1258, 82, 1296, 140], [1364, 82, 1400, 140], [1425, 85, 1462, 112], [1520, 82, 1556, 140], [1352, 256, 1388, 296], [1412, 256, 1450, 296],
    ],
    items: [
      // street-side offices
      { t: 'desk', x: 215, y: 125, r: 0, w: 1.6, d: 0.75 },
      { t: 'credenza', x: 215, y: 72, r: 0, w: 1.8, d: 0.42 },
      { t: 'boardChair', x: 185, y: 215, r: 180 }, { t: 'boardChair', x: 245, y: 215, r: 180 },
      { t: 'plant', x: 300, y: 85, size: 'small' },
      { t: 'office', box: [128, 768, 312, 1050], desks: 2, wall: 'left' },
      { t: 'shelf', x: 300, y: 980, r: 90, w: 1.2, h: 1.1 },
      // open workstations by the street windows
      { t: 'desks', x: 330, y: 455, r: 0, n: 3, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 330, y: 655, r: 0, n: 3, w: 1.4, d: 0.7, double: true },
      // reception and meeting room off the elevator lobby
      { t: 'reception', x: 380, y: 292, r: 270, R: 1.0, span: 1.6, deep: 0.55 },
      { t: 'confTable', x: 702, y: 292, r: 0, w: 3.0, d: 1.0, seats: 8, ends: 0 },
      { t: 'tv', x: 566, y: 292, r: 270, w: 1.2, console: false },
      { t: 'printer', x: 1020, y: 270, r: 0 },
      // interior rooms: team room, offices, small meeting room
      { t: 'desks', x: 703, y: 545, r: 0, n: 3, w: 1.3, d: 0.65, double: true },
      { t: 'office', box: [858, 462, 1045, 628], desks: 2, wall: 'right' },
      { t: 'confTable', x: 688, y: 712, r: 0, w: 2.2, d: 1.0, seats: 6, ends: 0, top: 'oak', fab: 'navy' },
      { t: 'office', box: [826, 640, 1045, 790], desks: 2, wall: 'top' },
      { t: 'office', box: [1055, 470, 1242, 745], desks: 4, layout: 'bench', axis: 'y' },
      { t: 'confTable', x: 1335, y: 668, r: 0, shape: 'round', w: 1.1, d: 1.1, seats: 4, top: 'oak', a0: 0.785 },
      // offices along the rear wall
      { t: 'office', box: [626, 910, 958, 1050], desks: 3, wall: 'bottom' },
      { t: 'office', box: [968, 910, 1136, 1050], desks: 2, wall: 'bottom' },
      { t: 'office', box: [1146, 910, 1382, 1050], desks: 2, wall: 'bottom' },
      // conference room and lounge on the east side
      { t: 'confTable', x: 1694, y: 808, r: 90, w: 3.0, d: 1.15, seats: 10, ends: 2 },
      { t: 'rug', x: 1700, y: 575, r: 0, w: 2.6, d: 2.0, color: 'Sand' },
      { t: 'armchair', x: 1650, y: 560, r: 300, fab: 'cognac' }, { t: 'armchair', x: 1750, y: 560, r: 60, fab: 'cognac' },
      { t: 'coffeeTable', x: 1700, y: 610, round: true, w: 0.8, d: 0.8 },
      { t: 'plant', x: 1770, y: 380, size: 'tall' },
      // café corner by the street side
      { t: 'highTable', x: 450, y: 880, r: 90, w: 2.0, d: 0.8, stools: 3 },
      // pantry, restrooms, core
      { t: 'kitchen', x: 1606, y: 168, r: 90, w: 3.4, d: 0.5, sink: 0.25, fridge: 'left' },
      { t: 'toilet', x: 1276, y: 112, r: 0 }, { t: 'toilet', x: 1382, y: 112, r: 0 }, { t: 'toilet', x: 1538, y: 112, r: 0 },
      { t: 'vanity', x: 1441, y: 96, r: 0, w: 0.45 }, { t: 'vanity', x: 1371, y: 276, r: 90, w: 0.5 }, { t: 'vanity', x: 1431, y: 276, r: 270, w: 0.5 },
      { t: 'elevator', x: 455, y: 228, r: 0, w: 1.15 }, { t: 'elevator', x: 637, y: 228, r: 0, w: 0.9 }, { t: 'elevator', x: 796, y: 228, r: 0, w: 0.9 },
      { t: 'stair', x: 982, y: 134, r: 90, w: 2.6, d: 3.4, flights: 2 },
      { t: 'plant', x: 135, y: 720, size: 'tall' }, { t: 'plant', x: 560, y: 980, size: 'bush' },
    ],
  },

  [F('10-e-38th', 'floor-10')]: {
    grid: [2000, 1095],
    base: 'concrete',
    rooms: [
      ['oak', 100, 360, 1810, 1050], ['stone', 336, 235, 900, 360],
      ['carpetBlue', 1552, 669, 1806, 935],
      ['tile', 1232, 86, 1588, 348], ['tile', 1588, 60, 1652, 278],
      ['shaft', 350, 72, 532, 217], ['shaft', 575, 72, 706, 217], ['shaft', 725, 72, 856, 217], ['stair', 868, 48, 1090, 215],
    ],
    erase: [
      [350, 72, 532, 217], [575, 72, 706, 217], [725, 72, 856, 217], [868, 48, 1090, 215], [1588, 60, 1652, 278],
      [1290, 95, 1330, 150], [1350, 95, 1395, 150], [1415, 92, 1465, 122], [1485, 95, 1530, 150], [1368, 252, 1405, 298], [1415, 300, 1450, 340],
    ],
    items: [
      { t: 'reception', x: 452, y: 365, r: 180, R: 1.05, span: 1.7, deep: 0.55 },
      { t: 'plant', x: 340, y: 255, size: 'small' },
      { t: 'desks', x: 300, y: 545, r: 0, n: 3, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 728, y: 545, r: 0, n: 3, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 1135, y: 545, r: 0, n: 3, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 300, y: 905, r: 0, n: 3, w: 1.4, d: 0.7, double: true },
      { t: 'rug', x: 735, y: 905, r: 0, w: 3.0, d: 2.4, color: 'Sand' },
      { t: 'sofaL', x: 735, y: 965, r: 180, w: 2.6, l: 1.7, side: 1, fab: 'charcoal', pillow: 'mustard' },
      { t: 'coffeeTable', x: 735, y: 890, r: 0, w: 1.1, d: 0.6 },
      { t: 'armchair', x: 690, y: 815, r: 0, fab: 'sand' },
      { t: 'highTable', x: 1140, y: 905, r: 0, w: 2.2, d: 0.85, stools: 3 },
      { t: 'cafeTable', x: 1480, y: 450, r: 0.42, chairs: 4 }, { t: 'cafeTable', x: 1640, y: 450, r: 0.42, chairs: 4 },
      { t: 'confTable', x: 1680, y: 812, r: 90, w: 2.9, d: 1.1, seats: 8, ends: 0 },
      { t: 'tv', x: 1680, y: 683, r: 0, w: 1.4, console: false },
      { t: 'kitchen', x: 1610, y: 168, r: 90, w: 3.6, d: 0.55, sink: 0.42, fridge: 'left' },
      { t: 'toilet', x: 1305, y: 118, r: 0 }, { t: 'toilet', x: 1372, y: 118, r: 0 }, { t: 'toilet', x: 1511, y: 118, r: 0 },
      { t: 'vanity', x: 1442, y: 105, r: 0, w: 0.45 }, { t: 'vanity', x: 1388, y: 275, r: 90, w: 0.5 }, { t: 'vanity', x: 1430, y: 320, r: 270, w: 0.5 },
      { t: 'elevator', x: 452, y: 226, r: 0, w: 1.15 }, { t: 'elevator', x: 633, y: 226, r: 0, w: 0.9 }, { t: 'elevator', x: 791, y: 226, r: 0, w: 0.9 },
      { t: 'stair', x: 978, y: 132, r: 90, w: 2.7, d: 3.6, flights: 2 },
      { t: 'plant', x: 140, y: 730, size: 'tall' }, { t: 'plant', x: 1770, y: 380, size: 'tall' }, { t: 'plant', x: 1000, y: 1010, size: 'bush' },
    ],
  },

  [F('10-e-38th', 'floor-11')]: {
    grid: [2000, 1102],
    base: 'oak',
    rooms: [
      ['stone', 345, 228, 551, 420],
      ['carpet', 128, 50, 340, 326], ['carpet', 128, 334, 340, 588], ['carpet', 128, 596, 340, 864], ['carpet', 940, 760, 1140, 1060], ['carpet', 1147, 760, 1363, 1060],
      ['carpetBlue', 128, 872, 515, 1060], ['carpetBlue', 519, 760, 940, 1060],
      ['tile', 1497, 47, 1800, 330],
      ['shaft', 354, 72, 533, 217], ['shaft', 582, 72, 709, 217], ['shaft', 732, 72, 860, 217], ['stair', 868, 48, 1090, 214],
    ],
    erase: [[354, 72, 533, 217], [582, 72, 709, 217], [732, 72, 860, 217], [868, 48, 1142, 214], [1495, 45, 1770, 100]],
    items: [
      // street-side private offices
      { t: 'desk', x: 230, y: 120, r: 0, w: 1.6, d: 0.75 },
      { t: 'credenza', x: 230, y: 62, r: 0, w: 1.8, d: 0.42 },
      { t: 'boardChair', x: 200, y: 210, r: 180 }, { t: 'boardChair', x: 260, y: 210, r: 180 },
      { t: 'office', box: [130, 338, 336, 584], desks: 2, wall: 'left' },
      { t: 'office', box: [130, 600, 336, 860], desks: 2, wall: 'left' },
      { t: 'confTable', x: 320, y: 965, r: 0, w: 2.6, d: 1.05, seats: 6, ends: 0, top: 'oak', fab: 'navy' },
      // boardroom and offices along the rear
      { t: 'confTable', x: 730, y: 925, r: 0, w: 4.0, d: 1.3, seats: 12, ends: 2 },
      { t: 'tv', x: 730, y: 1045, r: 180, w: 1.8, console: false },
      { t: 'office', box: [945, 790, 1136, 1060], desks: 3, wall: 'bottom' },
      { t: 'office', box: [1150, 790, 1358, 1060], desks: 4, layout: 'bench', axis: 'y' },
      // reception, copy room
      { t: 'reception', x: 457, y: 400, r: 180, R: 1.05, span: 1.7, deep: 0.55 },
      { t: 'lockers', x: 708, y: 252, r: 0, w: 3.2 }, { t: 'printer', x: 830, y: 255, r: 0 },
      // open workstations, lounge
      { t: 'desks', x: 640, y: 600, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 1070, y: 600, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'rug', x: 1580, y: 560, r: 0, w: 3.0, d: 2.4, color: 'Grey' },
      { t: 'sofa', x: 1580, y: 635, r: 180, seats: 3, w: 2.4, fab: 'charcoal' },
      { t: 'coffeeTable', x: 1580, y: 560, r: 0, w: 1.2, d: 0.6 },
      { t: 'armchair', x: 1520, y: 490, r: 340, fab: 'cognac' }, { t: 'armchair', x: 1640, y: 490, r: 20, fab: 'cognac' },
      { t: 'highTable', x: 1580, y: 870, r: 0, w: 2.0, d: 0.85, stools: 3 },
      // pantry
      { t: 'kitchen', x: 1631, y: 74, r: 0, w: 4.7, d: 0.6, sink: -0.68, fridge: 'left' },
      { t: 'cafeTable', x: 1590, y: 230, r: 0.42, chairs: 4 }, { t: 'cafeTable', x: 1730, y: 230, r: 0.42, chairs: 4 },
      // core
      { t: 'elevator', x: 457, y: 228, r: 0, w: 1.15 }, { t: 'elevator', x: 640, y: 228, r: 0, w: 0.9 }, { t: 'elevator', x: 801, y: 228, r: 0, w: 0.9 },
      { t: 'stair', x: 980, y: 132, r: 90, w: 2.7, d: 3.6, flights: 2 },
      { t: 'plant', x: 380, y: 300, size: 'small' }, { t: 'plant', x: 1770, y: 400, size: 'tall' }, { t: 'plant', x: 1450, y: 1010, size: 'bush' },
    ],
  },

  // ------------------------------------------------------------------ 120 E 56th St (1960s typical floors: open
  // floors around a central core — furnished as a modern office: reception in
  // the core recess, benches between the column lines, meeting tables and
  // lounges in the corner bays; terraces get planters and café tables).
  [F('120-e-56th', 'typical-floors-03-09-1960s')]: {
    grid: [1397, 2000],
    base: 'oak',
    rooms: [
      ['terrace', 300, 60, 1045, 268], ['terrace', 318, 1778, 1035, 2000],
      ['stone', 280, 1005, 1060, 1138], ['stone', 556, 1138, 842, 1290],
      ['tile', 78, 1138, 304, 1282], ['tile', 1060, 1138, 1282, 1282],
      ['shaft', 580, 870, 666, 1000], ['shaft', 700, 870, 800, 1000],
      ['stair', 58, 903, 232, 1133], ['stair', 1132, 903, 1310, 1133],
      ['carpet', 62, 1785, 300, 1990], ['carpet', 1048, 1785, 1306, 1990],
    ],
    erase: [
      [30, 40, 1340, 112], [620, 1070, 750, 1092], [150, 1238, 222, 1260], [1105, 1240, 1220, 1262], [100, 192, 250, 240], [1115, 192, 1268, 240],
      [582, 872, 664, 998], [702, 872, 798, 998], [60, 905, 230, 1130], [1135, 905, 1308, 1130],
      [92, 1155, 128, 1190], [92, 1225, 128, 1262], [268, 1185, 302, 1275], [1232, 1158, 1270, 1192], [1232, 1228, 1270, 1265], [1066, 1190, 1102, 1282],
    ],
    items: [
      // north half: two pairs of benches either side of a round meeting table
      { t: 'desks', x: 330, y: 420, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 330, y: 600, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 1000, y: 420, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 1000, y: 600, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'confTable', x: 665, y: 510, r: 0, shape: 'round', w: 1.2, d: 1.2, seats: 4, top: 'oak', a0: 0.785 },
      { t: 'plant', x: 665, y: 330, size: 'tall' },
      // rear corner bays (the 7th-floor terraces): sofas
      { t: 'sofa', x: 180, y: 200, r: 0, seats: 3, w: 2.2, fab: 'navy' }, { t: 'plant', x: 85, y: 285, size: 'small' },
      { t: 'sofa', x: 1190, y: 200, r: 0, seats: 3, w: 2.2, fab: 'navy' }, { t: 'plant', x: 1290, y: 285, size: 'small' },
      // core: reception in the recess, elevators, stairs, restrooms
      { t: 'reception', x: 700, y: 1178, r: 0, R: 1.15, span: 1.7, deep: 0.55 },
      { t: 'plant', x: 585, y: 1275, size: 'bush' }, { t: 'plant', x: 815, y: 1275, size: 'bush' },
      { t: 'elevator', x: 623, y: 1008, r: 0, w: 1.0 }, { t: 'elevator', x: 750, y: 1008, r: 0, w: 1.0 },
      { t: 'stair', x: 145, y: 1018, r: 0, w: 2.6, d: 3.6, flights: 2 },
      { t: 'stair', x: 1221, y: 1018, r: 0, w: 2.6, d: 3.6, flights: 2 },
      { t: 'toilet', x: 111, y: 1172, r: 270 }, { t: 'toilet', x: 111, y: 1243, r: 270 }, { t: 'vanity', x: 288, y: 1228, r: 90, w: 1.0, sinks: 2 },
      { t: 'toilet', x: 1250, y: 1175, r: 90 }, { t: 'toilet', x: 1250, y: 1247, r: 90 }, { t: 'vanity', x: 1082, y: 1236, r: 270, w: 1.0, sinks: 2 },
      // south half (street front): waiting area, benches, meeting table
      { t: 'rug', x: 690, y: 1440, r: 0, w: 3.0, d: 2.2, color: 'Sand' },
      { t: 'sofa', x: 690, y: 1490, r: 180, seats: 3, w: 2.3, fab: 'charcoal' },
      { t: 'coffeeTable', x: 690, y: 1420, r: 0, w: 1.1, d: 0.55 },
      { t: 'armchair', x: 610, y: 1390, r: 240, fab: 'cognac' }, { t: 'armchair', x: 770, y: 1390, r: 120, fab: 'cognac' },
      { t: 'desks', x: 330, y: 1470, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 330, y: 1650, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 1040, y: 1470, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 1040, y: 1650, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'confTable', x: 690, y: 1665, r: 0, w: 2.4, d: 1.0, seats: 6, ends: 0 },
      // street corner bays: a private office and a small meeting table
      { t: 'office', box: [72, 1792, 298, 1982], desks: 2, wall: 'bottom' },
      { t: 'confTable', x: 1180, y: 1890, r: 0, shape: 'round', w: 1.1, d: 1.1, seats: 4, top: 'walnut', a0: 0.785 },
      { t: 'plant', x: 1280, y: 1960, size: 'tall' },
    ],
  },

  [F('120-e-56th', 'typical-floors-10-12-1960s')]: {
    grid: [1468, 2000],
    base: 'oak',
    rooms: [
      ['terrace', 40, 60, 1360, 362], ['terrace', 330, 1782, 1072, 1996],
      ['stone', 300, 1005, 1090, 1138], ['stone', 581, 1138, 866, 1290],
      ['tile', 106, 1138, 328, 1285], ['tile', 1086, 1138, 1302, 1285],
      ['shaft', 605, 870, 701, 997], ['shaft', 725, 870, 822, 997],
      ['stair', 83, 903, 256, 1133], ['stair', 1155, 903, 1332, 1133],
      ['carpet', 85, 1795, 325, 1990], ['carpet', 1080, 1795, 1332, 1990],
    ],
    erase: [
      [40, 95, 1372, 258], [655, 1062, 780, 1086], [165, 1235, 245, 1258], [1138, 1238, 1250, 1262], [975, 308, 1270, 336], [560, 1872, 855, 1900],
      [607, 872, 699, 995], [727, 872, 820, 995], [85, 905, 254, 1130], [1158, 905, 1330, 1130],
      [118, 1154, 158, 1190], [118, 1222, 158, 1260], [290, 1180, 325, 1275], [1252, 1158, 1292, 1194], [1252, 1230, 1292, 1268], [1084, 1185, 1118, 1280],
    ],
    items: [
      { t: 'desks', x: 355, y: 492, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 355, y: 655, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 1060, y: 492, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 1060, y: 655, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'confTable', x: 707, y: 575, r: 0, shape: 'round', w: 1.2, d: 1.2, seats: 4, top: 'oak', a0: 0.785 },
      { t: 'plant', x: 707, y: 420, size: 'tall' },
      // 10th-floor street terrace and 12th-floor rear terrace
      { t: 'planter', x: 350, y: 290, r: 0, w: 3.2, d: 0.45 }, { t: 'planter', x: 1060, y: 290, r: 0, w: 3.2, d: 0.45 },
      { t: 'cafeTable', x: 707, y: 315, r: 0.35, chairs: 2, a0: 0, top: 'white' },
      { t: 'planter', x: 707, y: 1975, r: 0, w: 5.0, d: 0.45 },
      { t: 'cafeTable', x: 560, y: 1880, r: 0.4, chairs: 4, top: 'white' }, { t: 'cafeTable', x: 855, y: 1880, r: 0.4, chairs: 4, top: 'white' },
      { t: 'plant', x: 360, y: 1810, size: 'bush' }, { t: 'plant', x: 1045, y: 1810, size: 'bush' },
      // core
      { t: 'reception', x: 727, y: 1178, r: 0, R: 1.15, span: 1.7, deep: 0.55 },
      { t: 'plant', x: 608, y: 1275, size: 'bush' }, { t: 'plant', x: 840, y: 1275, size: 'bush' },
      { t: 'elevator', x: 653, y: 1008, r: 0, w: 1.0 }, { t: 'elevator', x: 773, y: 1008, r: 0, w: 1.0 },
      { t: 'stair', x: 170, y: 1018, r: 0, w: 2.6, d: 3.6, flights: 2 },
      { t: 'stair', x: 1244, y: 1018, r: 0, w: 2.6, d: 3.6, flights: 2 },
      { t: 'toilet', x: 138, y: 1171, r: 270 }, { t: 'toilet', x: 138, y: 1240, r: 270 }, { t: 'vanity', x: 309, y: 1226, r: 90, w: 1.0, sinks: 2 },
      { t: 'toilet', x: 1272, y: 1176, r: 90 }, { t: 'toilet', x: 1272, y: 1248, r: 90 }, { t: 'vanity', x: 1101, y: 1232, r: 270, w: 1.0, sinks: 2 },
      // south half
      { t: 'rug', x: 720, y: 1440, r: 0, w: 3.0, d: 2.2, color: 'Grey' },
      { t: 'sofa', x: 720, y: 1490, r: 180, seats: 3, w: 2.3, fab: 'navy' },
      { t: 'coffeeTable', x: 720, y: 1420, r: 0, w: 1.1, d: 0.55 },
      { t: 'armchair', x: 640, y: 1390, r: 240, fab: 'sand' }, { t: 'armchair', x: 800, y: 1390, r: 120, fab: 'sand' },
      { t: 'desks', x: 355, y: 1470, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 355, y: 1650, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 1065, y: 1470, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 1065, y: 1650, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'confTable', x: 720, y: 1665, r: 0, w: 2.4, d: 1.0, seats: 6, ends: 0 },
      { t: 'office', box: [95, 1800, 318, 1982], desks: 2, wall: 'bottom' },
      { t: 'confTable', x: 1205, y: 1890, r: 0, shape: 'round', w: 1.1, d: 1.1, seats: 4, top: 'walnut', a0: 0.785 },
    ],
  },

  [F('120-e-56th', 'typical-floors-13-15-1960s')]: {
    grid: [1506, 2000],
    base: 'oak',
    rooms: [
      ['terrace', 54, 0, 1416, 298], ['terrace', 54, 1470, 445, 1698], ['terrace', 1022, 1470, 1416, 1698],
      ['stone', 330, 868, 1150, 1005], ['stone', 605, 1005, 903, 1140],
      ['tile', 100, 1005, 338, 1162], ['tile', 1130, 1005, 1362, 1162],
      ['shaft', 627, 723, 730, 858], ['shaft', 755, 723, 858, 858],
      ['stair', 75, 753, 262, 1000], ['stair', 1203, 753, 1390, 1000],
    ],
    erase: [
      [40, 25, 1440, 175], [660, 924, 800, 947], [160, 1105, 250, 1130], [1182, 1110, 1305, 1135], [1055, 242, 1365, 270], [105, 1565, 415, 1590], [1050, 1570, 1360, 1595],
      [629, 725, 728, 856], [757, 725, 856, 856], [78, 755, 260, 998], [1205, 755, 1388, 998],
      [112, 1018, 155, 1052], [112, 1098, 155, 1134], [300, 1056, 333, 1145], [1312, 1024, 1355, 1060], [1312, 1100, 1355, 1137], [1137, 1060, 1176, 1150],
    ],
    items: [
      // terraces: planters and café tables
      { t: 'planter', x: 420, y: 235, r: 0, w: 4.0, d: 0.45 }, { t: 'planter', x: 1060, y: 235, r: 0, w: 4.0, d: 0.45 },
      { t: 'cafeTable', x: 740, y: 255, r: 0.35, chairs: 2, a0: 0, top: 'white' },
      { t: 'cafeTable', x: 255, y: 1580, r: 0.4, chairs: 4, top: 'white' }, { t: 'planter', x: 255, y: 1655, r: 0, w: 4.5, d: 0.4 },
      { t: 'cafeTable', x: 1210, y: 1580, r: 0.4, chairs: 4, top: 'white' }, { t: 'planter', x: 1210, y: 1655, r: 0, w: 4.5, d: 0.4 },
      // north: benches, a meeting table by the columns
      { t: 'desks', x: 320, y: 440, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 1060, y: 430, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'confTable', x: 712, y: 450, r: 0, w: 2.4, d: 1.0, seats: 6, ends: 0, top: 'oak', fab: 'navy' },
      { t: 'plant', x: 712, y: 330, size: 'tall' }, { t: 'plant', x: 100, y: 330, size: 'small' }, { t: 'plant', x: 1385, y: 330, size: 'small' },
      // core
      { t: 'elevator', x: 678, y: 869, r: 0, w: 1.0 }, { t: 'elevator', x: 806, y: 869, r: 0, w: 1.0 },
      { t: 'stair', x: 168, y: 876, r: 0, w: 2.8, d: 3.9, flights: 2 },
      { t: 'stair', x: 1296, y: 876, r: 0, w: 2.8, d: 3.9, flights: 2 },
      { t: 'toilet', x: 134, y: 1034, r: 270 }, { t: 'toilet', x: 134, y: 1115, r: 270 }, { t: 'vanity', x: 316, y: 1100, r: 90, w: 1.1, sinks: 2 },
      { t: 'toilet', x: 1333, y: 1041, r: 90 }, { t: 'toilet', x: 1333, y: 1119, r: 90 }, { t: 'vanity', x: 1154, y: 1106, r: 270, w: 1.1, sinks: 2 },
      // south: reception, benches, lounge in the bay window
      { t: 'reception', x: 754, y: 1190, r: 0, R: 1.15, span: 1.7, deep: 0.55 },
      { t: 'desks', x: 300, y: 1330, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'desks', x: 1170, y: 1330, r: 0, n: 4, w: 1.4, d: 0.7, double: true },
      { t: 'rug', x: 733, y: 1560, r: 0, w: 3.4, d: 2.4, color: 'Navy' },
      { t: 'sofa', x: 733, y: 1640, r: 180, seats: 3, w: 2.4, fab: 'sand', pillow: 'navy' },
      { t: 'coffeeTable', x: 733, y: 1560, r: 0, round: true, w: 1.0, d: 0.6 },
      { t: 'armchair', x: 625, y: 1505, r: 300, fab: 'cognac' }, { t: 'armchair', x: 841, y: 1505, r: 60, fab: 'cognac' },
      { t: 'plant', x: 500, y: 1660, size: 'tall' }, { t: 'plant', x: 965, y: 1660, size: 'tall' },
    ],
  },
};

export const furnishingFor = (src) => furnishings[src] ?? null;
