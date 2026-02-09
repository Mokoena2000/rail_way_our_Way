export interface Line {
  id: string;
  name: string;
  color_code: string;
  created_at: string;
}

export interface Station {
  id: string;
  name: string;
  line_id: string;
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
  trip_id: string;
  status: 'on_time' | 'delayed' | 'cancelled';
  created_at: string;
}

export type TripStatus = 'scheduled' | 'on_time' | 'delayed' | 'cancelled';

export interface TripWithStatus extends Trip {
  status: TripStatus;
  reportCount: number;
}

// Mock data for fallback
export const mockLines: Line[] = [
  { id: '1', name: 'Northern Line', color_code: '#FFD700', created_at: new Date().toISOString() },
  { id: '2', name: 'Southern Line', color_code: '#4CAF50', created_at: new Date().toISOString() },
  { id: '3', name: 'Cape Flats', color_code: '#2196F3', created_at: new Date().toISOString() },
  { id: '4', name: 'Central Line', color_code: '#FF5722', created_at: new Date().toISOString() },
];

export const mockTrips: Trip[] = [
  { id: '1', line_id: '1', departure_time: '07:30:00', origin: 'Bellville', destination: 'Cape Town', created_at: new Date().toISOString() },
  { id: '2', line_id: '1', departure_time: '08:00:00', origin: 'Bellville', destination: 'Cape Town', created_at: new Date().toISOString() },
  { id: '3', line_id: '1', departure_time: '08:30:00', origin: 'Bellville', destination: 'Cape Town', created_at: new Date().toISOString() },
  { id: '4', line_id: '1', departure_time: '09:00:00', origin: 'Bellville', destination: 'Cape Town', created_at: new Date().toISOString() },
  { id: '5', line_id: '1', departure_time: '09:30:00', origin: 'Bellville', destination: 'Cape Town', created_at: new Date().toISOString() },
  { id: '6', line_id: '2', departure_time: '07:15:00', origin: 'Simon\'s Town', destination: 'Cape Town', created_at: new Date().toISOString() },
  { id: '7', line_id: '2', departure_time: '08:15:00', origin: 'Simon\'s Town', destination: 'Cape Town', created_at: new Date().toISOString() },
  { id: '8', line_id: '3', departure_time: '07:45:00', origin: 'Khayelitsha', destination: 'Cape Town', created_at: new Date().toISOString() },
  { id: '9', line_id: '3', departure_time: '08:45:00', origin: 'Khayelitsha', destination: 'Cape Town', created_at: new Date().toISOString() },
  { id: '10', line_id: '4', departure_time: '07:00:00', origin: 'Eerste River', destination: 'Cape Town', created_at: new Date().toISOString() },
];
