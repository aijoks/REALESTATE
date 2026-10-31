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
  name: 'Skyline & Co.',
  tagline: 'Manhattan commercial space, seen from every angle.',
  phone: '(212) 555-0142', // SAMPLE
  email: 'leasing@example.com', // SAMPLE
};

export const properties = [
  {
    id: '120-e-56th',
    address: '120 E 56th Street',
    city: 'New York, NY 10022',
    neighborhood: 'Midtown East',
    crossStreets: 'Between Park Ave & Lexington Ave',
    status: 'For Lease',
    uses: ['Office', 'Medical', 'Retail'],
    headline: 'Pre-war brick office tower steps from Park Avenue',
    description:
      'A classic pre-war, 15-story red-brick building on East 56th Street with a ' +
      'limestone-trimmed crown, projecting corner bays and a double-height retail base. ' +
      'Light-filled floors suit boutique office and medical users, with street-level ' +
      'retail in one of Midtown’s most trafficked blocks.',
    stats: [
      { label: 'Stories', value: '15' },
      { label: 'Built', value: 'c. 1920s' }, // SAMPLE
      { label: 'Typical floor', value: '±2,200 SF' }, // SAMPLE
      { label: 'Uses', value: 'Office · Medical · Retail' },
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
      { floor: 4, suite: 'Full floor', sf: 2200, use: 'Medical', rent: '$58 / SF' },
      { floor: 7, suite: 'Full floor', sf: 2200, use: 'Office', rent: '$54 / SF' },
      { floor: 8, suite: '8A', sf: 1150, use: 'Office', rent: '$55 / SF' },
      { floor: 11, suite: 'Full floor', sf: 2200, use: 'Office', rent: '$56 / SF' },
      { floor: 14, suite: 'Penthouse', sf: 1900, use: 'Office', rent: '$62 / SF' },
    ],
    photos: [
      { src: 'assets/properties/120-e-56th/street-view.webp', caption: 'Looking east along E 56th Street' },
      { src: 'assets/properties/120-e-56th/storefront.webp', caption: 'Retail base & lobby entrance' },
    ],
    cover: 'assets/properties/120-e-56th/street-view.webp',
    model: {
      glb: null, // e.g. 'assets/properties/120-e-56th/model.glb'
      procedural: {
        generator: 'prewarBrick',
        floors: 15,
        width: 15.2, // metres of street frontage (~50 ft)
        depth: 30, // metres deep (~100 ft)
        storefronts: [
          { kind: 'sign', text: "TRUMAN'S", sub: "GENTLEMEN'S GROOMERS", color: '#121212', ink: '#f2f2f2', span: [0, 0.4] },
          { kind: 'entrance', text: '120 E 56 ST', span: [0.4, 0.62] },
          { kind: 'awning', text: '120 E 56TH   MiRano   RISTORANTE', color: '#1f5fbf', span: [0.62, 1] },
        ],
        bannerText: ['SPACE', 'FOR', 'LEASE', '', 'Office', 'Medical', 'Retail'],
      },
      hotspots: [
        { id: 'entrance', label: 'Lobby entrance', text: 'Attended lobby with elevator access to all floors.', at: [0.51, 0.06, 'front'] },
        { id: 'retail', label: 'Street retail', text: "Ground-floor retail: Truman's and MiRano Ristorante.", at: [0.2, 0.05, 'front'] },
        { id: 'spa', label: '2nd floor · Wellness', text: '22 Day Spa occupies the double-height 2nd floor.', at: [0.8, 0.13, 'front'] },
        { id: 'crown', label: 'Limestone crown', text: 'Ornamental pre-war cornice and pediments.', at: [0.5, 0.97, 'front'] },
        { id: 'roof', label: 'Roof & water tower', text: 'Classic NYC timber water tank and mechanical bulkhead.', at: [0.5, 1.08, 'roof'] },
        { id: 'rear', label: 'Rear facade', text: 'Rear windows face the mid-block light court.', at: [0.5, 0.55, 'back'] },
      ],
    },
  },
];

export function getProperty(id) {
  return properties.find((p) => p.id === id);
}
