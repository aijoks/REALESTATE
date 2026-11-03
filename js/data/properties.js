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
  {
    id: '115-e-23rd',
    address: '115 E 23rd Street',
    city: 'New York, NY 10010',
    neighborhood: 'Gramercy / Flatiron',
    crossStreets: 'Between Park Ave South & Lexington Ave',
    status: 'For Lease',
    uses: ['Office', 'Retail'],
    headline: '',
    description:
      'A 12-story classical office building on East 23rd Street, steps from Park Avenue South and ' +
      'Madison Square Park. A three-story limestone base with a full-height retail frontage supports ' +
      'a cream-brick shaft of generous windows, crowned by a rosette frieze and cornice.',
    // Public listings (LoopNet, CommercialSearch, LiquidSpace) give 12 stories, built 1913,
    // ~160 ft tall; size is listed as 93,680 SF or 72,000 SF depending on the source.
    stats: [
      { label: 'Stories', value: '12' },
      { label: 'Built', value: '1913' },
      { label: 'Building size', value: '±93,680 SF' },
      { label: 'Height', value: '±160 ft' },
    ],
    highlights: [
      'Half a block from Park Avenue South and Madison Square Park',
      'Full-width ground-floor retail frontage on East 23rd Street',
      'Bright floors with windows across the full frontage',
      'Furnished lounge and work café',
    ],
    tenants: [
      { name: 'Professional Physical Therapy', floor: '2nd', kind: 'Medical' },
      { name: 'Kung Fu Tea', floor: 'Ground', kind: 'Retail' },
    ],
    // SAMPLE availability — floor numbers match the 3D model's floors.
    availability: [
      { floor: 1, suite: 'Retail', sf: 2287, use: 'Retail + basement', rent: 'Upon request' },
      { floor: 6, suite: 'Full floor', sf: 7400, use: 'Office', rent: '$55 / SF' },
      { floor: 9, suite: '9W', sf: 3600, use: 'Office', rent: '$56 / SF' },
      { floor: 11, suite: 'Full floor', sf: 7400, use: 'Office', rent: '$58 / SF' },
    ],
    photos: [
      { src: 'assets/properties/115-e-23rd/facade.jpg', caption: 'Facade on East 23rd Street', focus: 'center 45%' },
      { src: 'assets/properties/115-e-23rd/street-angle.jpg', caption: 'Looking northwest toward Madison Square' },
      { src: 'assets/properties/115-e-23rd/lounge.jpg', caption: 'Furnished lounge and work café' },
    ],
    cover: 'assets/properties/115-e-23rd/facade.jpg',
    model: {
      glb: null,
      procedural: {
        generator: 'classicOffice',
        floors: 12,
        width: 21, // metres of street frontage (~70 ft)
        depth: 30,
        flag: ['OFFICE', 'SPACE', 'FOR LEASE'],
      },
      // Front faces south onto 23rd St, so the streetscape is mirrored to put
      // Park Avenue South on the viewer's left. 23rd St is wide and two-way.
      site: {
        id: 'e23-parksouth', street: 'E 23 St', mirror: true, streetTwoWay: true, road: 17, walk: 5,
        avenue: { kind: 'parkSouth', name: 'Park Av S', eastLine: 52 },
      },
      tour: {
        avenue: {
          label: 'From Park Avenue South', pos: [-66.5, 1.7, 28.5], target: [-4, 15, 17], fov: 62,
          targets: [[-9.5, 8, 16], [-9.5, 24, 16], [-9.5, 40, 16]],
        },
        labels: {
          'front-west': 'Southeast corner', west: 'East side', 'rear-west': 'Northeast corner',
          east: 'West side', crown: 'Cornice & rosettes',
        },
      },
      hotspots: [
        { id: 'entrance', label: 'Lobby entrance', text: 'Office lobby at No. 115, with a second entrance at No. 117.', at: [0.13, 0.06, 'front'] },
        { id: 'retail', label: 'Street retail', text: '2,287 SF retail space plus basement, alongside Kung Fu Tea.', at: [0.51, 0.04, 'front'] },
        { id: 'second', label: '2nd floor', text: 'Full-width glass on the 2nd floor (Professional Physical Therapy).', at: [0.5, 0.15, 'front'] },
        { id: 'shaft', label: 'Office floors', text: 'Seven windows per floor across the cream-brick shaft.', at: [0.8, 0.55, 'front'] },
        { id: 'crown', label: 'Rosette frieze', text: 'Classical frieze with six rosettes beneath the cornice.', at: [0.5, 0.97, 'front'] },
      ],
    },
  },
  {
    id: '133-w-21st',
    address: '133 W 21st Street',
    city: 'New York, NY 10011',
    neighborhood: 'Chelsea / Flatiron',
    crossStreets: 'Between Sixth Ave & Seventh Ave',
    status: 'For Lease',
    uses: ['Office', 'Retail'],
    headline: '',
    description:
      'A turn-of-the-century loft building on West 21st Street, a short walk from Sixth Avenue. A rusticated ' +
      'stone base with a carved entrance and corbelled cornice supports a grey-tan brick shaft of four wide ' +
      'bays, each with four windows per floor, finished with ornamented capitals and a deep cornice.',
    // Stories counted from the facade; size from a PropertyShark neighbour table (unverified).
    stats: [
      { label: 'Stories', value: '12' },
      { label: 'Building size', value: '±115,900 SF' },
      { label: 'Frontage', value: '4 bays · ±100 ft' },
      { label: 'Style', value: 'Loft · stone base' },
    ],
    highlights: [
      'Short walk to Sixth Avenue and the 23rd Street subway',
      'Sixteen windows across every floor',
      'Rusticated stone base with carved entrance',
      'Neighbours include the School of Visual Arts',
    ],
    tenants: [{ name: 'School of Visual Arts', floor: '—', kind: 'Education' }],
    // SAMPLE availability — floor numbers match the 3D model's floors.
    availability: [
      { floor: 5, suite: 'Full floor', sf: 9600, use: 'Office', rent: '$54 / SF' },
      { floor: 8, suite: '8E', sf: 4800, use: 'Office', rent: '$55 / SF' },
      { floor: 11, suite: 'Full floor', sf: 9600, use: 'Office', rent: '$58 / SF' },
    ],
    photos: [
      { src: 'assets/properties/133-w-21st/upper-facade.jpg', caption: 'Ornate upper floors and cornice', focus: 'center 40%' },
      { src: 'assets/properties/133-w-21st/street.jpg', caption: 'West 21st Street', focus: 'center 60%' },
    ],
    cover: 'assets/properties/133-w-21st/upper-facade.jpg',
    model: {
      glb: null,
      procedural: { generator: 'ladiesMile', floors: 12, width: 30, depth: 29, banner: ['SVA', 'NYC'] },
      // Faces south onto 21st St with Sixth Avenue to the east (viewer's right),
      // which is the streetscape's default orientation, so no mirroring.
      site: { id: 'w21-sixth', street: 'W 21 St', avenue: { kind: 'fifth', name: '6 Av', eastLine: 75 } },
      tour: {
        avenue: { label: 'From Sixth Avenue', pos: [87, 1.7, 24.3], target: [12, 16, 17], fov: 62 },
        labels: {
          'front-west': 'Southeast corner', west: 'East side', 'rear-west': 'Northeast corner',
          east: 'West side', crown: 'Capitals & cornice',
        },
      },
      hotspots: [
        { id: 'entrance', label: 'Lobby entrance', text: 'Carved stone entrance in the west bay.', at: [0.14, 0.06, 'front'] },
        { id: 'retail', label: 'Street retail', text: 'Shopfronts across three bays of the stone base.', at: [0.6, 0.05, 'front'] },
        { id: 'cornice', label: 'Corbelled cornice', text: 'Brackets and lion-head bosses crown the three-storey base.', at: [0.38, 0.29, 'front'] },
        { id: 'floors', label: 'Office floors', text: 'Four wide bays, four windows each, on every floor.', at: [0.8, 0.55, 'front'] },
        { id: 'crown', label: 'Capitals & cornice', text: 'Ornamented pier capitals and a deep cornice on the top floors.', at: [0.5, 0.95, 'front'] },
      ],
    },
  },
  {
    id: '102-w-38th',
    address: '102 W 38th Street',
    city: 'New York, NY 10018',
    neighborhood: 'Garment District',
    crossStreets: 'Between Sixth Ave & Seventh Ave',
    status: 'For Lease',
    uses: ['Office', 'Retail'],
    headline: '',
    description:
      'A Beaux-Arts loft building on West 38th Street, steps from Sixth Avenue and Bryant Park. A limestone ' +
      'base with a carved entrance carries a recessed bronze-brown centre bay of wide windows between light ' +
      'stone piers, topped by arched attic windows and a deep bracketed cornice. Managed by First Pioneer Properties.',
    // Size from a CommercialSearch listing (42,000 SF); storeys counted from the facade.
    stats: [
      { label: 'Stories', value: '10' },
      { label: 'Building size', value: '±42,000 SF' },
      { label: 'Typical floor', value: '±4,200 SF' },
      { label: 'Style', value: 'Beaux-Arts loft' },
    ],
    highlights: [
      'Steps from Sixth Avenue, Bryant Park and Herald Square',
      'Four wide windows per floor in the centre bay',
      'Limestone entrance with carved brackets',
      'Street-level retail on West 38th Street',
    ],
    tenants: [{ name: 'B&Q Trimmings', floor: 'Ground', kind: 'Retail' }],
    // SAMPLE availability — floor numbers match the 3D model's floors.
    availability: [
      { floor: 4, suite: 'Full floor', sf: 4200, use: 'Office', rent: '$48 / SF' },
      { floor: 7, suite: 'Full floor', sf: 4200, use: 'Office', rent: '$50 / SF' },
    ],
    photos: [
      { src: 'assets/properties/102-w-38th/facade.jpg', caption: 'Facade on West 38th Street', focus: 'center 62%' },
      { src: 'assets/properties/102-w-38th/plaque.jpg', caption: 'Managed by First Pioneer Properties' },
    ],
    cover: 'assets/properties/102-w-38th/facade.jpg',
    model: {
      glb: null,
      procedural: { generator: 'narrowLoft', floors: 10, width: 12.5, depth: 30 },
      // Faces north onto 38th St with Sixth Avenue to the east (viewer's left),
      // so the streetscape is mirrored; Sixth Avenue traffic runs north.
      site: {
        id: 'w38-sixth', street: 'W 38 St', facing: 'north', mirror: true,
        avenue: { kind: 'fifth', name: '6 Av', eastLine: 26, heading: -Math.PI / 2 },
      },
      tour: {
        avenue: {
          label: 'From Sixth Avenue', pos: [-38, 1.7, 24.3], target: [-3, 15, 17], fov: 62,
          targets: [[-5.2, 8, 16], [-5.2, 22, 16], [-5.2, 34, 16]],
        },
        crownLabel: 'Attic & cornice',
      },
      hotspots: [
        { id: 'entrance', label: 'Lobby entrance', text: 'No. 102 entrance with carved console brackets and pediment.', at: [0.1, 0.07, 'front'] },
        { id: 'retail', label: 'Street retail', text: 'B&Q Trimmings — trims, rhinestones, feathers and beads.', at: [0.68, 0.06, 'front'] },
        { id: 'bay', label: 'Centre bay', text: 'Recessed bronze-brown bay with four windows on every floor.', at: [0.5, 0.5, 'front'] },
        { id: 'cornice', label: 'Attic & cornice', text: 'Arched attic windows under a deep bracketed cornice.', at: [0.5, 0.96, 'front'] },
      ],
    },
  },
  {
    id: '8-w-36th',
    address: '8 W 36th Street',
    city: 'New York, NY 10018',
    neighborhood: 'Midtown South',
    crossStreets: 'Between Fifth Ave & Sixth Ave',
    status: 'For Lease',
    uses: ['Office', 'Retail'],
    headline: '',
    description:
      'A 12-story boutique office building on West 36th Street, a few doors from Fifth Avenue and the ' +
      'Gorham Building. Built in 1910 and renovated in 2022, its grey stone facade frames a wide bay of ' +
      'black-framed windows on every floor, above a dark granite base with a restaurant at grade.',
    // LoopNet: 12 stories, built 1910, renovated 2022, 35,000 SF, ~3,460 SF floors
    // (PropertyShark lists 30,776 SF).
    stats: [
      { label: 'Stories', value: '12' },
      { label: 'Built', value: '1910 · renovated 2022' },
      { label: 'Building size', value: '±35,000 SF' },
      { label: 'Typical floor', value: '±3,460 SF' },
    ],
    highlights: [
      'Half a block from Fifth Avenue, near the Empire State Building',
      'Four large windows across every floor',
      'Renovated in 2022',
      'Restaurant and lobby at street level',
    ],
    tenants: [],
    // SAMPLE availability — floor numbers match the 3D model's floors.
    availability: [
      { floor: 5, suite: 'Full floor', sf: 3460, use: 'Office', rent: '$52 / SF' },
      { floor: 9, suite: 'Full floor', sf: 3460, use: 'Office', rent: '$54 / SF' },
    ],
    photos: [
      { src: 'assets/properties/8-w-36th/street.jpg', caption: 'West 36th Street, looking toward Fifth Avenue', focus: 'center 40%' },
      { src: 'assets/properties/8-w-36th/lobby.jpg', caption: 'Ground-floor interior' },
    ],
    cover: 'assets/properties/8-w-36th/street.jpg',
    model: {
      glb: null,
      procedural: { generator: 'stoneBay', floors: 12, width: 10.5, depth: 30.5, garageH: 11 },
      // Faces north onto 36th St with Fifth Avenue to the east (viewer's left),
      // so the streetscape is mirrored.
      site: {
        id: 'w36-fifth', street: 'W 36 St', facing: 'north', mirror: true,
        avenue: { kind: 'fifth', name: '5 Av', eastLine: 43 },
      },
      tour: {
        avenue: {
          label: 'From Fifth Avenue', pos: [-56, 1.7, 24.3], target: [-3, 16, 17], fov: 62,
          targets: [[-4.2, 8, 16], [-4.2, 24, 16], [-4.2, 38, 16]],
        },
        westLabel: 'West side · banner',
        // Keep the garage visible below the banner on the side-wall view.
        fades: { west: [[5.4, 20, 11], [5.4, 32, 11], [5.4, 26, 4]] },
        crownLabel: 'Window bay & parapet',
      },
      hotspots: [
        { id: 'entrance', label: 'Lobby entrance', text: 'No. 8 entrance under a granite canopy.', at: [0.75, 0.06, 'front'] },
        { id: 'retail', label: 'Restaurant', text: 'Restaurant behind the dark granite storefront.', at: [0.28, 0.05, 'front'] },
        { id: 'bay', label: 'Window bay', text: 'Four black-framed windows across every office floor.', at: [0.5, 0.55, 'front'] },
        { id: 'banner', label: 'First Pioneer banner', text: 'The west wall rises above the neighbouring garage.', at: [0.78, 0.5, 'right'] },
      ],
    },
  },
  {
    id: '12-e-44th',
    address: '12 E 44th Street',
    city: 'New York, NY 10017',
    neighborhood: 'Midtown · Grand Central',
    crossStreets: 'Between Fifth Ave & Madison Ave',
    status: 'For Lease',
    uses: ['Office', 'Retail'],
    headline: '',
    description:
      'A seven-story loft building on East 44th Street, steps from Fifth Avenue and a short walk to Grand ' +
      'Central. A grand arched storefront and carved stone second floor support five floors of pale glazed ' +
      'brick with large windows, finished with a corbelled brick cornice.',
    // Size from a PropertyShark neighbour table (unverified); storeys counted from the facade.
    stats: [
      { label: 'Stories', value: '7' },
      { label: 'Building size', value: '±17,700 SF' },
      { label: 'Typical floor', value: '±2,500 SF' },
      { label: 'Style', value: 'Loft · arched base' },
    ],
    highlights: [
      'Half a block from Fifth Avenue; short walk to Grand Central',
      'Large windows across every floor',
      'Arched double-height storefront',
      'Bright open floors',
    ],
    tenants: [
      { name: 'Delicacy', floor: 'Ground', kind: 'Retail' },
      { name: 'Skin Spa New York', floor: '2nd', kind: 'Wellness' },
    ],
    // SAMPLE availability — floor numbers match the 3D model's floors.
    availability: [
      { floor: 4, suite: 'Full floor', sf: 2500, use: 'Office', rent: '$56 / SF' },
      { floor: 6, suite: 'Full floor', sf: 2500, use: 'Office', rent: '$58 / SF' },
    ],
    photos: [
      { src: 'assets/properties/12-e-44th/facade.jpg', caption: 'Facade on East 44th Street', focus: 'center 55%' },
      { src: 'assets/properties/12-e-44th/interior.jpg', caption: 'Open floor with large street windows' },
    ],
    cover: 'assets/properties/12-e-44th/facade.jpg',
    model: {
      glb: null,
      procedural: { generator: 'archLoft', floors: 7, width: 7.6, depth: 31 },
      // Faces north onto 44th St; Fifth Avenue is to the west, the
      // streetscape's default orientation.
      site: { id: 'e44-fifth', street: 'E 44 St', facing: 'north', avenue: { kind: 'fifth', name: '5 Av', eastLine: 42 } },
      tour: {
        avenue: { label: 'From Fifth Avenue', pos: [57, 1.7, 25.3], target: [4, 12, 18], fov: 62 },
        crownLabel: 'Corbelled cornice',
        streetDist: 36, // shorter building: start closer
      },
      hotspots: [
        { id: 'arch', label: 'Arched storefront', text: 'Double-height arch with a gridded glass fan (Delicacy).', at: [0.5, 0.14, 'front'] },
        { id: 'second', label: '2nd floor', text: 'Carved stone floor with three windows (Skin Spa).', at: [0.2, 0.34, 'front'] },
        { id: 'floors', label: 'Office floors', text: 'Three large windows per floor in pale glazed brick.', at: [0.8, 0.65, 'front'] },
        { id: 'cornice', label: 'Corbelled cornice', text: 'A row of small brick arches under a stone coping.', at: [0.5, 0.97, 'front'] },
      ],
    },
  },
  {
    id: '370-w-51st',
    address: '370 W 51st Street',
    city: 'New York, NY 10019',
    neighborhood: "Hell's Kitchen",
    crossStreets: 'Corner of Ninth Avenue',
    status: 'Residential',
    uses: ['Residential', 'Retail'],
    headline: '',
    description:
      "A six-story pre-war walk-up on the corner of West 51st Street and Ninth Avenue in Hell's Kitchen, " +
      'built in 1920. Twenty-five rental apartments sit above ground-floor retail that wraps the corner, ' +
      'a short walk from the Theater District and Restaurant Row.',
    // CityRealty / Corcoran: 1920, 6 floors, 25 rental units; PropertyShark: 12,432 SF
    // (Compass lists 5 stories / 26 units).
    stats: [
      { label: 'Stories', value: '6' },
      { label: 'Built', value: '1920' },
      { label: 'Apartments', value: '25 rentals' },
      { label: 'Building size', value: '±12,400 SF' },
    ],
    highlights: [
      'Corner of West 51st Street and Ninth Avenue',
      'Twenty-five rental apartments over ground-floor retail',
      'Retail frontage on both 51st Street and Ninth Avenue',
      "Steps from the Theater District and Hell's Kitchen dining",
    ],
    tenants: [{ name: 'GQ Sushi', floor: 'Ground', kind: 'Restaurant' }],
    availability: [],
    photos: [
      { src: 'assets/properties/370-w-51st/corner.jpg', caption: 'Corner of West 51st Street and Ninth Avenue', focus: 'center 45%' },
    ],
    cover: 'assets/properties/370-w-51st/corner.jpg',
    model: {
      glb: null,
      procedural: { generator: 'walkup', floors: 6, width: 12, depth: 17 },
      // Faces north onto 51st St; Ninth Avenue (one-way south) runs along the
      // building's west wall. Low-rise neighbourhood.
      site: {
        id: 'w51-ninth', street: 'W 51 St', facing: 'north', streetDir: 'west', lowRise: true,
        avenue: { kind: 'fifth', name: '9 Av', eastLine: 6.02 },
      },
      tour: {
        avenue: {
          label: 'From Ninth Avenue', pos: [19, 1.7, -21], target: [6, 10, 2], fov: 62,
          targets: [[6.3, 5, 0], [6.3, 13, 0]],
        },
        westLabel: 'Ninth Avenue side',
        crownLabel: 'Parapet & fire escapes',
        streetDist: 40,
      },
      hotspots: [
        { id: 'retail', label: 'Corner retail', text: 'GQ Sushi wraps the corner of 51st Street and Ninth Avenue.', at: [0.8, 0.12, 'front'] },
        { id: 'entrance', label: 'Residential entrance', text: 'Entrance to the 25 apartments upstairs, on 51st Street.', at: [0.1, 0.08, 'front'] },
        { id: 'avenue', label: 'Ninth Avenue side', text: 'Fire escapes and the vertical NETWORK sign on the avenue.', at: [0.25, 0.55, 'right'] },
        { id: 'floors', label: 'Apartments', text: 'Five residential floors above the shops.', at: [0.4, 0.6, 'front'] },
      ],
    },
  },
];

export function getProperty(id) {
  return properties.find((p) => p.id === id);
}
