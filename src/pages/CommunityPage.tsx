import { useState, useEffect } from 'react';
import { Plus, Radio, Clock, Ban, Shield, Users, AlertTriangle, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header'; // Keeping your existing Header
import { supabase } from '@/integrations/supabase/client';
import { Station, IncidentWithStation, IncidentType } from '@/types/railway';
import ReportModal from '@/components/ReportModal';
import { toast } from 'sonner';

// Mock Data to show before real DB data flows in
const MOCK_REPORTS: IncidentWithStation[] = [
  { id: '1', station_id: '1', station_name: 'Bellville', type: 'Delay', description: 'Train is stuck at the platform, no announcements. Been waiting for 20 mins.', upvotes: 24, created_at: '2 mins ago' },
  { id: '2', station_id: '2', station_name: 'Cape Town', type: 'Cancellation', description: 'The 08:30 Southern Line service has been cancelled.', upvotes: 18, created_at: '15 mins ago' },
];

export default function CommunityPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  // Start with mock data, eventually replace with real fetch
  const [reports, setReports] = useState<IncidentWithStation[]>(MOCK_REPORTS);

  // 1. Fetch Real Stations from Supabase
  useEffect(() => {
    async function fetchStations() {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('name');
      
      if (data) {
        // Map Supabase data to your Station type if needed, or just use as is
        setStations(data as unknown as Station[]);
      }
    }
    fetchStations();
  }, []);

  // 2. Handle Upvote (Optimistic Update)
  const handleUpvote = (id: string) => {
    setReports(prev => 
      prev.map(report => 
        report.id === id 
          ? { ...report, upvotes: report.upvotes + 1 }
          : report
      )
    );
    toast.success('Upvoted!');
  };

  // 3. Handle New Report (The Fix is Here)
  const handlePostReport = (data: { station_id: string; type: IncidentType; description: string }) => {
    // FIX: Convert s.id to String() so it matches data.station_id
    const stationName = stations.find(s => String(s.id) === data.station_id)?.name || 'Unknown Station';
    
    const newReport: IncidentWithStation = {
      id: Date.now().toString(),
      station_id: data.station_id,
      station_name: stationName,
      type: data.type,
      description: data.description,
      upvotes: 0,
      created_at: 'Just now',
    };

    setReports(prev => [newReport, ...prev]);
    toast.success('Report submitted!', {
      description: 'Thanks for helping fellow commuters.',
    });
  };

  // Helper: Icon based on type
  const getIcon = (type: IncidentType) => {
    switch (type) {
      case 'Delay': return <Clock className="text-yellow-600 w-5 h-5" />;
      case 'Cancellation': return <Ban className="text-red-600 w-5 h-5" />;
      case 'Safety': return <Shield className="text-green-600 w-5 h-5" />;
      case 'Crowding': return <Users className="text-orange-600 w-5 h-5" />;
      default: return <AlertTriangle className="text-gray-600 w-5 h-5" />;
    }
  };

  // Helper: Badge color based on type
  const getBadgeColor = (type: IncidentType) => {
    switch (type) {
      case 'Delay': return 'bg-yellow-100 border-yellow-200';
      case 'Cancellation': return 'bg-red-100 border-red-200';
      case 'Safety': return 'bg-green-100 border-green-200';
      case 'Crowding': return 'bg-orange-100 border-orange-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1DE] pb-24">
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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-full border border-red-200">
            <Radio className="w-4 h-4 text-red-600 animate-pulse" />
            <span className="text-sm font-bold text-red-600">LIVE</span>
          </div>
          <span className="text-sm text-[#3D405B]/70">
            {reports.length} reports today
          </span>
        </motion.div>

        {/* Incident Feed */}
        <div className="space-y-4">
          {reports.map((report, index) => (
            <motion.div 
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-2xl shadow-sm border border-[#3D405B]/10"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${getBadgeColor(report.type)}`}>
                    {getIcon(report.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3D405B] leading-tight">
                      {report.type} at {report.station_name}
                    </h3>
                    <span className="text-xs text-gray-400 font-medium">{report.created_at}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-[#3D405B]/80 text-sm mb-4 pl-[3.25rem]">
                {report.description}
              </p>
              
              {/* Upvote Action */}
              <div className="flex justify-end pl-[3.25rem]">
                <button 
                  onClick={() => handleUpvote(report.id)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-[#E07A5F] transition-colors group"
                >
                  <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{report.upvotes} Helpful</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-4 w-16 h-16 rounded-full bg-[#E07A5F] hover:bg-[#D0694E] text-white border-4 border-[#F4F1DE] shadow-xl flex items-center justify-center z-40 transition-colors"
      >
        <Plus className="w-8 h-8" strokeWidth={2.5} />
      </motion.button>

      {/* The Corrected Report Modal */}
      <ReportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stations={stations}
        onSubmit={handlePostReport}
      />
    </div>
  );
}