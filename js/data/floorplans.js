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
//   model3d: how the drawing sits on the 3D model — see
//            js/viewer/floorplan3d.js. Plans with it are laid into the
//            building as a cut-away floor when that storey or tab is picked,
//            and furnished from js/data/furnishings.js (keyed by src, or by
//            model3d.layout). A suite plan's cut-away is its whole floor:
//            model3d.src names the floor's drawing and the layout composites
//            the suite's own drawing into it. Picking a floor shows its most
//            specific plan (a suite or test fit before a shared typical).

const SRC = {
  loopnet10e38: { name: 'LoopNet listing — architect’s plans by Tuller Feld McNealus (Mar 2023)', url: 'https://www.loopnet.com/Listing/10-E-38th-St-New-York-NY/35969074/' },
  loopnet120e56: { name: 'LoopNet listing — First Pioneer Realty / Tuller Feld McNealus', url: 'https://www.loopnet.com/Listing/120-E-56th-St-New-York-NY/5778430/' },
  columbia120e56: { name: 'Columbia University, Avery Library — NY Real Estate Brochure Collection (Julien J. Studley, Inc.)', url: 'https://dlc.library.columbia.edu/nyre/cul:p2ngf1vjx8' },
  loopnetQB: { name: 'LoopNet listing — First Pioneer Realty', url: 'https://www.loopnet.com/Listing/34-09-34-11-Queens-Blvd-Long-Island-City-NY/6606809/' },
  monaLisa: { name: 'Mona Lisa Plaza leasing brochure — Paul Ash Commercial Real Estate', url: 'https://images.loopnet.ca/d2/VeUrlIlFVapMSx138i5-XQ7OIym1DvJ71b1T2pyMUQg/Mona%20Lisa%20Plaza%20Brochure.pdf' },
  owner115: { name: 'First Pioneer Properties — 115 E 23rd Street floor plans', url: 'https://firstpioneerrealty.net/listings/' },
  metro12e44: { name: 'Metro Manhattan Office Space — 12 East 44th Street, entire 7th floor', url: 'https://www.metro-manhattan.com/listing/12-east-44th-street-entire-7th-floor/' },
  link4th: { name: 'The Link at 4th Ave — published unit plans (Zumper)', url: 'https://www.zumper.com/apartment-buildings/p4817/the-link-at-4th-ave-west-university-tucson-az' },
};

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const P = (id, file) => `assets/properties/${id}/plans/${file}.webp`;

// 120 E 56th St: the typical drawings every cut-away of floors 3–12 is built
// on (suite plans composite their own drawing into them), and its layouts.
const E56 = {
  t39: { src: P('120-e-56th', 'typical-floors-03-09-1960s'), box: [0.02649, -0.0066, 0.95204, 0.9959] },
  t1012: { src: P('120-e-56th', 'typical-floors-10-12-1960s'), box: [0.04223, -0.0065, 0.92166, 0.9945] },
};
const L = (name) => `120-e-56th/${name}`;

export const floorPlans = {
  // The typicals' cut-aways show each floor as it is let today — suites off the
  // common corridor, from the 5th-floor plan and the test fits (see
  // js/data/layouts-120-e-56th.js) — at true scale (the drawing scaled
  // uniformly onto the model's 19.8 m front; the rear beyond the drawn walls
  // is open roof). Suite and test-fit plans lay their own drawing into the
  // whole floor, at its real place.
  '120-e-56th': [
    { floors: range(3, 9), label: 'Typical 3–9', kind: 'Typical floor', src: P('120-e-56th', 'typical-floors-03-09-1960s'), model3d: { ...E56.t39, layout: (f) => (f === 5 ? L('floor-5') : f >= 7 ? L('floors-7-9') : L('floors-3-6')) }, note: 'Original typical floor plan, 3rd–9th floors: 63 ft frontage, twin elevators, two stairs and core restrooms; the rear corner bays become terraces at the 7th-floor setback. Today these floors are let as suites off the common corridor — the 3D shows that division (from the 5th-floor plan and the test fits).', source: SRC.columbia120e56 },
    { floors: range(10, 12), label: 'Typical 10–12', kind: 'Typical floor', src: P('120-e-56th', 'typical-floors-10-12-1960s'), model3d: { ...E56.t1012, layout: (f) => L(`floor-${f}`) }, note: 'Original typical floor plan, 10th–12th floors, with the rear terrace at the 10th floor and the street terrace at the 12th. The 3D shows the floors divided into suites as today (Suite 1040 takes the rear east).', source: SRC.columbia120e56 },
    { floors: range(13, 15), label: 'Typical 13–15', kind: 'Typical floor', src: P('120-e-56th', 'typical-floors-13-15-1960s'), model3d: { box: [0.0359, -0.205, 0.9389, 0.8495] }, note: 'Original typical floor plan, 13th–15th floors, under the crown — terraces on three sides.', source: SRC.columbia120e56 },
    { floors: [5], label: 'Suite 510', kind: 'Suite', src: P('120-e-56th', 'floor-05-suite-510'), model3d: { ...E56.t39, layout: L('floor-5-suite-510') }, note: 'Current 5th-floor layout with Suite 510 (620 RSF) shaded off the common corridor.', source: SRC.loopnet120e56 },
    { floors: [7], label: 'Suite 740', kind: 'Test fit', src: P('120-e-56th', 'floor-07-suite-740'), model3d: { ...E56.t39, layout: L('floor-7-suite-740') }, note: 'Suite 740 test fit (1,275 SF): reception, meeting room, private office and seven workstations.', source: SRC.loopnet120e56 },
    { floors: [9], label: 'Suite 900', kind: 'Test fit', src: P('120-e-56th', 'floor-09-suite-900'), model3d: { ...E56.t39, layout: L('floor-9-suite-900') }, note: 'Suite 900 medical test fit (1,247 SF): reception, waiting, consultation, two exam rooms and lab/pantry.', source: SRC.loopnet120e56 },
    { floors: [10], label: 'Suite 1040 · office', kind: 'Test fit', src: P('120-e-56th', 'floor-10-suite-1040-office'), model3d: { ...E56.t1012, layout: L('floor-10-suite-1040-office') }, note: 'Suite 1040 test fit 1 (1,521 SF): three meeting rooms, reception, office and pantry.', source: SRC.loopnet120e56 },
    { floors: [10], label: 'Suite 1040 · medical', kind: 'Test fit', src: P('120-e-56th', 'floor-10-suite-1040-medical'), model3d: { ...E56.t1012, layout: L('floor-10-suite-1040-medical') }, note: 'Suite 1040 test fit 2 (1,521 SF): two consultation rooms, four exam rooms, reception and waiting.', source: SRC.loopnet120e56 },
  ],
  '10-e-38th': [
    { floors: [3], label: '3rd floor', kind: 'Full floor', src: P('10-e-38th', 'floor-03'), model3d: { rot: 1, box: [0.035, 0.025, 0.856, 0.974] },  note: 'Full floor of ≈5,250 SF, offered as office/retail. Largely open loft with column grid; three elevators, stair and restrooms along the core wall.', source: SRC.loopnet10e38 },
    { floors: [8], label: '8th floor', kind: 'Full floor', src: P('10-e-38th', 'floor-08'), model3d: { rot: 1, box: [0.038, 0.024, 0.919, 0.974] },  note: 'Full floor of ≈5,250 SF, built out with offices along the 38th Street windows, internal rooms and open work area.', source: SRC.loopnet10e38 },
    { floors: [10], label: '10th floor', kind: 'Full floor', src: P('10-e-38th', 'floor-10'), model3d: { rot: 1, box: [0.038, 0.026, 0.912, 0.974] },  note: 'Full floor of ≈5,250 SF in open-loft condition, with restrooms at the core.', source: SRC.loopnet10e38 },
    { floors: [11], label: '11th floor', kind: 'Full floor', src: P('10-e-38th', 'floor-11'), model3d: { rot: 1, box: [0.038, 0.025, 0.919, 0.974] },  note: 'Full floor of ≈5,250 SF with perimeter offices and an open centre.', source: SRC.loopnet10e38 },
  ],
  '115-e-23rd': [
    { floors: [4], label: '4th floor', kind: 'Full floor', src: P('115-e-23rd', 'floor-04'), model3d: { rot: 1, box: [0.02, 0.037, 0.938, 0.909] }, note: '4th floor: private offices 401–420 for 1–8 desks, conference room, conference & podcast room, phone booths, lounge and kitchen; two passenger elevators and a freight elevator.', source: SRC.owner115 },
    { floors: [5], label: '5th floor', kind: 'Full floor', src: P('115-e-23rd', 'floor-05'), model3d: { rot: 1, box: [0.024, 0.023, 0.936, 0.918] }, note: '5th floor: enterprise suite, offices 501–510 for 1–11 desks, conference room, lounge & event space, kitchen and phone booths.', source: SRC.owner115 },
  ],
  '12-e-44th': [
    { floors: [7], label: '7th floor', kind: 'Full floor', src: P('12-e-44th', 'floor-07'), model3d: { rot: 3, box: [0.0138, 0.062, 0.938, 0.9413] }, note: 'Entire 7th floor, ≈2,710 SF: elevator opens into reception, large conference room on East 44th Street, two conference rooms, open bullpen, wet pantry and two private restrooms; oversized windows on three sides.', source: SRC.metro12e44 },
  ],
  '34-09-queens-blvd': [
    { floors: [1], label: 'Corner store', kind: 'Suite', src: P('34-09-queens-blvd', 'floor-01-corner-store'), note: 'Ground-floor corner retail, 8,556 SF: 55 ft on Queens Blvd, 111 ft on 34th St, private loading dock.', source: SRC.loopnetQB },
    { floors: [4], label: 'Suite 402', kind: 'Suite', src: P('34-09-queens-blvd', 'floor-04-suite-402'), note: '4th floor with the new 4,800 SF division (Suite 402) shaded; freight elevator and shared WC on 34th Street.', source: SRC.loopnetQB },
  ],
  '7225-n-mona-lisa': [
    // The cut-aways use building-only crops of the brochure drawings (ink re-traced, 2.5×); the
    // model's L-shaped outline (js/viewer/monalisa.js) keeps them off the parking notch.
    { floors: [1], label: 'Ground floor', kind: 'Site plan', src: P('7225-n-mona-lisa', 'floor-01-site-plan'), model3d: { src: P('7225-n-mona-lisa', 'floor-01-building'), box: [0.0398, 0.05, 0.9602, 0.9457] }, note: 'Ground-floor site plan: Bayada HealthCare suites and Suite 101 (2,170 SF) off the lobby, parking all round.', source: SRC.monaLisa },
    { floors: [1], label: 'Suite 101', kind: 'Suite', src: P('7225-n-mona-lisa', 'floor-01-suite-101'), note: 'Suite 101 (2,170 SF), directly off the ground-floor lobby, with windows on three sides.', source: SRC.monaLisa },
    { floors: [2], label: '2nd floor', kind: 'Full floor', src: P('7225-n-mona-lisa', 'floor-02-plate'), model3d: { src: P('7225-n-mona-lisa', 'floor-02-building'), box: [0.0253, -0.0048, 0.978, 0.9635] }, note: 'Second-floor plate with tenant suites (Spencer Construction, Gentle Dental, Tetra Tech, Morgan Cohen & Bach, Frost Insurance).', source: SRC.monaLisa },
  ],
  // No drawing of the restaurant has been published: this one is an
  // illustrative layout drawn for the site from YOON's own gallery photos
  // (bar, stair, banquette dining room, private rooms) on the building's
  // surveyed 10.1 × 27.3 m footprint — the note says so.
  '8-w-36th': [
    { floors: [1], label: 'Ground floor · YOON', kind: 'Full floor', src: P('8-w-36th', 'floor-01-yoon'), model3d: { box: [0.0826, 0.0328, 0.9174, 0.9279] }, note: 'YOON Haeundae Galbi, Korean barbecue (about 70 seats on this floor): host stand and stair to the second-floor dining room, reclaimed-wood bar, butcher-block grill tables between leather banquettes, two private rooms, restrooms and kitchen at the rear; building lobby (No. 8) and elevator on the west side. Illustrative layout drawn from the restaurant’s photos, not a measured plan.', source: { name: 'YOON Haeundae Galbi — gallery (layout illustrative)', url: 'https://www.yoon-nyc.com/gallery' } },
  ],
  '415-e-university': [
    { floors: [1, 2, 3], label: 'Jr 1 bed · 440 SF', kind: 'Unit', src: P('415-e-university', 'unit-jr-1-bedroom-440sf'), note: 'Junior one-bedroom, one bath, 440 SF.', source: SRC.link4th },
    { floors: [1, 2, 3], label: '1 bed · 520 SF', kind: 'Unit', src: P('415-e-university', 'unit-1-bedroom-520sf'), note: 'One-bedroom, one bath, 520 SF.', source: SRC.link4th },
    { floors: [1, 2, 3], label: '2 bed · 754 SF', kind: 'Unit', src: P('415-e-university', 'unit-2-bedroom-754sf'), note: 'Two-bedroom, one bath, 754 SF.', source: SRC.link4th },
  ],
};

export const plansFor = (id) => floorPlans[id] ?? [];
