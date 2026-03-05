export interface Station {
  id: number;
  name: string;
  line_name: string;
  created_at: string;
}

export interface Line {
  id: string;
  name: string;
  color_code: string;
  created_at: string;
}

export interface Trip {
  id: string;
  line_id: string;
  departure_time: string;
  origin: string;
  destination: string;
  created_at: string;
}

export interface Report {
  id: string;
  station_id: number;
  user_id: string | null;
  type: 'Delay' | 'Cancellation' | 'Safety' | 'Crowding' | 'Other';
  description: string | null;
  upvotes: number;
  created_at: string;
}

export interface ReportWithStation extends Report {
  stations: { name: string } | null;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  updated_at: string;
}

export type TripStatus = 'scheduled' | 'on_time' | 'delayed' | 'cancelled';

export interface TripWithStatus extends Trip {
  status: TripStatus;
  reportCount: number;
}

// Line color mapping
export const lineColors: Record<string, string> = {
  'Southern': '#81B29A',
  'Northern': '#E07A5F',
  'Cape Flats': '#3D90D4',
  'Central': '#3D405B',
};

export const mockLines: Line[] = [
  { id: '1', name: 'Northern Line', color_code: '#E07A5F', created_at: new Date().toISOString() },
  { id: '2', name: 'Southern Line', color_code: '#81B29A', created_at: new Date().toISOString() },
  { id: '3', name: 'Cape Flats', color_code: '#3D90D4', created_at: new Date().toISOString() },
  { id: '4', name: 'Central Line', color_code: '#3D405B', created_at: new Date().toISOString() },
];

export const mockTrips: Trip[] = [];
