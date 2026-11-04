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
        // OSM / NYC footprint: 19.8 m frontage (65 ft) x 30.7 m, roof 47 m.
        width: 19.8,
        depth: 30.7,
        floorH: 2.95,
        pavilionWidth: 4.9,
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
      // 56th St is 60 ft (18.3 m) between building lines; Park Av's east
      // building line is 49.7 m west of the building's centre.
      site: { id: 'e56-park', street: 'E 56 St', walk: 4.0, road: 10.3, avenue: { kind: 'park', name: 'Park Av', eastLine: 49.7 } },
      tour: {
        avenue: { label: 'From Park Avenue', pos: [77, 1.7, 24.5], target: [8, 13, 20], fov: 62 },
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
        // OSM / NYC footprint 15.7 m (51.5 ft) x 28.8 m; roof 46.3 m.
        width: 15.7,
        depth: 28.8,
        flag: ['OFFICE', 'SPACE', 'FOR LEASE'],
        address: '10',
      },
      // Mid-block: Fifth Av's east building line is 68.7 m west of the
      // building's centre (Madison's west line 59.5 m east).
      site: { id: 'e38-fifth', street: 'E 38 St', walk: 4.2, avenue: { kind: 'fifth', name: '5 Av', eastLine: 68.7 } },
      tour: {
        avenue: { label: 'From Fifth Avenue', pos: [84, 1.7, 23.9], target: [6, 13, 18.5], fov: 50 },
        omit: ['crown'],
        extra: [
          { id: 'terrace', label: 'Roof terrace', pos: [-3, 55, 25], target: [0.5, 46.5, 6], fov: 48 },
          {
            id: 'esb', label: 'Terrace view · Empire State', pos: [-4, 47.4, 10], target: [19.7, 76, -39], fov: 62,
            fade: 'street', targets: [[163, 320, -336], [163, 160, -336], [163, 90, -336]],
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
        // OSM / NYC footprint 16.8 m (55 ft) x 27.1 m; roof 46.5 m.
        width: 16.8,
        depth: 27.1,
        flag: ['OFFICE', 'SPACE', 'FOR LEASE'],
      },
      // Front faces south onto 23rd St, so the streetscape is mirrored to put
      // Park Avenue South on the viewer's left. 23rd St is wide and two-way.
      site: {
        // 23rd St is 100 ft (31 m) between building lines; Park Av S's east
        // building line is 56.1 m west of the building's centre.
        id: 'e23-parksouth', street: 'E 23 St', mirror: true, streetTwoWay: true, road: 20, walk: 5.5, blockSpacing: 91,
        avenue: { kind: 'parkSouth', name: 'Park Av S', eastLine: 56.1 },
      },
      tour: {
        avenue: {
          label: 'From Park Avenue South', pos: [-70.5, 1.7, 29], target: [-3, 15, 15], fov: 62,
          targets: [[-8.4, 8, 14], [-8.4, 24, 14], [-8.4, 40, 14]],
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
      procedural: { generator: 'ladiesMile', floors: 12, width: 30, depth: 32, banner: ['SVA', 'NYC'] },
      // Faces south onto 21st St with Sixth Avenue to the east (viewer's right),
      // which is the streetscape's default orientation, so no mirroring.
      // Footprint 30 x 32 m, roof 46.6 m (NYC survey via OSM); the Sixth Avenue
      // building line is ~98 m east of the east wall (satellite).
      site: { id: 'w21-sixth', street: 'W 21 St', avenue: { kind: 'fifth', name: '6 Av', eastLine: 113 } },
      tour: {
        avenue: { label: 'From Sixth Avenue', pos: [124, 1.7, 25.8], target: [4, 20, 16], fov: 34 },
        labels: {
          'front-west': 'Southeast corner', west: 'East side', 'rear-west': 'Northeast corner',
          east: 'West side', crown: 'Capitals & cornice',
        },
      },
      hotspots: [
        { id: 'entrance', label: 'Lobby entrance', text: 'Carved stone entrance in the west bay.', at: [0.14, 0.06, 'front'] },
        { id: 'retail', label: 'Street retail', text: 'Shopfronts across three bays of the stone base.', at: [0.6, 0.05, 'front'] },
        { id: 'cornice', label: 'Corbelled cornice', text: 'Brackets and lion-head bosses crown the three-storey base.', at: [0.38, 0.27, 'front'] },
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
      procedural: { generator: 'narrowLoft', floors: 10, width: 12, depth: 30 },
      // Faces north onto 38th St with Sixth Avenue to the east (viewer's left),
      // so the streetscape is mirrored; Sixth Avenue traffic runs north.
      // Footprint 12 x 30 m, roof 32.0 m (NYC survey via OSM); the Sixth Avenue
      // building line is ~17.5 m east of the east wall.
      site: {
        id: 'w38-sixth', street: 'W 38 St', facing: 'north', mirror: true,
        avenue: { kind: 'fifth', name: '6 Av', eastLine: 23.5, heading: -Math.PI / 2 },
      },
      tour: {
        avenue: {
          label: 'From Sixth Avenue', pos: [-35.5, 1.7, 24.3], target: [-3, 14, 17], fov: 62,
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
      procedural: { generator: 'stoneBay', floors: 12, width: 10.1, depth: 27.3, garageH: 11.5 },
      // Faces north onto 36th St with Fifth Avenue to the east (viewer's left),
      // so the streetscape is mirrored. Footprint 10.1 x 27.3 m, roof 34.5 m
      // (NYC survey via OSM); Fifth Avenue is ~48 m east of the east wall.
      site: {
        id: 'w36-fifth', street: 'W 36 St', facing: 'north', mirror: true,
        avenue: { kind: 'fifth', name: '5 Av', eastLine: 53 },
      },
      tour: {
        avenue: {
          label: 'From Fifth Avenue', pos: [-65, 1.7, 22.7], target: [-3, 15, 15.5], fov: 50,
          targets: [[-4, 7, 14.5], [-4, 19, 14.5], [-4, 30, 14.5]],
        },
        // The garage next door is only ~15 m wide, so the default side-wall
        // camera would sit inside No. 16; look at the banner from across
        // 36th St instead, over the garage, as in the photo.
        omit: ['west'],
        extra: [{ id: 'west-banner', label: 'West side · banner', pos: [36, 6, 31], target: [5, 18, 1], fov: 48, hold: 2.5 }],
        // Keep the garage visible below the banner on the side-wall view.
        fades: { 'west-banner': [[5.2, 18, 10], [5.2, 28, 10], [5.2, 24, 4]] },
        crownLabel: 'Window bay & parapet',
      },
      hotspots: [
        { id: 'entrance', label: 'Lobby entrance', text: 'No. 8 entrance under a granite canopy.', at: [0.75, 0.06, 'front'] },
        { id: 'retail', label: 'Restaurant', text: 'Restaurant behind the dark granite storefront.', at: [0.28, 0.05, 'front'] },
        { id: 'bay', label: 'Window bay', text: 'Four black-framed windows across every office floor.', at: [0.5, 0.55, 'front'] },
        { id: 'banner', label: 'First Pioneer banner', text: 'The west wall rises above the neighbouring garage.', at: [0.78, 0.57, 'right'] },
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
      // OSM / NYC footprint: 8.0 m frontage x 27.5 m deep, roof 30.8 m.
      procedural: { generator: 'archLoft', floors: 7, width: 8.0, depth: 27.5 },
      // Faces north onto 44th St; Fifth Avenue is to the west, the
      // streetscape's default orientation. Fifth's east building line is
      // 68 m west of the building (Madison's is 51.6 m east).
      site: { id: 'e44-fifth', street: 'E 44 St', facing: 'north', avenue: { kind: 'fifth', name: '5 Av', eastLine: 72 } },
      tour: {
        avenue: { label: 'From Fifth Avenue', pos: [74, 1.7, 22.5], target: [4, 13, 14], fov: 50 },
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
    tenants: [
      { name: "'ritas", floor: 'Ground', kind: 'Restaurant · Ninth Ave' },
      { name: 'Monkey Thief', floor: 'Ground', kind: 'Bar · 51st St corner' },
      { name: 'Briciola', floor: 'Ground', kind: 'Restaurant · 51st St' },
    ],
    availability: [],
    photos: [
      { src: 'assets/properties/370-w-51st/corner.jpg', caption: 'Corner of West 51st Street and Ninth Avenue', focus: 'center 45%' },
    ],
    cover: 'assets/properties/370-w-51st/corner.jpg',
    model: {
      glb: null,
      // NYC / OSM footprint: 30.7 m along 51st St x 7.7 m on Ninth Ave (the
      // eastern 23 m is 5.8 m deep), roof ~20 m.
      procedural: { generator: 'walkup', floors: 6, width: 30.7, depth: 7.7 },
      // Faces north onto 51st St (18.1 m between building lines); Ninth
      // Avenue (one-way south, 30.5 m) runs along the building's west wall.
      site: {
        id: 'w51-ninth', frontVans: false, street: 'W 51 St', facing: 'north', streetDir: 'west', lowRise: true, walk: 3.75, road: 10.6,
        avenue: { kind: 'fifth', name: '9 Av', eastLine: 15.37 },
      },
      tour: {
        avenue: {
          label: 'Corner of 51st & Ninth', pos: [36, 1.7, 24], target: [9, 9, 0], fov: 62,
          targets: [[15.6, 5, 3.9], [15.6, 14, 3.9], [8, 10, 4.2]],
        },
        westLabel: 'Ninth Avenue side',
        crownLabel: 'Parapet & fire escapes',
        streetDist: 44,
        extra: [
          { id: 'st51', label: '51st Street facade', fade: 'street', pos: [0, 3.4, 20.6], target: [0, 9, 3.85], fov: 74, targets: [[-10, 6, 4.2], [0, 10, 4.2], [10, 14, 4.2]] },
          { id: 'av9', label: "Ninth Avenue facade ('ritas)", fade: 'street', pos: [43, 2, 0.6], target: [15.4, 10, 0.6], fov: 58, targets: [[15.6, 4, 0], [15.6, 12, 0], [15.6, 19, 0]] },
        ],
      },
      hotspots: [
        { id: 'retail', label: 'Monkey Thief', text: 'Bar with a neon monkey mural at the corner of 51st Street.', at: [0.88, 0.12, 'front'] },
        { id: 'briciola', label: 'Briciola', text: 'Italian restaurant with a sidewalk cafe on 51st Street.', at: [0.28, 0.12, 'front'] },
        { id: 'entrance', label: 'Residential entrance', text: 'Entrance to the 25 apartments upstairs, on 51st Street.', at: [0.45, 0.1, 'front'] },
        { id: 'avenue', label: "'ritas", text: "Coral storefront on Ninth Avenue under the corner fire escape.", at: [0.45, 0.12, 'right'] },
        { id: 'floors', label: 'Apartments', text: 'Five residential floors above the shops.', at: [0.6, 0.6, 'front'] },
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
      // Traced from satellite + OSM: 62 m frontage (the full block, 34th to
      // 35th St), roof ~15.5 m; four-storey front block + west wing up 34th St,
      // low dock buildings behind, the rear warehouse reaching the next street
      // north (~152 m deep in all).
      procedural: { generator: 'industrial', floors: 4, width: 62, depth: 152 },
      // Faces south onto Queens Blvd; 35th St (+x, east) is the side street
      // modelled as the avenue, 34th St is added along the west end.
      site: {
        id: 'qb-34-35', street: 'Queens Blvd', facing: 'south', streetTwoWay: true, road: 34, walk: 5,
        blockSpacing: 195.5, lowRise: true,
        avenue: { kind: 'narrow', name: '35 St', eastLine: 31.02 },
      },
      tour: {
        avenue: {
          label: 'Corner of 35th St', pos: [52, 1.7, 92], target: [8, 8.5, 66], fov: 60,
          targets: [[31, 6, 76.5], [31, 11, 76.5], [20, 9, 70]],
        },
        extra: [
          { id: 'warehouse34', label: '34th St docks & rear warehouse', pos: [-44, 2.2, -36], target: [-24, 6, -2], fov: 62 },
          { id: 'billboard', label: 'Rooftop billboard', pos: [24, 28, 92], target: [-17, 22, 52], fov: 50 },
        ],
        radius: 100,
        omit: ['crown'],
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
        { id: 'billboard', label: 'Rooftop billboard', text: 'Steel billboard frame along 34th St with a First Pioneer panel facing east.', at: [0.5, 1.6, 'roof'] },
        { id: 'warehouse', label: 'Loading docks', text: 'Pink loading-dock wing on a parking apron off 34th St, rear warehouse behind.', at: [0.5, 0.45, 'left'] },
      ],
    },
  },
  {
    id: '250-canal',
    address: '250 Canal Street',
    city: 'New York, NY 10013',
    neighborhood: 'Chinatown / SoHo',
    crossStreets: 'Southeast corner of Lafayette Street',
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
      // OSM footprint: 21.8 m on Canal x ~21-23 m on Lafayette, roof 6.7 m.
      procedural: { generator: 'pavilion', floors: 1, width: 21.8, depth: 21 },
      // SE corner of the intersection (OSM + satellite): faces north onto
      // Canal St (30 m between building lines); Lafayette St (one-way south,
      // ~19 m) runs along the west wall — the streetscape's default layout.
      site: {
        id: 'canal-lafayette', street: 'Canal St', facing: 'north', streetTwoWay: true, road: 20, walk: 5, lowRise: true, blockSpacing: 75,
        avenue: { kind: 'narrow', name: 'Lafayette St', eastLine: 10.92 },
      },
      tour: {
        avenue: {
          label: 'Canal & Lafayette corner', pos: [33, 1.7, 31], target: [4, 5.5, 6], fov: 60,
          targets: [[10, 4, 10], [6, 4, 10], [10, 4, 4], [4, 12, 4]],
        },
        labels: { west: 'Lafayette Street side', crown: 'Rooftop billboard' },
        streetDist: 34,
      },
      hotspots: [
        { id: 'bank', label: 'TD Bank', text: 'Full-service TD Bank branch, open 7 days.', at: [0.4, 0.3, 'front'] },
        { id: 'corner', label: 'Corner frontage', text: 'Glass and green signage wrap the Canal & Lafayette corner.', at: [0.95, 0.6, 'front'] },
        { id: 'entrance', label: 'Lafayette St entrance', text: 'No. 250 door, open 7 days.', at: [0.3, 0.35, 'right'] },
        { id: 'billboard', label: 'Rooftop billboard', text: 'Billboard structure facing north up Lafayette Street.', at: [0.6, 1.7, 'roof'] },
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
      // Footprint traced from satellite / OSM / Orange County situs point:
      // ~111 m west front x ~150 m north side, 1969 (~168-213k SF on ~8.5 ac).
      // Local +z = west (office front on the west yard), -x = north (truck
      // docks along Directors Row), +x = south (rail spur).
      procedural: { generator: 'flex', floors: 2, width: 111, depth: 150, tenant: 'AmerisourceBergen', number: '2100' },
      site: { id: 'orlando-central-park', facing: 'west', suburban: true, bare: true },
      tour: {
        avenue: { label: 'Office corner from the drive', pos: [-86, 2.2, 104], target: [-44, 5, 62], fov: 55 },
        labels: { street: 'West yard & office front', roof: 'Aerial over Directors Row' },
        streetDist: 32,
        radius: 120,
        omit: ['base', 'front', 'front-west', 'west', 'rear-west', 'back', 'east', 'crown'],
        extra: [
          { id: 'entrance', label: 'Office entrance', pos: [-24, 2.6, 96], target: [-38, 4.5, 75], fov: 50 },
          { id: 'docks', label: 'Truck docks on Directors Row', pos: [-95, 7, -34], target: [-46, 3, -10], fov: 55 },
          { id: 'east-lot', label: 'East parking lot', pos: [-84, 14, -128], target: [-10, 3, -40], fov: 50 },
          { id: 'aerial-sw', label: 'Aerial from the south-west', pos: [95, 60, 175], target: [0, 0, 0], fov: 50 },
        ],
      },
      hotspots: [
        { id: 'entrance', label: 'Office entrance', text: 'Two-storey glass entry with a blue awning (No. 2100).', at: [0.157, 0.5, 'front'] },
        { id: 'docks', label: 'Truck docks', text: 'Dock-high doors under a canopy along the recessed north wall, facing Directors Row.', at: [0.62, 0.4, 'left'] },
        { id: 'yard', label: 'Building-products yard', text: 'Building-products yard and roll-up doors on the west side.', at: [0.52, 0.6, 'front'] },
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
      procedural: { generator: 'drugstore', floors: 1, width: 41, depth: 35 },
      site: { id: 'tucson-snyder', facing: 'south', suburban: true, desert: true, noSheds: true },
      tour: {
        avenue: { label: 'Corner entrance', pos: [40, 2.2, 25.5], target: [17, 4.8, 13], fov: 58 },
        labels: { 'front-west': 'Corner entrance tower', west: 'East side arcade', 'rear-west': 'Northeast corner', back: 'North side & storage', east: 'West side & drive-thru', crown: 'Entrance tower' },
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
      procedural: { generator: 'garden', floors: 3, width: 90, depth: 120 },
      site: { id: 'tucson-university', facing: 'south', suburban: true, desert: true, noSheds: true },
      tour: {
        avenue: { label: 'Pool courtyard', pos: [2, 3.2, 6], target: [-16, 1.8, 2], fov: 62 },
        labels: { street: 'University Blvd', west: 'Parking & east side', 'rear-west': 'Northeast corner', back: 'North side', crown: 'Entrance on University' },
        extra: [{ id: 'fourth', label: '4th Ave side', pos: [-60, 4.5, 48], target: [-38, 4, 12], fov: 55 }],
        streetDist: 14,
        streetY: 5,
        radius: 55,
        omit: ['base', 'front', 'front-west', 'east'],
      },
      hotspots: [
        { id: 'pool', label: 'Pool courtyard', text: 'Fenced pool with lounge deck and a tiled ramada.', at: [0, 0, 'pool'] },
        { id: 'sign', label: 'The Link at 4th Ave', text: 'Entrance and monument sign on University Blvd.', at: [0.63, 0.3, 'front'] },
        { id: 'walkways', label: 'Apartments', text: 'Open walkways and stairs serve each building.', at: [0.32, 0.6, 'front'] },
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
      'alongside an in-line strip, Burger King and Starbucks pads and a large surface parking field at Speedway ' +
      'and Pantano; Potosino Mexican Food (No. 7865) faces the center across Speedway.',
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
      { name: 'Fry’s Food & Drug', floor: 'Anchor · 7812', kind: 'Grocery' },
      { name: 'Fry’s Pharmacy', floor: 'Anchor', kind: 'Pharmacy' },
      { name: 'Starbucks (in Fry’s)', floor: 'Anchor', kind: 'Café' },
      { name: 'Chase', floor: 'In-line · 7812', kind: 'Bank' },
      { name: 'Dollar Tree', floor: 'In-line', kind: 'Variety' },
      { name: 'Simply Smiles Dentistry', floor: 'In-line · 7780', kind: 'Medical' },
      { name: 'Sally Beauty', floor: 'In-line · 7782', kind: 'Beauty supply' },
      { name: 'Cost Cutters', floor: 'In-line · 7784', kind: 'Hair salon' },
      { name: 'Splash Nail Spa', floor: 'In-line · 7790', kind: 'Nail salon' },
      { name: 'Park Avenue Cleaners', floor: 'In-line · 7794', kind: 'Dry cleaning' },
      { name: 'MY DR NOW', floor: 'Pad · 7760', kind: 'Medical' },
      { name: 'Fry’s Fuel Center', floor: 'Pad · 7770', kind: 'Fuel' },
      { name: 'Burger King', floor: 'Pad · 7880', kind: 'Restaurant' },
      { name: 'Starbucks', floor: 'Pad · 7890', kind: 'Café' },
      { name: 'Potosino Mexican Food', floor: 'Pad · 7865 (across Speedway)', kind: 'Restaurant' },
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
      procedural: { generator: 'center', floors: 1, width: 136, depth: 58 },
      site: { id: 'tucson-saguaro-vista', facing: 'north', suburban: true, desert: true, noSheds: true },
      tour: {
        avenue: { label: 'Potosino pad', pos: [-59, 2.0, 189], target: [-68, 4.2, 214], fov: 55 },
        labels: { front: 'From Speedway Blvd', 'front-west': 'In-line shops & Dollar Tree', 'rear-west': 'Rear corner', crown: 'Fry’s gable' },
        extra: [
          { id: 'strip', label: 'Simply Smiles & in-line strip', pos: [56, 2.6, 70], target: [79, 4.5, 74], fov: 55 },
          { id: 'pads', label: 'Burger King & Starbucks pads', pos: [-52, 3.5, 100], target: [-104, 4, 126], fov: 52 },
          { id: 'pantano', label: 'Pantano Rd pads', pos: [-72, 4, 58], target: [-106, 3, 62], fov: 55 },
        ],
        streetDist: 62,
        radius: 80,
        omit: ['base', 'west', 'east'],
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
      // Footprint traced from satellite / OSM (address node "1 Parrott Drive"
      // inside it): ~168 m x 72 m in three stepped blocks along a NNE-SSW axis.
      // Local +z = the WNW front, +x = toward SSW (CARA lobby and loop drive).
      procedural: {
        generator: 'labflex', floors: 1, width: 168, depth: 72, sign: 'CARA',
        tenants: [
          { name: 'ID PRODUCTS', sub: 'Suite 500', at: [-2.65, 6.2, 23.45], w: 6.5, bg: '#13294b', ink: '#ffffff' },
        ],
      },
      site: { id: 'shelton-parrott', facing: 'west', suburban: true, noFence: true, bare: true },
      tour: {
        avenue: { label: 'CARA entrance & loop drive', pos: [93, 1.8, 43], target: [50, 3.5, 11], fov: 64 },
        labels: { roof: 'Aerial over Parrott Drive' },
        radius: 110,
        omit: ['street', 'base', 'front', 'front-west', 'west', 'rear-west', 'back', 'east', 'crown'],
        extra: [
          { id: 'lobby', label: 'CARA lobby', pos: [74, 2.4, 26], target: [74, 3.8, 0], fov: 55 },
          { id: 'office', label: 'Office wing', pos: [32, 2.4, 44], target: [30, 3.4, 23], fov: 60 },
          { id: 'wing', label: 'Industrial wing entrance', pos: [8, 2.2, 38], target: [-6, 3, 23], fov: 55 },
          { id: 'north', label: 'North end & truck doors', pos: [-122, 9, 6], target: [-70, 3, 4], fov: 55 },
          { id: 'aerial-sw', label: 'Aerial from the south-west', pos: [170, 80, 120], target: [0, 0, 0], fov: 50 },
        ],
      },
      hotspots: [
        { id: 'lobby', label: 'CARA entrance', text: 'Glazed lobby behind stone planters, facing the circular drop-off drive.', at: [0.938, 0.7, 'front'] },
        { id: 'office', label: 'Office wing', text: 'Glass curtain-wall bays between round pilasters.', at: [0.65, 0.6, 'front'] },
        { id: 'wing', label: 'Industrial wing', text: 'Ribbed fascia over a ribbon of tall windows; ID Products (Suite 500).', at: [0.45, 0.6, 'front'] },
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
    // Building/suite from listings and directories (PICOR lease reports, Travelers,
    // Psychology Today, practice websites); suite letter = building.
    tenants: [
      { name: 'Monier Insurance Agency', floor: 'Bldg D · D-430', kind: 'Insurance' },
      { name: 'Desert Breeze Mental Health', floor: 'Bldg D · D-420', kind: 'Medical' },
      { name: 'Liberation Counseling & Consulting', floor: 'Bldg D · D-420', kind: 'Medical' },
      { name: 'Zola Healing CoLab', floor: 'Bldg C · C-320', kind: 'Medical' },
      { name: 'Scarlet Rabbit Wellness', floor: 'Bldg F · F-600', kind: 'Medical' },
      { name: 'Lucid Awakening', floor: 'Bldg F · F-640', kind: 'Medical' },
      { name: 'Help and Hope Counseling', floor: 'Bldg F · F-640', kind: 'Medical' },
      { name: 'Human Resource Network', floor: 'Bldg G', kind: 'Office' },
      { name: 'Nutritional Services of Southern Arizona', floor: 'Bldg I · I-905', kind: 'Medical' },
      { name: 'Sandra L. Reed, CPA', floor: '—', kind: 'Office' },
    ],
    availability: [],
    photos: [
      { src: 'assets/properties/el-dorado-square/entrance.jpg', caption: 'Entrance on El Dorado Place', focus: 'center 60%' },
      { src: 'assets/properties/el-dorado-square/building-d.jpg', caption: 'Building D' },
    ],
    cover: 'assets/properties/el-dorado-square/entrance.jpg',
    model: {
      glb: null,
      procedural: { generator: 'mission', floors: 2, width: 150, depth: 140 },
      site: { id: 'tucson-el-dorado', facing: 'north', suburban: true, noFence: true, noSheds: true, desert: true },
      tour: {
        // Campus traced from satellite: origin = campus centre, +z = El Dorado Place (south).
        avenue: { label: 'Entrance gate', pos: [-31, 1.7, 84], target: [-17, 2.2, 66], fov: 58 },
        labels: { street: 'Campus from El Dorado Pl', roof: 'Campus from the south-west' },
        streetY: 72,
        streetDist: 62,
        radius: 120,
        omit: ['base', 'front', 'front-west', 'west', 'rear-west', 'back', 'east', 'crown'],
        extra: [
          { id: 'bldg-d', label: 'Building D', pos: [-55, 6.5, 15.3], target: [-55, 4.4, 0], fov: 68 },
          { id: 'tower', label: 'Tower & loggia', pos: [-55, 3, 14.8], target: [-59, 7.5, 0], fov: 56 },
          { id: 'north', label: 'Buildings E & F', pos: [8, 3, 4], target: [6, 5, -26], fov: 64 },
          { id: 'eastbldgs', label: 'Buildings G & H', pos: [36, 5, 10], target: [74, 4, -22], fov: 62 },
          { id: 'south', label: 'Buildings A & I', pos: [26, 2.5, 82], target: [20, 5, 45], fov: 62 },
          { id: 'wilmot', label: 'From Wilmot Rd', pos: [-112, 2.2, 32], target: [-60, 5, 5], fov: 56 },
        ],
      },
      hotspots: [
        { id: 'gate', label: 'Entrance', text: 'Brick pillars, iron fence, the El Dorado Square sign and the campus tenant directory.', at: [0, 0, 'gate'] },
        { id: 'bldg-d', label: 'Building D (400)', text: 'Loggia tower with balcony. Monier Insurance Agency (D-430), Desert Breeze Mental Health and Liberation Counseling (D-420).', at: [0, 0.75, 'D'] },
        { id: 'bldg-c', label: 'Building C (300)', text: 'Zola Healing CoLab (C-320).', at: [0, 0.6, 'C'] },
        { id: 'bldg-f', label: 'Building F (600)', text: 'Scarlet Rabbit Wellness (F-600); Lucid Awakening and Help & Hope Counseling (F-640).', at: [0, 0.6, 'F'] },
        { id: 'bldg-g', label: 'Building G (700)', text: 'Human Resource Network.', at: [0, 0.6, 'G'] },
        { id: 'bldg-i', label: 'Building I (900)', text: 'Nutritional Services of Southern Arizona (I-905).', at: [0, 0.6, 'I'] },
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
    // Listings (LoopNet/Crexi/First Pioneer), Yelp, MapQuest, Waze, Gentle Dental site.
    tenants: [
      { name: 'Gentle Dental', floor: '2nd · Ste 203', kind: 'Medical' },
      { name: 'Morgan, Cohen & Bach', floor: '2nd · Ste 200', kind: 'Legal' },
      { name: 'BAYADA Home Health Care', floor: '1st', kind: 'Medical' },
      { name: 'Soreo Pathways', floor: '1st', kind: 'Medical' },
      { name: 'Arizona Dept. of Economic Security', floor: '—', kind: 'Government' },
      { name: 'HomeWell Care Services', floor: '—', kind: 'Medical' },
      { name: 'Spencer Construction', floor: '—', kind: 'Office' },
    ],
    availability: [],
    photos: [
      { src: 'assets/properties/7225-n-mona-lisa/corner.jpg', caption: 'Mona Lisa Plaza', focus: 'center 50%' },
    ],
    cover: 'assets/properties/7225-n-mona-lisa/corner.jpg',
    model: {
      glb: null,
      // Satellite: L-shaped, 57 m along Ina Rd x 29 m, plus a 24 x 15 m block behind the east end.
      procedural: { generator: 'monalisa', floors: 2, width: 57, depth: 44, barDepth: 29, tenantSign: 'gentle dental', number: '7225' },
      site: { id: 'tucson-mona-lisa', facing: 'north', suburban: true, noFence: true, noSheds: true, desert: true, trees: false },
      tour: {
        avenue: { label: 'Corner view', pos: [44, 1.7, 42], target: [12, 5.5, 12], fov: 60 },
        labels: { street: 'From Ina Rd', 'front-west': 'Ina & Mona Lisa corner', west: 'Mona Lisa Rd side', east: 'West wing & carports', 'rear-west': 'Rear corner', back: 'Rear & apartments', crown: 'Mission parapet' },
        streetDist: 50,
        radius: 60,
        omit: ['base', 'crown', 'back'],
        extra: [
          { id: 'rear', label: 'Rear & apartments', pos: [-14, 24, -100], target: [0, 3, 0], fov: 48 },
          { id: 'tenants', label: 'Suites & tenants', pos: [-8, 2.4, 36.5], target: [-8, 3.2, 22], fov: 64 },
          { id: 'parapet', label: 'Mission parapet', pos: [17, 7, 45], target: [15, 9, 22], fov: 48 },
          { id: 'mall', label: 'Toward Foothills Mall', pos: [-30, 30, 120], target: [140, 0, -60], fov: 60 },
        ],
      },
      hotspots: [
        { id: 'parapet', label: 'Gentle Dental (Suite 203)', text: 'Curved mission parapet with red coping and the Gentle Dental sign; the dental office is upstairs in Suite 203.', at: [0.45, 0.95, 'front'] },
        { id: 'entry', label: 'Arched entrance', text: 'Two-story arched entry with the lobby directory: Morgan, Cohen & Bach (Suite 200), Gentle Dental (203); Suite 101 (2,170 SF) available.', at: [0.82, 0.45, 'front'] },
        { id: 'suites', label: 'Ground-floor suites', text: 'BAYADA Home Health Care, Soreo Pathways and Arizona DES behind the arcade.', at: [0.3, 0.2, 'front'] },
        { id: 'arcade', label: 'East arcade', text: 'Shaded arcade on the Mona Lisa Rd side: HomeWell Care Services, Spencer Construction.', at: [0.55, 0.18, 'right'] },
      ],
    },
  },
];

export function getProperty(id) {
  return properties.find((p) => p.id === id);
}
