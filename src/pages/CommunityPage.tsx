import { useState } from 'react';
import { MessageCircle, Plus, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { IncidentCard, Incident } from '@/components/IncidentCard';
import { ReportIncidentModal } from '@/components/ReportIncidentModal';
import { toast } from 'sonner';

// Mock incidents for development
const mockIncidents: Incident[] = [
  { 
    id: '1', 
    type: 'Delay',
    title: 'Delay at Bellville',
    description: 'Train is stuck at the platform, no announcements. Been waiting for 20 minutes now.',
    station: 'Bellville',
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
    upvotes: 24
  },
  { 
    id: '2', 
    type: 'Cancelled',
    title: 'Cancelled at Cape Town',
    description: 'The 08:30 Southern Line service has been cancelled. Next train at 09:00.',
    station: 'Cape Town',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    upvotes: 18
  },
  { 
    id: '3', 
    type: 'Safety',
    title: 'Safety Alert at Salt River',
    description: 'Platform is very clean today. New lighting installed makes it feel much safer.',
    station: 'Salt River',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    upvotes: 12
  },
  { 
    id: '4', 
    type: 'Overcrowded',
    title: 'Overcrowded at Observatory',
    description: 'Peak hour rush. Trains are packed. Consider waiting for the next one.',
    station: 'Observatory',
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    upvotes: 8
  },
  { 
    id: '5', 
    type: 'Delay',
    title: 'Delay at Claremont',
    description: 'Signal failure causing 10 minute delays on the Southern Line.',
    station: 'Claremont',
    created_at: new Date(Date.now() - 90 * 60000).toISOString(),
    upvotes: 15
  },
  { 
    id: '6', 
    type: 'Safety',
    title: 'Safety Alert at Fish Hoek',
    description: 'Security presence increased. Feeling much safer during evening commute.',
    station: 'Fish Hoek',
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    upvotes: 22
  },
];

export default function CommunityPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);

  const handleUpvote = (id: string) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === id 
          ? { ...incident, upvotes: incident.upvotes + 1 }
          : incident
      )
    );
    toast.success('Upvoted!');
  };

  const handleSubmitReport = (data: { type: string; station: string; description: string }) => {
    const newIncident: Incident = {
      id: Date.now().toString(),
      type: data.type as Incident['type'],
      title: `${data.type} at ${data.station}`,
      description: data.description || 'No additional details provided.',
      station: data.station,
      created_at: new Date().toISOString(),
      upvotes: 0
    };
    
    setIncidents(prev => [newIncident, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header 
        title="The Voice" 
        subtitle="Live Commuter Reports"
      />
      
      <main className="container max-w-lg mx-auto px-4 py-6">
        {/* Feed Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-5"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-full">
            <Radio className="w-4 h-4 text-destructive animate-pulse" />
            <span className="text-sm font-bold text-destructive">LIVE</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {incidents.length} reports today
          </span>
        </motion.div>

        {/* Incident Feed */}
        {incidents.length > 0 ? (
          <div className="space-y-3">
            {incidents.map((incident, index) => (
              <IncidentCard 
                key={incident.id}
                incident={incident}
                index={index}
                onUpvote={handleUpvote}
              />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-card rounded-2xl border-2 border-foreground"
          >
            <MessageCircle className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-foreground font-bold text-lg">No reports yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Be the first to share what's happening!
            </p>
          </motion.div>
        )}
      </main>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-4 w-16 h-16 rounded-full bg-primary text-primary-foreground border-3 border-foreground neo-shadow flex items-center justify-center z-40"
        style={{ borderWidth: '3px' }}
      >
        <Plus className="w-8 h-8" strokeWidth={2.5} />
      </motion.button>

      {/* Report Modal */}
      <ReportIncidentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
}
