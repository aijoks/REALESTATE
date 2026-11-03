// Property catalogue. Add a new object here to list another building.
//
// `model` drives the 3D viewer:
//   - `glb`: optional path to a real scanned / AI-reconstructed model
//     (photogrammetry, Gaussian-splat export, image-to-3D). If the file
//     exists it is loaded instead of the procedural model.
//   - `procedural`: parameters for the built-in generator, modelled from
//     the listing photos.
//
// NOTE: figures marked SAMPLE are placeholders — replace with verified
// numbers from the landlord / leasing team before going live.

export const company = {
  name: 'First Pioneer Properties',
  tagline: 'Manhattan commercial space, seen from every angle.',
  phone: '(212) 555-0142', // SAMPLE
  email: 'leasing@example.com', // SAMPLE
};

// Notable tenants shown in the scrolling logo band on the home page.
// Round seals and stacked logos read small at strip height, so they get a boost.
const LOGO_SIZE = { starbucks: 1.3, arizona: 1.3, sva: 1.55 };
export const notableTenants = [
  ['lirr', 'MTA Long Island Rail Road'], ['walgreens', 'Walgreens'], ['calypso', 'Calypso St. Barth'],
  ['oberoi', 'The Oberoi Group'], ['leggiadro', 'Leggiadro'], ['dunkin', "Dunkin' Donuts"], ['subway', 'Subway'],
  ['starbucks', 'Starbucks Coffee'], ['frys', "Fry's Food Stores"], ['arizona', 'State of Arizona'],
  ['sva', 'School of Visual Arts'], ['nyc', 'The City of New York'], ['pomellato', 'Pomellato'],
  ['att', 'AT&T'], ['dermalogica', 'Dermalogica'],
].map(([file, name]) => ({ name, logo: `assets/tenants/${file}.png`, size: LOGO_SIZE[file] }));

export const properties = [
  {
    id: '120-e-56th',
    address: '120 E 56th Street',
    city: 'New York, NY 10022',
    neighborhood: 'Midtown East',
    crossStreets: 'Between Park Ave & Lexington Ave',
    status: 'For Lease',
    uses: ['Office', 'Medical', 'Retail'],
    headline: '',
    description:
      'An approximately 86,000 square foot office building located in Manhattan’s plaza district. ' +
      'Impressive turn-key offices with beautiful terraces and fantastic views. Amenities include ' +
      'renovated lobby, modernized elevators, flexible lease terms, operable windows, usable terraces, ' +
      '24/7 access, concierge attended lobby, and direct electric. Notable tenants include Truman’s ' +
      'Gentleman’s Groomers, Montebello Italian Restaurant, and Pomellato.',
    // Public listings (Metro Manhattan, Showcase, Compass) report 1926, Rosario Candela,
    // ~86,000 SF; story count is listed as 15 or 16 depending on the source.
    stats: [
      { label: 'Stories', value: '15' },
      { label: 'Built', value: '1926' },
      { label: 'Building size', value: '±86,000 SF' },
      { label: 'Architect', value: 'Rosario Candela' },
    ],
    highlights: [
      'Steps from the 59th St / Lexington Ave subway hub',
      'Windows on three exposures from the projecting bays',
      'Renovated lobby with attended entrance',
      'Neighbors include Park Avenue towers and flagship retail',
    ],
    tenants: [
      { name: "Truman's Gentlemen's Groomers", floor: 'Ground', kind: 'Retail' },
      { name: 'MiRano Ristorante', floor: 'Ground', kind: 'Restaurant' },
      { name: '22 Day Spa', floor: '2nd', kind: 'Wellness' },
    ],
    // SAMPLE availability — floor numbers match the 3D model's floors.
    availability: [
      { floor: 1, suite: 'Retail B', sf: 1100, use: 'Retail', rent: 'Upon request' },
      { floor: 4, suite: 'Full floor', sf: 5600, use: 'Medical', rent: '$58 / SF' },
      { floor: 7, suite: 'Full floor', sf: 5600, use: 'Office', rent: '$54 / SF' },
      { floor: 8, suite: '8A', sf: 2700, use: 'Office', rent: '$55 / SF' },
      { floor: 11, suite: 'Full floor', sf: 5600, use: 'Office', rent: '$56 / SF' },
      { floor: 14, suite: 'Full floor', sf: 5400, use: 'Office', rent: '$62 / SF' },
    ],
    photos: [
      { src: 'assets/properties/120-e-56th/street-view.webp', caption: 'Looking east along E 56th Street' },
      { src: 'assets/properties/120-e-56th/storefront.webp', caption: 'Retail base & lobby entrance' },
      { src: 'assets/properties/120-e-56th/interior-open-plan.webp', caption: 'Open-plan office with maple floors & glass offices' },
      { src: 'assets/properties/120-e-56th/interior-window-bay.webp', caption: 'Window bay with French doors between glass offices' },
    ],
    cover: 'assets/properties/120-e-56th/street-view.webp',
    model: {
      glb: null, // e.g. 'assets/properties/120-e-56th/model.glb'
      procedural: {
        generator: 'prewarBrick',
        floors: 15,
        width: 18.3, // metres of street frontage (~60 ft)
        depth: 30.5, // metres deep (~100 ft)
        pavilionWidth: 4.4,
        pavilionProjection: 1.6,
        // Mirrors the vinyl banner on the building's west wall.
        leaseBanner: {
          brand: 'FIRST PIONEER',
          brandSub: 'REALTY',
          headline: ['SPACE', 'FOR', 'LEASE'],
          uses: ['Office', 'Medical', 'Retail'],
          contactLines: ['Exclusive', 'Leasing Agents'],
          web: 'www.FPR.nyc',
          phone: '212.594.7272',
        },
      },
      // Streetscape: neighbours + the avenue (eastLine = x of its east building line).
      site: { id: 'e56-park', street: 'E 56 St', avenue: { kind: 'park', name: 'Park Av', eastLine: 56 } },
      tour: {
        avenue: { label: 'From Park Avenue', pos: [80, 1.7, 25.75], target: [8, 13, 20.25], fov: 62 },
        westLabel: 'West side · lease banner',
      },
      hotspots: [
        { id: 'entrance', label: 'Lobby entrance', text: 'Attended lobby behind the black portal, with elevator access to all floors.', at: [0.5, 0.075, 'front'] },
        { id: 'retail', label: 'Street retail', text: "Ground-floor retail: Truman's Gentlemen's Groomers and MiRano Ristorante.", at: [0.2, 0.05, 'front'] },
        { id: 'spa', label: '2nd floor · Wellness', text: '22 Day Spa occupies the 2nd floor behind the five large windows.', at: [0.8, 0.13, 'front'] },
        { id: 'pavilions', label: 'Corner pavilions', text: 'Projecting brick pavilions give corner offices windows on two sides.', at: [0.12, 0.55, 'front'] },
        { id: 'crown', label: 'Limestone crown', text: 'Stone-framed top floors under a shaped Flemish gable.', at: [0.5, 0.9, 'front'] },
        { id: 'roof', label: 'Roof & water tank', text: 'Timber water tank and stair bulkhead on the roof.', at: [0.75, 1.12, 'roof'] },
        { id: 'rear', label: 'Rear facade', text: 'Rear windows face the mid-block yard; fire escape on the south wall.', at: [0.15, 0.5, 'back'] },
      ],
    },
  },
  {
    id: '10-e-38th',
    address: '10 E 38th Street',
    city: 'New York, NY 10016',
    neighborhood: 'Murray Hill',
    crossStreets: 'Between Fifth Ave & Madison Ave',
    status: 'For Lease',
    uses: ['Office', 'Retail'],
    headline: 'Loft office floors half a block from Fifth Avenue',
    description:
      'A buff-brick loft building on East 38th Street, a few steps from Fifth Avenue. Wide floor plates ' +
      'with original hardwood floors, high ceilings, exposed ductwork and eleven oversized windows across ' +
      'every floor, plus a furnished shared roof terrace looking out to the Empire State Building.',
    // Public listings (Crexi, Office Freedom) give 1916 and ~68,000 SF; one database
    // lists 11 floors / 45 m. The model uses 11 storeys at loft floor heights.
    stats: [
      { label: 'Stories', value: '11' },
      { label: 'Built', value: '1916' },
      { label: 'Building size', value: '±68,000 SF' },
      { label: 'Class', value: 'B · Loft office' },
    ],
    highlights: [
      'Half a block from Fifth Avenue; short walk to Bryant Park and Grand Central',
      'Hardwood floors, high ceilings and exposed ductwork',
      'Eleven oversized windows across each floor',
      'Shared roof terrace with Empire State Building views',
    ],
    tenants: [],
    // SAMPLE availability — floor numbers match the 3D model's floors.
    availability: [
      { floor: 2, suite: 'Full floor', sf: 6000, use: 'Office / Showroom', rent: '$52 / SF' },
      { floor: 5, suite: 'Full floor', sf: 6000, use: 'Office', rent: '$50 / SF' },
      { floor: 7, suite: '7S', sf: 3100, use: 'Office', rent: '$51 / SF' },
      { floor: 9, suite: 'Full floor', sf: 6000, use: 'Office', rent: '$53 / SF' },
    ],
    photos: [
      // `focus` = CSS object-position used when the photo is cropped into a box.
      { src: 'assets/properties/10-e-38th/street-angle.webp', caption: 'Looking west along E 38th Street', focus: 'center 100%' },
      { src: 'assets/properties/10-e-38th/facade.webp', caption: 'Buff-brick facade over the stone base', focus: 'center 74%' },
      { src: 'assets/properties/10-e-38th/loft-floor.webp', caption: 'Open loft floor with hardwood and exposed ductwork' },
      { src: 'assets/properties/10-e-38th/loft-floor-2.webp', caption: 'Column-free bays along the street windows' },
      { src: 'assets/properties/10-e-38th/roof-terrace.webp', caption: 'Shared roof terrace facing the Empire State Building' },
    ],
    cover: 'assets/properties/10-e-38th/facade.webp',
    model: {
      glb: null,
      procedural: {
        generator: 'buffLoft',
        floors: 11,
        width: 17.4, // metres of street frontage (~57 ft)
        depth: 30.5, // metres deep (~100 ft)
        flag: ['OFFICE', 'SPACE', 'FOR LEASE'],
        address: '10',
      },
      site: { id: 'e38-fifth', street: 'E 38 St', avenue: { kind: 'fifth', name: '5 Av', eastLine: 38.7 } },
      tour: {
        avenue: { label: 'From Fifth Avenue', pos: [56, 1.7, 25.75], target: [7, 12, 20.25], fov: 62 },
        omit: ['crown'],
        extra: [
          { id: 'terrace', label: 'Roof terrace', pos: [-3, 55, 25], target: [0.5, 46.5, 6], fov: 48 },
          {
            id: 'esb', label: 'Terrace view · Empire State', pos: [-4, 47.4, 10], target: [15.4, 76.1, -39], fov: 62,
            fade: 'street', targets: [[133, 320, -335], [133, 160, -335]],
          },
        ],
      },
      hotspots: [
        { id: 'entrance', label: 'Lobby entrance', text: 'Lobby behind the stone surround with "10" over the door.', at: [0.15, 0.06, 'front'] },
        { id: 'retail', label: 'Street retail', text: 'Restaurant and shop at grade; sidewalk shed currently in place.', at: [0.62, 0.05, 'front'] },
        { id: 'second', label: '2nd floor', text: 'Three oversized gridded windows across the stone base.', at: [0.5, 0.15, 'front'] },
        { id: 'facade', label: 'Loft floors', text: 'Eleven windows per floor in a 3 · 5 · 3 rhythm; high ceilings inside.', at: [0.8, 0.6, 'front'] },
        { id: 'terrace', label: 'Roof terrace', text: 'Shared terrace with lounge seating, bistro tables and skyline views.', at: [0.35, 1.06, 'roof'] },
        { id: 'rear', label: 'Rear facade', text: 'Rear windows face a small mid-block yard.', at: [0.3, 0.5, 'back'] },
      ],
    },
  },
];

export function getProperty(id) {
  return properties.find((p) => p.id === id);
}
