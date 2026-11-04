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
      'An approximately 55,000 square foot loft office building located in Midtown South in Manhattan. ' +
      'Centrally located between Madison and Fifth Avenues, the building is walking distance to Grand Central, ' +
      'Penn Station, Bryant Park and Times Square. Individual floors are approximately 5,250 square feet, ' +
      'providing a great full floor branding opportunity for tenants. Amenities include an attended lobby, two ' +
      'automatic passenger elevators and a freight elevator. Notable tenants include Evergreen on 38th, ' +
      'Stephan & Co., Opal Financial and Dermalogica.',
    // Public listings (Crexi, Office Freedom) give 1916 and ~68,000 SF; one database
    // lists 11 floors / 45 m. The model uses 11 storeys at loft floor heights.
    stats: [
      { label: 'Stories', value: '11' },
      { label: 'Built', value: '1916' },
      { label: 'Building size', value: '±55,000 SF' },
      { label: 'Typical floor', value: '±5,250 SF' },
    ],
    highlights: [
      'Half a block from Fifth Avenue; short walk to Bryant Park and Grand Central',
      'Hardwood floors, high ceilings and exposed ductwork',
      'Eleven oversized windows across each floor',
      'Shared roof terrace with Empire State Building views',
    ],
    tenants: [
      { name: 'Evergreen on 38th', floor: '—', kind: 'Restaurant' },
      { name: 'Stephan & Co.', floor: '—', kind: 'Office' },
      { name: 'Opal Financial', floor: '—', kind: 'Office' },
      { name: 'Dermalogica', floor: '—', kind: 'Office' },
    ],
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
  {
    id: '34-09-queens-blvd',
    address: '34-09 Queens Blvd',
    city: 'Long Island City, NY 11101',
    neighborhood: 'Long Island City / Sunnyside',
    crossStreets: 'Full block · 34th St to 35th St',
    status: 'For Lease',
    uses: ['Retail', 'Industrial', 'Office'],
    headline: '',
    description:
      'A block-long commercial and warehouse property on Queens Boulevard between 34th and 35th Streets. ' +
      'A four-story pilastered brick building lines the boulevard with street-level retail and loft space ' +
      'above, backed by a warehouse with loading docks, on a lot of about 2.3 acres. Its rooftop billboard ' +
      'is a Queens Boulevard landmark, steps from the 7 train.',
    // PropertyShark: 4 stories, 149,121 SF, fireproof warehouse, ~100,000 SF lot,
    // two buildings; listing sites: ~160,000 SF on a 2.3-acre lot.
    stats: [
      { label: 'Stories', value: '4' },
      { label: 'Building size', value: '±150,000 SF' },
      { label: 'Lot', value: '±2.3 acres' },
      { label: 'Frontage', value: 'Full block on Queens Blvd' },
    ],
    highlights: [
      'Full-block frontage on Queens Boulevard, 34th to 35th Street',
      'Street-level retail with high visibility',
      'Rear warehouse with loading docks',
      'Rooftop billboard; steps from the 7 train at 33rd St–Rawson St',
    ],
    tenants: [
      { name: 'Pin Framing', floor: 'Ground', kind: 'Retail' },
      { name: 'K2 Boxing Club', floor: 'Ground', kind: 'Fitness' },
      { name: 'N.Y. Auto Brokerage (TLC Insurance)', floor: 'Ground', kind: 'Services' },
    ],
    availability: [],
    photos: [
      { src: 'assets/properties/34-09-queens-blvd/corner-35th.jpg', caption: 'Queens Blvd at 35th Street', focus: 'center 55%' },
      { src: 'assets/properties/34-09-queens-blvd/corner-34th.jpg', caption: 'Queens Blvd at 34th Street' },
      { src: 'assets/properties/34-09-queens-blvd/rear-warehouse.jpg', caption: 'Rear warehouse and loading docks' },
    ],
    cover: 'assets/properties/34-09-queens-blvd/corner-35th.jpg',
    model: {
      glb: null,
      procedural: { generator: 'industrial', floors: 4, width: 85, frontDepth: 40, rearDepth: 40 },
      // Faces south onto Queens Blvd; 35th St (+x, east) is the side street
      // modelled as the avenue, 34th St is added along the west end.
      site: {
        id: 'qb-34-35', street: 'Queens Blvd', facing: 'south', streetTwoWay: true, road: 34, walk: 5,
        blockSpacing: 170, lowRise: true,
        avenue: { kind: 'narrow', name: '35 St', eastLine: 42.52 },
      },
      tour: {
        avenue: {
          label: 'Corner of 35th St', pos: [66, 1.7, 86], target: [30, 9, 34], fov: 60,
          targets: [[40, 6, 40.5], [40, 11, 40.5], [43, 9, 30]],
        },
        labels: {
          'front-west': 'Southeast corner', west: '35th Street side', 'rear-west': 'Northeast corner',
          back: 'Rear warehouse & docks', east: '34th Street side', crown: 'Rooftop billboard',
        },
        streetDist: 70,
        streetY: 3, // stand under the elevated 7 train, as on Queens Blvd
      },
      hotspots: [
        { id: 'retail', label: 'Street retail', text: 'Shops between every pilaster along Queens Boulevard.', at: [0.55, 0.12, 'front'] },
        { id: 'corner34', label: 'Pin Framing', text: 'Corner retail at 34th Street (34-09).', at: [0.06, 0.15, 'front'] },
        { id: 'billboard', label: 'Rooftop billboard', text: 'Steel billboard frame with a First Pioneer panel.', at: [0.3, 1.6, 'roof'] },
        { id: 'warehouse', label: 'Rear warehouse', text: 'Warehouse and loading docks behind the retail block.', at: [0.3, 0.5, 'back'] },
      ],
    },
  },
  {
    id: '250-canal',
    address: '250 Canal Street',
    city: 'New York, NY 10013',
    neighborhood: 'Chinatown / SoHo',
    crossStreets: 'Southwest corner of Lafayette Street',
    status: 'Leased',
    uses: ['Retail'],
    headline: '',
    description:
      'A one-story corner retail pavilion at Canal and Lafayette Streets, leased to TD Bank. Full-height ' +
      'glass on both street frontages, a wraparound signage band and a rooftop billboard give it some of ' +
      'the highest visibility on Canal Street, steps from the Canal Street subway station.',
    // Traded.co loan record: 4,144 SF (TD Bank refinance, 2023); one storey per photos.
    stats: [
      { label: 'Stories', value: '1' },
      { label: 'Building size', value: '±4,100 SF' },
      { label: 'Frontage', value: 'Canal & Lafayette corner' },
      { label: 'Tenant', value: 'TD Bank' },
    ],
    highlights: [
      'Prominent corner of Canal Street and Lafayette Street',
      'Full-height glass on two street frontages',
      'Rooftop billboard over one of downtown’s busiest intersections',
      'At the Canal Street subway station (J/Z/N/Q/R/W/6)',
    ],
    tenants: [{ name: 'TD Bank', floor: 'Ground', kind: 'Bank' }],
    availability: [],
    photos: [
      { src: 'assets/properties/250-canal/corner.jpg', caption: 'Canal Street at Lafayette Street', focus: 'center 45%' },
      { src: 'assets/properties/250-canal/banking-hall.jpg', caption: 'Banking hall' },
    ],
    cover: 'assets/properties/250-canal/corner.jpg',
    model: {
      glb: null,
      procedural: { generator: 'pavilion', floors: 1, width: 21, depth: 19 },
      // Faces north onto Canal St; Lafayette St (one-way north) runs along the
      // east wall, so the streetscape is mirrored.
      site: {
        id: 'canal-lafayette', street: 'Canal St', facing: 'north', mirror: true, streetTwoWay: true, road: 18, walk: 5, lowRise: true,
        avenue: { kind: 'fifth', name: 'Lafayette St', eastLine: 10.52, heading: -Math.PI / 2 },
      },
      tour: {
        avenue: {
          label: 'Canal & Lafayette corner', pos: [-31, 1.7, 31], target: [-6, 7, 6], fov: 60,
          targets: [[-10, 4, 10], [-6, 4, 10], [-10, 4, 4], [-4, 14, 4]],
        },
        labels: { east: 'Lafayette Street side', crown: 'Rooftop billboard' },
        streetDist: 34,
      },
      hotspots: [
        { id: 'bank', label: 'TD Bank', text: 'Full-service TD Bank branch, open 7 days.', at: [0.6, 0.3, 'front'] },
        { id: 'corner', label: 'Corner frontage', text: 'Glass and green signage wrap the Canal & Lafayette corner.', at: [0.05, 0.6, 'front'] },
        { id: 'billboard', label: 'Rooftop billboard', text: 'Billboard structure facing the intersection.', at: [0.4, 1.7, 'roof'] },
      ],
    },
  },
  {
    id: '2100-directors-row',
    address: '2100 Directors Row',
    city: 'Orlando, FL 32809',
    neighborhood: 'Orlando Central Park',
    crossStreets: 'South Orlando industrial district',
    status: 'Net Lease',
    uses: ['Net Lease', 'Industrial', 'Office'],
    headline: '',
    description:
      'A single-tenant net-leased distribution facility in Orlando Central Park, south Orlando’s established ' +
      'industrial district. A long single-storey warehouse with loading docks and a fenced yard is fronted by ' +
      'a two-storey office with a glass entrance, on a site with generous surface parking.',
    // No public size record found for this address; figures intentionally omitted.
    stats: [
      { label: 'Lease type', value: 'Net lease' },
      { label: 'Use', value: 'Distribution + office' },
      { label: 'Market', value: 'Orlando, FL' },
      { label: 'Submarket', value: 'Orlando Central Park' },
    ],
    highlights: [
      'Single-tenant net lease',
      'Warehouse with loading docks and a fenced yard',
      'Two-storey front office with a glass entrance',
      'Ample on-site parking in an established industrial park',
    ],
    tenants: [{ name: 'AmerisourceBergen', floor: '—', kind: 'Distribution' }],
    availability: [],
    photos: [
      { src: 'assets/properties/2100-directors-row/front.jpg', caption: 'Office entrance and warehouse', focus: 'center 60%' },
    ],
    cover: 'assets/properties/2100-directors-row/front.jpg',
    model: {
      glb: null,
      procedural: { generator: 'flex', floors: 2, width: 32, depth: 110, tenant: 'AmerisourceBergen', number: '2100' },
      // Suburban business park: parking lots, fenced yard and low warehouses
      // instead of a city street grid.
      site: { id: 'orlando-central-park', facing: 'north', suburban: true },
      tour: {
        avenue: { label: 'Entrance & parking', pos: [-34, 2.2, 92], target: [0, 5, 50], fov: 55 },
        labels: { 'front-west': 'Office corner', west: 'Landscaped side', east: 'Loading docks & yard', 'rear-west': 'Rear corner', crown: 'Office entrance' },
        streetDist: 55,
        radius: 70, // long, low building: keep corner views close
        omit: ['base'],
      },
      hotspots: [
        { id: 'entrance', label: 'Office entrance', text: 'Two-storey glass entry with a blue awning (No. 2100).', at: [0.62, 0.5, 'front'] },
        { id: 'docks', label: 'Loading docks', text: 'Covered dock doors along the fenced side yard.', at: [0.7, 0.4, 'left'] },
        { id: 'warehouse', label: 'Warehouse', text: 'Long single-storey distribution space with high windows.', at: [0.35, 0.8, 'left'] },
      ],
    },
  },
  {
    id: '7877-e-snyder',
    address: '7877 E Snyder Rd',
    city: 'Tucson, AZ 85750',
    neighborhood: 'Catalina Foothills',
    crossStreets: 'Snyder Rd · Tucson, Arizona',
    status: 'Net Lease',
    uses: ['Net Lease', 'Retail'],
    headline: '',
    description:
      'A free-standing single-tenant Walgreens in the Catalina Foothills of northeast Tucson, beneath the ' +
      'Santa Catalina Mountains. A corner entrance tower, tile-roofed arcades on both frontages and a ' +
      'surrounding parking field make this a classic net-leased pharmacy property.',
    stats: [
      { label: 'Lease type', value: 'Net lease' },
      { label: 'Tenant', value: 'Walgreens' },
      { label: 'Use', value: 'Pharmacy retail' },
      { label: 'Market', value: 'Tucson, AZ' },
    ],
    highlights: [
      'Single-tenant net-leased Walgreens',
      'Free-standing corner building with an entrance tower',
      'On-site parking wrapping the store',
      'Catalina Foothills, northeast Tucson',
    ],
    tenants: [{ name: 'Walgreens', floor: 'Ground', kind: 'Pharmacy' }],
    availability: [],
    photos: [
      { src: 'assets/properties/7877-e-snyder/front.jpg', caption: 'Corner entrance and arcades', focus: 'center 55%' },
    ],
    cover: 'assets/properties/7877-e-snyder/front.jpg',
    model: {
      glb: null,
      procedural: { generator: 'drugstore', floors: 1, width: 40, depth: 32 },
      site: { id: 'tucson-snyder', facing: 'north', suburban: true, desert: true },
      tour: {
        avenue: { label: 'Corner entrance', pos: [42, 2.5, 46], target: [14, 5, 10], fov: 55 },
        labels: { 'front-west': 'Corner entrance tower', west: 'East side arcade', east: 'West side', crown: 'Entrance tower' },
        streetDist: 46,
        radius: 58,
        omit: ['base'],
      },
      hotspots: [
        { id: 'entrance', label: 'Entrance tower', text: 'Arched corner entrance under the red W window.', at: [0.5, 0.5, 'corner'] },
        { id: 'arcade', label: 'Arcade', text: 'Tile-roofed arcade shading the storefront windows.', at: [0.3, 0.35, 'front'] },
        { id: 'pharmacy', label: 'Pharmacy', text: 'Pharmacy and 1-hour photo along the side arcade.', at: [0.4, 0.45, 'right'] },
      ],
    },
  },
  {
    id: '415-e-university',
    address: '415 E University Blvd',
    city: 'Tucson, AZ 85705',
    neighborhood: 'The Link at 4th Ave · near the University of Arizona',
    crossStreets: 'University Blvd at 4th Avenue',
    status: 'Residential',
    uses: ['Residential'],
    headline: '',
    description:
      'The Link at 4th Ave is a garden-style apartment community on University Boulevard, steps from ' +
      'Fourth Avenue’s shops and restaurants and a short walk to the University of Arizona. White stucco ' +
      'buildings with open walkways surround a fenced pool courtyard with a shaded ramada, lounge deck and ' +
      'lawn, with renovated apartments and on-site parking.',
    stats: [
      { label: 'Property', value: 'The Link at 4th Ave' },
      { label: 'Type', value: 'Garden apartments' },
      { label: 'Buildings', value: '2–3 stories' },
      { label: 'Market', value: 'Tucson, AZ' },
    ],
    highlights: [
      'Steps from Fourth Avenue and the University of Arizona',
      'Resort-style pool, ramada and lounge deck',
      'Lawn with hammocks and outdoor seating',
      'Renovated apartments with stainless appliances',
    ],
    tenants: [],
    availability: [],
    photos: [
      { src: 'assets/properties/415-e-university/pool.jpg', caption: 'Pool courtyard', focus: 'center 60%' },
      { src: 'assets/properties/415-e-university/aerial.jpg', caption: 'Aerial view toward downtown Tucson' },
      { src: 'assets/properties/415-e-university/living-room.jpg', caption: 'Renovated apartment' },
      { src: 'assets/properties/415-e-university/sign.jpg', caption: 'Entrance on University Blvd' },
    ],
    cover: 'assets/properties/415-e-university/pool.jpg',
    model: {
      glb: null,
      procedural: { generator: 'garden', floors: 3, width: 64, depth: 52 },
      site: { id: 'tucson-university', facing: 'north', suburban: true, desert: true },
      tour: {
        avenue: { label: 'Pool courtyard', pos: [26, 2.0, 9.5], target: [2, 3.5, -8], fov: 62 },
        labels: { 'front-west': 'Entrance & parking', west: 'East side', east: 'West side', 'rear-west': 'Rear corner', crown: 'Rooftops & mountains' },
        streetDist: 48,
        radius: 75,
        omit: ['base'],
      },
      hotspots: [
        { id: 'pool', label: 'Pool courtyard', text: 'Fenced pool with lounge deck and a tiled ramada.', at: [0, 0, 'pool'] },
        { id: 'sign', label: 'The Link at 4th Ave', text: 'Entrance and monument sign on University Blvd.', at: [0.44, 0.3, 'front'] },
        { id: 'walkways', label: 'Apartments', text: 'Open walkways and stairs serve each building.', at: [0.3, 0.6, 'front'] },
      ],
    },
  },
  {
    id: 'saguaro-vista',
    address: 'Saguaro Vista Shopping Center',
    city: 'Tucson, AZ',
    neighborhood: 'Northeast Tucson · Catalina Foothills',
    crossStreets: 'Grocery-anchored neighbourhood center',
    status: 'Retail',
    uses: ['Retail'],
    headline: '',
    description:
      'A grocery-anchored neighbourhood shopping center in northeast Tucson, beneath the Santa Catalina ' +
      'Mountains. Fry’s Food & Drug anchors the center, with a pharmacy, bakery-deli and in-store services, ' +
      'complemented by a free-standing restaurant pad (Potosino Mexican Food, No. 7865) and a large surface ' +
      'parking field.',
    stats: [
      { label: 'Type', value: 'Grocery-anchored center' },
      { label: 'Anchor', value: 'Fry’s Food & Drug' },
      { label: 'Pad', value: 'Potosino · No. 7865' },
      { label: 'Market', value: 'Tucson, AZ' },
    ],
    highlights: [
      'Anchored by Fry’s Food & Drug (Kroger)',
      'Free-standing restaurant pad with drive-by visibility',
      'Large surface parking field',
      'Santa Catalina Mountain views',
    ],
    tenants: [
      { name: 'Fry’s Food & Drug', floor: 'Anchor', kind: 'Grocery' },
      { name: 'Potosino Mexican Food', floor: 'Pad', kind: 'Restaurant' },
      { name: 'Burger King', floor: 'Pad', kind: 'Restaurant' },
      { name: 'Chase', floor: 'In-line', kind: 'Bank' },
      { name: 'Simply Smiles Dentistry', floor: 'In-line', kind: 'Medical' },
    ],
    availability: [],
    photos: [
      { src: 'assets/properties/saguaro-vista/frys.jpg', caption: 'Fry’s Food & Drug anchor', focus: 'center 45%' },
      { src: 'assets/properties/saguaro-vista/potosino-pad.jpg', caption: 'Potosino Mexican Food pad (No. 7865)' },
      { src: 'assets/properties/saguaro-vista/frys-night.jpg', caption: 'Fry’s entrance at night' },
      { src: 'assets/properties/saguaro-vista/burger-king.jpg', caption: 'Burger King pad (No. 7880)' },
      { src: 'assets/properties/saguaro-vista/chase-pharmacy-night.jpg', caption: 'Chase and Fry’s pharmacy at night' },
      { src: 'assets/properties/saguaro-vista/simply-smiles.jpg', caption: 'Simply Smiles Dentistry' },
    ],
    cover: 'assets/properties/saguaro-vista/frys.jpg',
    model: {
      glb: null,
      procedural: { generator: 'center', floors: 1, width: 110, depth: 55 },
      site: { id: 'tucson-saguaro-vista', facing: 'north', suburban: true, desert: true },
      tour: {
        avenue: { label: 'Potosino pad', pos: [-56, 2.0, 70], target: [-77, 4, 47], fov: 55 },
        labels: { 'front-west': 'Fry’s entrance', west: 'East side', east: 'West side', 'rear-west': 'Rear corner', crown: 'Fry’s gable' },
        streetDist: 62,
        radius: 95,
        omit: ['base'],
      },
      hotspots: [
        { id: 'frys', label: 'Fry’s Food & Drug', text: 'Grocery anchor with pharmacy and bakery-deli.', at: [0.5, 0.75, 'front'] },
        { id: 'pad', label: 'Potosino pad', text: 'Free-standing restaurant pad, No. 7865.', at: [0, 0, 'pad'] },
        { id: 'deli', label: 'Bakery-Deli', text: 'Bakery and deli department on the east wing.', at: [0.72, 0.5, 'front'] },
      ],
    },
  },
  {
    id: '1-parrott',
    address: '1 Parrott Drive',
    city: 'Shelton, CT 06484',
    neighborhood: 'Fairfield County',
    crossStreets: 'Shelton, Connecticut',
    status: 'Flex / Industrial',
    uses: ['Industrial', 'Office'],
    headline: '',
    description:
      'A single-story flex building in Shelton, Connecticut, combining about 39,500 SF of office with about ' +
      '62,500 SF of industrial and warehouse space. A long glass-fronted office facade with a landscaped ' +
      'drop-off drive leads to a block-and-metal industrial wing, with on-site parking throughout.',
    // LoopNet / Crexi / ConnectCRE: ~102,000 SF, one story, built 1976, renovated 2002;
    // office ~39,500 SF + industrial ~62,500 SF.
    stats: [
      { label: 'Stories', value: '1' },
      { label: 'Built', value: '1976 · renovated 2002' },
      { label: 'Building size', value: '±102,000 SF' },
      { label: 'Office / industrial', value: '±39,500 / ±62,500 SF' },
    ],
    highlights: [
      'Flex building with office and industrial space',
      'Glass-fronted office facade and lobby',
      'Landscaped entry drive and on-site parking',
      'Fairfield County, near Route 8',
    ],
    tenants: [{ name: 'CARA', floor: 'Ground', kind: 'Office' }],
    availability: [],
    photos: [
      { src: 'assets/properties/1-parrott/entrance.jpg', caption: 'Office facade and entrance drive', focus: 'center 55%' },
      { src: 'assets/properties/1-parrott/east-wing.jpg', caption: 'Industrial wing entrance' },
    ],
    cover: 'assets/properties/1-parrott/entrance.jpg',
    model: {
      glb: null,
      procedural: { generator: 'labflex', floors: 1, width: 120, depth: 75, sign: 'CARA' },
      site: { id: 'shelton-parrott', facing: 'north', suburban: true, noFence: true },
      tour: {
        avenue: { label: 'Entrance drive', pos: [24, 2.2, 66], target: [-4, 3, 36], fov: 60 },
        labels: { 'front-west': 'Industrial wing', west: 'East side', east: 'West side', 'rear-west': 'Rear corner', crown: 'CARA entrance' },
        streetDist: 70,
        radius: 95,
        omit: ['base'],
      },
      hotspots: [
        { id: 'lobby', label: 'Office entrance', text: 'Glazed lobby behind stone planters and the entry drive.', at: [0.56, 0.7, 'front'] },
        { id: 'office', label: 'Office wing', text: 'Glass curtain-wall bays between round pilasters.', at: [0.2, 0.6, 'front'] },
        { id: 'wing', label: 'Industrial wing', text: 'Block wing with a ribbon of windows and its own entrance.', at: [0.86, 0.6, 'front'] },
      ],
    },
  },
  {
    id: 'el-dorado-square',
    address: '1200 N El Dorado Place',
    city: 'Tucson, AZ 85715',
    neighborhood: 'El Dorado Square · East Tucson',
    crossStreets: 'Office park off Wilmot Rd',
    status: 'For Lease',
    uses: ['Office'],
    headline: '',
    description:
      'El Dorado Square is a nine-building Spanish Colonial office campus in east Tucson. Two-story stucco ' +
      'buildings with red clay-tile roofs, wrought-iron balconies and arched loggias are set around mature, ' +
      'landscaped grounds, entered through brick-and-iron gates along a brick-paved drive.',
    // CommercialSearch / CommercialCafe: built 1981, ~65,000–70,000 SF campus; nine buildings
    // (Tucson.com / BizTucson).
    stats: [
      { label: 'Buildings', value: '9 · two-story' },
      { label: 'Built', value: '1981' },
      { label: 'Campus size', value: '±65,000–70,000 SF' },
      { label: 'Style', value: 'Spanish Colonial' },
    ],
    highlights: [
      'Nine-building office campus with landscaped grounds',
      'Spanish Colonial architecture with clay-tile roofs',
      'Suites from small offices to ±5,000 SF',
      'Gated entry and brick-paved drive',
    ],
    tenants: [],
    availability: [],
    photos: [
      { src: 'assets/properties/el-dorado-square/entrance.jpg', caption: 'Entrance on El Dorado Place', focus: 'center 60%' },
      { src: 'assets/properties/el-dorado-square/building-d.jpg', caption: 'Building D' },
    ],
    cover: 'assets/properties/el-dorado-square/entrance.jpg',
    model: {
      glb: null,
      procedural: { generator: 'mission', floors: 2, width: 70, depth: 60 },
      site: { id: 'tucson-el-dorado', facing: 'north', suburban: true, noFence: true },
      tour: {
        avenue: { label: 'Entrance gate', pos: [52, 1.8, 58], target: [38, 2.5, 36], fov: 58 },
        labels: { 'front-west': 'Entrance corner', west: 'East buildings', east: 'West buildings', 'rear-west': 'Rear corner', crown: 'Tower & loggia' },
        streetDist: 46,
        radius: 70,
        omit: ['base'],
      },
      hotspots: [
        { id: 'gate', label: 'Entrance', text: 'Brick pillars, iron fence and the El Dorado Square sign.', at: [0, 0, 'gate'] },
        { id: 'tower', label: 'Building D tower', text: 'Arched loggia tower with a small balcony.', at: [0.5, 0.95, 'front'] },
        { id: 'balconies', label: 'Offices', text: 'Second-floor offices with wrought-iron balconies.', at: [0.7, 0.5, 'front'] },
      ],
    },
  },
  {
    id: '7225-n-mona-lisa',
    address: '7225 N Mona Lisa Rd',
    city: 'Tucson, AZ 85741',
    neighborhood: 'Mona Lisa Plaza · Northwest Tucson',
    crossStreets: 'NW corner of Mona Lisa Rd & Ina Rd',
    status: 'For Lease',
    uses: ['Office', 'Medical'],
    headline: '',
    description:
      'Mona Lisa Plaza is a two-story mission-revival office building at the northwest corner of Mona Lisa ' +
      'and Ina Roads, one block west of the Foothills Mall. A curved parapet, deep arched entrances and a ' +
      'shaded ground-floor arcade front professional and medical suites, with surface parking around the building.',
    stats: [
      { label: 'Stories', value: '2' },
      { label: 'Type', value: 'Office / medical' },
      { label: 'Location', value: 'Mona Lisa & Ina Rd' },
      { label: 'Market', value: 'Tucson, AZ' },
    ],
    highlights: [
      'One block west of the Foothills Mall',
      'Professional and medical office suites',
      'Arched entrances and shaded arcade',
      'Surface parking on site',
    ],
    tenants: [{ name: 'Gentle Dental', floor: '—', kind: 'Medical' }],
    availability: [],
    photos: [
      { src: 'assets/properties/7225-n-mona-lisa/corner.jpg', caption: 'Mona Lisa Plaza', focus: 'center 50%' },
    ],
    cover: 'assets/properties/7225-n-mona-lisa/corner.jpg',
    model: {
      glb: null,
      procedural: { generator: 'monalisa', floors: 2, width: 46, depth: 30, tenantSign: 'gentle dental', number: '7225' },
      site: { id: 'tucson-mona-lisa', facing: 'north', suburban: true, noFence: true, trees: false },
      tour: {
        avenue: { label: 'Corner view', pos: [38, 1.7, 36], target: [6, 5.5, 6], fov: 60 },
        labels: { 'front-west': 'Corner entrance', west: 'East side arcade', east: 'West wing', 'rear-west': 'Rear corner', crown: 'Mission parapet' },
        streetDist: 46,
        radius: 52,
        omit: ['base'],
      },
      hotspots: [
        { id: 'parapet', label: 'Mission parapet', text: 'Curved parapet with red coping and the Gentle Dental sign.', at: [0.45, 0.95, 'front'] },
        { id: 'entry', label: 'Arched entrance', text: 'Two-story arched entry recess with upper glazing.', at: [0.72, 0.45, 'front'] },
        { id: 'arcade', label: 'Arcade', text: 'Shaded ground-floor arcade along the suites.', at: [0.6, 0.18, 'right'] },
      ],
    },
  },
];

export function getProperty(id) {
  return properties.find((p) => p.id === id);
}
