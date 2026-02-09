import { useLines } from '@/hooks/useRailwayData';
import { LineCard } from '@/components/LineCard';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';

const LinesPage = () => {
  const { data: lines, isLoading } = useLines();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="All Lines" 
        subtitle="Cape Town Metrorail"
      />
      
      <main className="container max-w-lg mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {lines?.map((line, index) => (
              <LineCard key={line.id} line={line} index={index} />
            ))}
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
};

export default LinesPage;
