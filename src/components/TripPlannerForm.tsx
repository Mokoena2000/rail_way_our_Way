import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStations } from '@/hooks/useStations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function TripPlannerForm() {
  const navigate = useNavigate();
  const { data: stations, isLoading } = useStations();
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [departureTime, setDepartureTime] = useState('07:00');

  const timeOptions = [
    '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  ];

  // Get unique station names
  const uniqueStations = stations
    ? [...new Map(stations.map(s => [s.name, s])).values()]
    : [];

  const handleSearch = () => {
    if (fromStation && toStation && departureTime) {
      const searchParams = new URLSearchParams({
        from: fromStation,
        to: toStation,
        time: departureTime,
      });
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  const isValid = fromStation && toStation && fromStation !== toStation;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Search className="w-5 h-5 text-primary" />
        Plan Your Trip
      </h2>

      <div className="space-y-4">
        {/* From Station */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Departure Station
          </label>
          <Select value={fromStation} onValueChange={setFromStation} disabled={isLoading}>
            <SelectTrigger className="h-12 bg-secondary border-border">
              <SelectValue placeholder="Select departure station" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-64">
              {uniqueStations.map((station) => (
                <SelectItem 
                  key={station.id} 
                  value={station.name}
                  disabled={station.name === toStation}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: station.lines?.color_code || '#FFD700' }}
                    />
                    {station.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* To Station */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Arrival Station
          </label>
          <Select value={toStation} onValueChange={setToStation} disabled={isLoading}>
            <SelectTrigger className="h-12 bg-secondary border-border">
              <SelectValue placeholder="Select arrival station" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-64">
              {uniqueStations.map((station) => (
                <SelectItem 
                  key={station.id} 
                  value={station.name}
                  disabled={station.name === fromStation}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: station.lines?.color_code || '#FFD700' }}
                    />
                    {station.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Departure Time
          </label>
          <Select value={departureTime} onValueChange={setDepartureTime}>
            <SelectTrigger className="h-12 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-64">
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        size="lg" 
        className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
        onClick={handleSearch}
        disabled={!isValid}
      >
        <Search className="w-5 h-5 mr-2" />
        Find Trains
      </Button>
    </div>
  );
}
