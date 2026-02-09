import React, { useState, useEffect } from 'react';
import { X, Clock, Ban, Shield, Users, HelpCircle, Send } from 'lucide-react';
import { Station, IncidentType } from '../types/railway';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: Station[]; // Received from parent, so it's always real data
  onSubmit: (data: { station_id: string; type: IncidentType; description: string }) => void;
}

export default function ReportModal({ isOpen, onClose, stations, onSubmit }: ReportModalProps) {
  const [stationId, setStationId] = useState('');
  const [type, setType] = useState<IncidentType>('Delay');
  const [description, setDescription] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle entry/exit animations cleanly
  useEffect(() => {
    if (isOpen) setIsAnimating(true);
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setIsAnimating(false);
  };

  if (!isOpen && !isAnimating) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationId) return; // Basic validation
    
    onSubmit({ station_id: stationId, type, description });
    
    // Reset and close
    setStationId('');
    setType('Delay');
    setDescription('');
    onClose();
  };

  // Helper to get icon for type
  const getTypeIcon = (t: IncidentType) => {
    switch (t) {
      case 'Delay': return <Clock className="w-5 h-5" />;
      case 'Cancellation': return <Ban className="w-5 h-5" />;
      case 'Safety': return <Shield className="w-5 h-5" />;
      case 'Crowding': return <Users className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onTransitionEnd={handleAnimationEnd}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Card */}
      <div className={`relative bg-[#F4F1DE] w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-10'}`}>
        
        {/* Header */}
        <div className="bg-[#3D405B] p-4 flex justify-between items-center">
          <h2 className="text-[#F4F1DE] font-bold text-lg flex items-center gap-2">
            📢 Report Incident
          </h2>
          <button onClick={onClose} className="text-[#F4F1DE]/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Station Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#3D405B] mb-1">Where are you?</label>
            <select 
              required
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              className="w-full p-3 rounded-lg border-2 border-[#E07A5F]/20 focus:border-[#E07A5F] bg-white text-[#3D405B] outline-none transition-all appearance-none"
            >
              <option value="">Select a Station...</option>
              {stations.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Incident Type Selection (Visual Cards) */}
          <div>
            <label className="block text-sm font-semibold text-[#3D405B] mb-2">What's happening?</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Delay', 'Cancellation', 'Safety', 'Crowding'] as IncidentType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    type === t 
                      ? 'border-[#E07A5F] bg-[#E07A5F]/10 text-[#E07A5F]' 
                      : 'border-transparent bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {getTypeIcon(t)}
                  <span className="font-medium text-sm">{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#3D405B] mb-1">Details (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Train stopped between stations..."
              className="w-full p-3 rounded-lg border-2 border-[#E07A5F]/20 focus:border-[#E07A5F] bg-white text-[#3D405B] outline-none transition-all min-h-[80px]"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full bg-[#E07A5F] hover:bg-[#D0694E] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#E07A5F]/20 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            <span>Post Alert</span>
            <Send className="w-5 h-5" />
          </button>

        </form>
      </div>
    </div>
  );
}