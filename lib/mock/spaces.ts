import { AdSpace, AdSpaceMapMarker } from '@/lib/types/database.types'

export const MOCK_SPACES: AdSpace[] = [
  {
    id: '1', owner_id: '', status: 'published', created_at: '', updated_at: '',
    title: 'Downtown Billboard — Times Square',
    description: 'Premium digital billboard in the heart of Times Square, one of the most trafficked intersections in the world. Over 380,000 daily pedestrian visits. Ideal for national brand campaigns and product launches.',
    space_type: 'Billboard', price_cents: 150000,
    city: 'New York', address: '1560 Broadway, New York, NY 10036',
    lat: 40.758, lng: -73.9855,
  },
  {
    id: '2', owner_id: '', status: 'published', created_at: '', updated_at: '',
    title: 'Wrapped Delivery Van',
    description: 'Full vehicle wrap on a high-frequency delivery van covering the Chicago metro area. Estimated 12,000+ daily impressions. Route covers downtown, Lincoln Park, and Wicker Park neighborhoods.',
    space_type: 'Vehicle', price_cents: 45000,
    city: 'Chicago', address: 'Chicago Metro Area, IL',
    lat: 41.8827, lng: -87.6233,
  },
  {
    id: '3', owner_id: '', status: 'published', created_at: '', updated_at: '',
    title: 'Airport Terminal Screen',
    description: 'High-visibility digital screen in the international departures terminal at LAX. Reach over 50,000 daily travelers from around the world. Minimum dwell time of 35 minutes per passenger.',
    space_type: 'Digital', price_cents: 90000,
    city: 'Los Angeles', address: 'LAX Terminal B, Los Angeles, CA 90045',
    lat: 33.9425, lng: -118.408,
  },
  {
    id: '4', owner_id: '', status: 'published', created_at: '', updated_at: '',
    title: 'Rooftop Mural Wall',
    description: 'Large rooftop mural wall on a 6-story building in downtown Austin. Visible from the 6th Street entertainment district and I-35. Perfect for brands targeting the 21–35 demographic.',
    space_type: 'Outdoor', price_cents: 60000,
    city: 'Austin', address: '412 Congress Ave, Austin, TX 78701',
    lat: 30.2672, lng: -97.7431,
  },
  {
    id: '5', owner_id: '', status: 'published', created_at: '', updated_at: '',
    title: 'Mall Atrium Display',
    description: 'Center-court display in Miami\'s Dadeland Mall atrium. 45 million annual visitors. Premium placement surrounded by luxury retail — ideal for fashion, tech, and lifestyle brands.',
    space_type: 'Indoor', price_cents: 35000,
    city: 'Miami', address: '7535 N Kendall Dr, Miami, FL 33156',
    lat: 25.7617, lng: -80.1918,
  },
  {
    id: '6', owner_id: '', status: 'published', created_at: '', updated_at: '',
    title: 'Festival Grounds Banner',
    description: 'Premium banner placement across multiple stages at Nashville\'s outdoor festival grounds. Events held spring through fall attract 5,000–20,000 attendees each weekend.',
    space_type: 'Event', price_cents: 25000,
    city: 'Nashville', address: 'Centennial Park, Nashville, TN 37203',
    lat: 36.1627, lng: -86.7816,
  },
]

export const MOCK_MARKERS: AdSpaceMapMarker[] = MOCK_SPACES.map((s) => ({
  id: s.id,
  title: s.title,
  space_type: s.space_type,
  price_cents: s.price_cents,
  city: s.city,
  lat: s.lat as number,
  lng: s.lng as number,
}))

export interface MockSpaceExtra {
  duration_min: string
  availability: string
  owner_name: string
  owner_since: string
  owner_response_rate: string
  owner_listings: number
}

export const MOCK_EXTRAS: Record<string, MockSpaceExtra> = {
  '1': {
    duration_min: 'Min. 1 month',
    availability: 'Available now',
    owner_name: 'Marcus Rivera',
    owner_since: 'Jan 2024',
    owner_response_rate: '98%',
    owner_listings: 4,
  },
  '2': {
    duration_min: 'Min. 2 months',
    availability: 'Available now',
    owner_name: 'Jordan Lee',
    owner_since: 'Mar 2024',
    owner_response_rate: '95%',
    owner_listings: 2,
  },
  '3': {
    duration_min: 'Min. 1 month',
    availability: 'Available from Apr 2026',
    owner_name: 'Sofia Chen',
    owner_since: 'Jun 2024',
    owner_response_rate: '100%',
    owner_listings: 3,
  },
  '4': {
    duration_min: 'Min. 3 months',
    availability: 'Available now',
    owner_name: 'Tyler Brooks',
    owner_since: 'Feb 2024',
    owner_response_rate: '97%',
    owner_listings: 1,
  },
  '5': {
    duration_min: 'Min. 1 month',
    availability: 'Available now',
    owner_name: 'Daniela Moreno',
    owner_since: 'May 2024',
    owner_response_rate: '96%',
    owner_listings: 2,
  },
  '6': {
    duration_min: 'Per event or full season',
    availability: 'Spring season open',
    owner_name: 'Alex Turner',
    owner_since: 'Apr 2024',
    owner_response_rate: '93%',
    owner_listings: 3,
  },
}
