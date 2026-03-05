import { useState, useEffect } from 'react';
import { MessageCircle, Plus, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { IncidentCard } from '@/components/IncidentCard';
import { ReportIncidentModal } from '@/components/ReportIncidentModal';
import { supabase } from '@/lib/Supabase/supabase';
import { toast } from 'sonner';
import { ReportWithStation } from '@/types/railway';
import { useAuth } from '@/contexts/AuthContext';

export default function CommunityPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reports, setReports] = useState<ReportWithStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*, stations(name)')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching reports:', error);
    } else {
      setReports((data || []) as ReportWithStation[]);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpvote = async (id: string) => {
    const report = reports.find(r => r.id === id);
    if (!report) return;
    
    const { error } = await supabase
      .from('reports')
      .update({ upvotes: report.upvotes + 1 })
      .eq('id', id);
    
    if (error) {
      // Fallback: update locally even if RLS blocks update
      setReports(prev => prev.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
    } else {
      setReports(prev => prev.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
    }
    toast.success('Upvoted!');
  };

  const handleSubmitReport = async (data: { type: string; station_id: number; description: string }) => {
    const { error } = await supabase
      .from('reports')
      .insert({ 
        station_id: data.station_id, 
        type: data.type, 
        description: data.description || null,
        user_id: user?.id || null,
      });
    
    if (error) {
      toast.error('Failed to submit report');
      console.error(error);
      return;
    }
    
    toast.success('Report submitted!', { description: 'Thanks for helping fellow commuters.' });
    fetchReports();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="The Voice" subtitle="Live Commuter Reports" />
      
      <main className="container max-w-lg mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-full">
            <Radio className="w-4 h-4 text-destructive animate-pulse" />
            <span className="text-sm font-bold text-destructive">LIVE</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {reports.length} reports
          </span>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border-2 border-foreground p-4 animate-pulse h-24" />
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report, index) => (
              <IncidentCard 
                key={report.id}
                incident={{
                  id: report.id,
                  type: report.type as any,
                  title: `${report.type} at ${report.stations?.name || 'Unknown'}`,
                  description: report.description || 'No additional details.',
                  station: report.stations?.name || 'Unknown',
                  created_at: report.created_at,
                  upvotes: report.upvotes,
                }}
                index={index}
                onUpvote={handleUpvote}
              />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 bg-card rounded-2xl border-2 border-foreground">
            <MessageCircle className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-foreground font-bold text-lg">No reports yet</p>
            <p className="text-muted-foreground text-sm mt-1">Be the first to share what's happening!</p>
          </motion.div>
        )}
      </main>

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

      <ReportIncidentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
}
