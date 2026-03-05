import { useState, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/Supabase/supabase';
import { toast } from 'sonner';
import { Station } from '@/types/railway';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { type: string; station_id: number; description: string }) => void;
}

const incidentTypes = [
  { value: 'Delay', label: '🟡 Delay' },
  { value: 'Cancellation', label: '🔴 Cancellation' },
  { value: 'Safety', label: '🟢 Safety/Cleanliness' },
  { value: 'Crowding', label: '🟠 Overcrowded' },
  { value: 'Other', label: '⚪ Other' },
];

export function ReportIncidentModal({ isOpen, onClose, onSubmit }: ReportIncidentModalProps) {
  const [incidentType, setIncidentType] = useState('');
  const [stationId, setStationId] = useState('');
  const [description, setDescription] = useState('');
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    if (isOpen && stations.length === 0) {
      supabase.from('stations').select('*').order('name').then(({ data }) => {
        if (data) setStations(data as Station[]);
      });
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!incidentType || !stationId) {
      toast.error('Please select an incident type and station');
      return;
    }
    onSubmit?.({ type: incidentType, station_id: Number(stationId), description });
    setIncidentType('');
    setStationId('');
    setDescription('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
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
          <div className="absolute inset-0 bg-foreground/50" />
          
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl border-2 border-foreground neo-shadow overflow-hidden"
          >
            <div className="sm:hidden flex justify-center pt-3">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            
            <div className="flex items-center justify-between p-4 pb-2">
              <h2 className="text-xl font-extrabold text-foreground">Report Incident</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <p className="px-4 text-sm text-muted-foreground mb-4">Help fellow commuters by sharing what's happening.</p>
            
            <div className="p-4 pt-0 space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground/80 mb-2 block">Incident Type</label>
                <Select value={incidentType} onValueChange={setIncidentType}>
                  <SelectTrigger className="w-full h-12 bg-background border-2 border-foreground text-foreground font-medium rounded-xl">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-2 border-foreground rounded-xl">
                    {incidentTypes.map(t => (
                      <SelectItem key={t.value} value={t.value} className="font-medium">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground/80 mb-2 block">Station</label>
                <Select value={stationId} onValueChange={setStationId}>
                  <SelectTrigger className="w-full h-12 bg-background border-2 border-foreground text-foreground font-medium rounded-xl">
                    <SelectValue placeholder="Select station..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-2 border-foreground rounded-xl max-h-48">
                    {stations.map(s => (
                      <SelectItem key={s.id} value={String(s.id)} className="font-medium">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              <Button 
                onClick={handleSubmit}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg border-2 border-foreground rounded-xl neo-shadow-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Send className="w-5 h-5 mr-2" />
                Post Alert
              </Button>
            </div>
            
            <div className="h-4 sm:h-2" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
