import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { type: string; station: string; description: string }) => void;
}

// Mock stations - will be replaced with real data later
const mockStations = [
  { id: '1', name: 'Cape Town' },
  { id: '2', name: 'Bellville' },
  { id: '3', name: 'Salt River' },
  { id: '4', name: 'Woodstock' },
  { id: '5', name: 'Observatory' },
  { id: '6', name: 'Mowbray' },
  { id: '7', name: 'Rondebosch' },
  { id: '8', name: 'Claremont' },
  { id: '9', name: "Simon's Town" },
  { id: '10', name: 'Fish Hoek' },
  { id: '11', name: 'Muizenberg' },
  { id: '12', name: 'Retreat' },
];

const incidentTypes = [
  { value: 'Delay', label: '🟡 Delay', icon: '🟡' },
  { value: 'Cancelled', label: '🔴 Cancellation', icon: '🔴' },
  { value: 'Safety', label: '🟢 Safety/Cleanliness', icon: '🟢' },
  { value: 'Overcrowded', label: '🟠 Overcrowded', icon: '🟠' },
];

export function ReportIncidentModal({ isOpen, onClose, onSubmit }: ReportIncidentModalProps) {
  const [incidentType, setIncidentType] = useState('');
  const [station, setStation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!incidentType || !station) {
      toast.error('Please select an incident type and station');
      return;
    }

    onSubmit?.({ type: incidentType, station, description });
    
    toast.success('Report submitted!', {
      description: 'Thanks for helping fellow commuters.',
    });
    
    // Reset form
    setIncidentType('');
    setStation('');
    setDescription('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/50" />
          
          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl border-2 border-foreground neo-shadow overflow-hidden"
          >
            {/* Handle bar for mobile */}
            <div className="sm:hidden flex justify-center pt-3">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
              <h2 className="text-xl font-extrabold text-foreground">
                Report Incident
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <p className="px-4 text-sm text-muted-foreground mb-4">
              Help fellow commuters by sharing what's happening.
            </p>
            
            {/* Form */}
            <div className="p-4 pt-0 space-y-4">
              {/* Incident Type */}
              <div>
                <label className="text-sm font-semibold text-foreground/80 mb-2 block">
                  Incident Type
                </label>
                <Select value={incidentType} onValueChange={setIncidentType}>
                  <SelectTrigger className="w-full h-12 bg-background border-2 border-foreground text-foreground font-medium rounded-xl">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-2 border-foreground rounded-xl">
                    {incidentTypes.map((type) => (
                      <SelectItem 
                        key={type.value} 
                        value={type.value}
                        className="font-medium"
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Station */}
              <div>
                <label className="text-sm font-semibold text-foreground/80 mb-2 block">
                  Station
                </label>
                <Select value={station} onValueChange={setStation}>
                  <SelectTrigger className="w-full h-12 bg-background border-2 border-foreground text-foreground font-medium rounded-xl">
                    <SelectValue placeholder="Select station..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-2 border-foreground rounded-xl max-h-48">
                    {mockStations.map((s) => (
                      <SelectItem 
                        key={s.id} 
                        value={s.name}
                        className="font-medium"
                      >
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-foreground/80 mb-2 block">
                  What's happening? <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Textarea
                  placeholder="Train is stuck at the platform, no announcements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background border-2 border-foreground text-foreground rounded-xl min-h-[100px] resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg border-2 border-foreground rounded-xl neo-shadow-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Send className="w-5 h-5 mr-2" />
                Post Alert
              </Button>
            </div>
            
            {/* Safe area padding for mobile */}
            <div className="h-4 sm:h-2" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
