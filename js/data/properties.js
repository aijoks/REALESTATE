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
      'A 1926 Rosario Candela-designed, 15-story red-brick building on East 56th Street with ' +
      'projecting corner pavilions, a limestone-trimmed Flemish-gable crown and a two-storey retail base. ' +
      'Light-filled floors suit boutique office and medical users, with street-level ' +
      'retail in one of Midtown’s most trafficked blocks.',
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
];

export function getProperty(id) {
  return properties.find((p) => p.id === id);
}
