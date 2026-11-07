// Published floor plans, per property and per floor.
//
// Every plan here is a real, publicly published drawing: traced from the
// leasing PDF / brochure it came from (cropped, title block removed,
// re-inked in the site's ink colour on a transparent background). Floors with
// no published plan are simply absent — nothing here is invented.
//
//   floors : storeys the plan applies to (numbers match the 3D model's floors)
//   label  : short name shown on the tab
//   kind   : 'Full floor' | 'Suite' | 'Test fit' | 'Typical floor' | 'Site plan' | 'Unit'
//   src    : assets/properties/<id>/plans/<file>.webp
//   note   : one line under the plan
//   source : where it was published
//   model3d: (full-floor plans only) how the drawing sits on the 3D model —
//            see js/viewer/floorplan3d.js. Plans with it are laid into the
//            building as a cut-away floor when that storey is picked.

const SRC = {
  loopnet10e38: { name: 'LoopNet listing — architect’s plans by Tuller Feld McNealus (Mar 2023)', url: 'https://www.loopnet.com/Listing/10-E-38th-St-New-York-NY/35969074/' },
  loopnet120e56: { name: 'LoopNet listing — First Pioneer Realty / Tuller Feld McNealus', url: 'https://www.loopnet.com/Listing/120-E-56th-St-New-York-NY/5778430/' },
  columbia120e56: { name: 'Columbia University, Avery Library — NY Real Estate Brochure Collection (Julien J. Studley, Inc.)', url: 'https://dlc.library.columbia.edu/nyre/cul:p2ngf1vjx8' },
  loopnetQB: { name: 'LoopNet listing — First Pioneer Realty', url: 'https://www.loopnet.com/Listing/34-09-34-11-Queens-Blvd-Long-Island-City-NY/6606809/' },
  monaLisa: { name: 'Mona Lisa Plaza leasing brochure — Paul Ash Commercial Real Estate', url: 'https://images.loopnet.ca/d2/VeUrlIlFVapMSx138i5-XQ7OIym1DvJ71b1T2pyMUQg/Mona%20Lisa%20Plaza%20Brochure.pdf' },
  link4th: { name: 'The Link at 4th Ave — published unit plans (Zumper)', url: 'https://www.zumper.com/apartment-buildings/p4817/the-link-at-4th-ave-west-university-tucson-az' },
};

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const P = (id, file) => `assets/properties/${id}/plans/${file}.webp`;

export const floorPlans = {
  '120-e-56th': [
    { floors: range(3, 9), label: 'Typical 3–9', kind: 'Typical floor', src: P('120-e-56th', 'typical-floors-03-09-1960s'), model3d: { box: [0.028, 0.044, 0.951, 0.997] },  note: 'Original typical floor plan, 3rd–9th floors: 63 ft frontage, twin elevators, two stairs and core restrooms. Terraces at the 7th-floor setback.', source: SRC.columbia120e56 },
    { floors: range(10, 12), label: 'Typical 10–12', kind: 'Typical floor', src: P('120-e-56th', 'typical-floors-10-12-1960s'), model3d: { box: [0.042, 0.045, 0.921, 0.998] },  note: 'Original typical floor plan, 10th–12th floors, with street terrace at the 10th floor and rear terrace at the 12th.', source: SRC.columbia120e56 },
    { floors: range(13, 15), label: 'Typical 13–15', kind: 'Typical floor', src: P('120-e-56th', 'typical-floors-13-15-1960s'), model3d: { box: [0.036, -0.157, 0.94, 0.849] },  note: 'Original typical floor plan, 13th–15th floors, under the crown — terraces on three sides.', source: SRC.columbia120e56 },
    { floors: [5], label: 'Suite 510', kind: 'Suite', src: P('120-e-56th', 'floor-05-suite-510'), note: 'Current 5th-floor layout with Suite 510 (620 RSF) shaded off the common corridor.', source: SRC.loopnet120e56 },
    { floors: [7], label: 'Suite 740', kind: 'Test fit', src: P('120-e-56th', 'floor-07-suite-740'), note: 'Suite 740 test fit (1,275 SF): reception, meeting room, private office and seven workstations.', source: SRC.loopnet120e56 },
    { floors: [9], label: 'Suite 900', kind: 'Test fit', src: P('120-e-56th', 'floor-09-suite-900'), note: 'Suite 900 medical test fit (1,247 SF): reception, waiting, consultation, two exam rooms and lab/pantry.', source: SRC.loopnet120e56 },
    { floors: [10], label: 'Suite 1040 · office', kind: 'Test fit', src: P('120-e-56th', 'floor-10-suite-1040-office'), note: 'Suite 1040 test fit 1 (1,521 SF): three meeting rooms, reception, office and pantry.', source: SRC.loopnet120e56 },
    { floors: [10], label: 'Suite 1040 · medical', kind: 'Test fit', src: P('120-e-56th', 'floor-10-suite-1040-medical'), note: 'Suite 1040 test fit 2 (1,521 SF): two consultation rooms, four exam rooms, reception and waiting.', source: SRC.loopnet120e56 },
  ],
  '10-e-38th': [
    { floors: [3], label: '3rd floor', kind: 'Full floor', src: P('10-e-38th', 'floor-03'), model3d: { rot: 1, box: [0.035, 0.025, 0.856, 0.974] },  note: 'Full floor of ≈5,250 SF, offered as office/retail. Largely open loft with column grid; three elevators, stair and restrooms along the core wall.', source: SRC.loopnet10e38 },
    { floors: [8], label: '8th floor', kind: 'Full floor', src: P('10-e-38th', 'floor-08'), model3d: { rot: 1, box: [0.038, 0.024, 0.919, 0.974] },  note: 'Full floor of ≈5,250 SF, built out with offices along the 38th Street windows, internal rooms and open work area.', source: SRC.loopnet10e38 },
    { floors: [10], label: '10th floor', kind: 'Full floor', src: P('10-e-38th', 'floor-10'), model3d: { rot: 1, box: [0.038, 0.026, 0.912, 0.974] },  note: 'Full floor of ≈5,250 SF in open-loft condition, with restrooms at the core.', source: SRC.loopnet10e38 },
    { floors: [11], label: '11th floor', kind: 'Full floor', src: P('10-e-38th', 'floor-11'), model3d: { rot: 1, box: [0.038, 0.025, 0.919, 0.974] },  note: 'Full floor of ≈5,250 SF with perimeter offices and an open centre.', source: SRC.loopnet10e38 },
  ],
  '34-09-queens-blvd': [
    { floors: [1], label: 'Corner store', kind: 'Suite', src: P('34-09-queens-blvd', 'floor-01-corner-store'), note: 'Ground-floor corner retail, 8,556 SF: 55 ft on Queens Blvd, 111 ft on 34th St, private loading dock.', source: SRC.loopnetQB },
    { floors: [4], label: 'Suite 402', kind: 'Suite', src: P('34-09-queens-blvd', 'floor-04-suite-402'), note: '4th floor with the new 4,800 SF division (Suite 402) shaded; freight elevator and shared WC on 34th Street.', source: SRC.loopnetQB },
  ],
  '7225-n-mona-lisa': [
    { floors: [1], label: 'Ground floor', kind: 'Site plan', src: P('7225-n-mona-lisa', 'floor-01-site-plan'), note: 'Ground-floor site plan: Bayada HealthCare suites and Suite 101 (2,170 SF) off the lobby, parking all round.', source: SRC.monaLisa },
    { floors: [1], label: 'Suite 101', kind: 'Suite', src: P('7225-n-mona-lisa', 'floor-01-suite-101'), note: 'Suite 101 (2,170 SF), directly off the ground-floor lobby, with windows on three sides.', source: SRC.monaLisa },
    { floors: [2], label: '2nd floor', kind: 'Full floor', src: P('7225-n-mona-lisa', 'floor-02-plate'), note: 'Second-floor plate with tenant suites (Spencer Construction, Gentle Dental, Tetra Tech, Morgan Cohen & Bach, Frost Insurance).', source: SRC.monaLisa },
  ],
  '415-e-university': [
    { floors: [1, 2, 3], label: 'Jr 1 bed · 440 SF', kind: 'Unit', src: P('415-e-university', 'unit-jr-1-bedroom-440sf'), note: 'Junior one-bedroom, one bath, 440 SF.', source: SRC.link4th },
    { floors: [1, 2, 3], label: '1 bed · 520 SF', kind: 'Unit', src: P('415-e-university', 'unit-1-bedroom-520sf'), note: 'One-bedroom, one bath, 520 SF.', source: SRC.link4th },
    { floors: [1, 2, 3], label: '2 bed · 754 SF', kind: 'Unit', src: P('415-e-university', 'unit-2-bedroom-754sf'), note: 'Two-bedroom, one bath, 754 SF.', source: SRC.link4th },
  ],
};

export const plansFor = (id) => floorPlans[id] ?? [];
