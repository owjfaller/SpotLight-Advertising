import { AdSpace, SpaceType, Profile } from '../types/database.types'

export interface AdSpaceFilters {
  low_price?: number
  high_price?: number
  type?: SpaceType
  city?: string
  radius?: number
  lat?: number
  lng?: number
  start_date?: string
  end_date?: string
}

class ApiService {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'An unknown error occurred' }))
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Listings
  async getListings(filters: AdSpaceFilters = {}): Promise<AdSpace[]> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
    return this.request<AdSpace[]>(`/api/listings?${params.toString()}`)
  }

  async getListingById(id: string): Promise<AdSpace> {
    return this.request<AdSpace>(`/api/listings/${id}`)
  }

  async createListing(data: {
    title: string
    type: SpaceType
    location: string
    city: string
    start_date: string
    end_date: string
    price: number
    description?: string
    image_url?: string
  }): Promise<{ id: string }> {
    return this.request<{ id: string }>('/api/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Interests
  async expressInterest(spaceId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/listings/${spaceId}/interest`, {
      method: 'POST',
    })
  }

  // Profile
  async getMyProfile(): Promise<{
    profile: Profile
    published: AdSpace[]
    interestedIn: Record<string, unknown>[]
  }> {
    return this.request<{
      profile: Profile
      published: AdSpace[]
      interestedIn: Record<string, unknown>[]
    }>('/api/profiles/me')
  }
}

export const api = new ApiService()
