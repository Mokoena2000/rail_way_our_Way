import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { User, MessageSquare, CreditCard, Info, ExternalLink } from 'lucide-react';

const menuItems = [
  { 
    icon: User, 
    label: 'About Creator', 
    description: 'Learn about the team behind Railway Our Way',
    href: '#about'
  },
  { 
    icon: MessageSquare, 
    label: 'Feedback', 
    description: 'Share your thoughts and suggestions',
    href: '#feedback'
  },
  { 
    icon: CreditCard, 
    label: 'Fare Guide', 
    description: 'View ticket prices and zones',
    href: '#fares'
  },
  { 
    icon: Info, 
    label: 'Help & Support', 
    description: 'Get help with the app',
    href: '#help'
  },
];

export default function MorePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="More" 
        subtitle="Settings & Information"
      />
      
      <main className="container max-w-lg mx-auto px-4 py-6">
        <div className="space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="block bg-card rounded-2xl p-4 border-2 border-foreground neo-shadow-sm animate-fade-in transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-card-foreground">{item.label}</p>
                    <p className="text-sm text-card-foreground/70">{item.description}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-card-foreground/50" />
                </div>
              </a>
            );
          })}
        </div>

        {/* App Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            Railway Our Way v1.0.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Made with ❤️ for Cape Town commuters
          </p>
        </div>
      </main>
    </div>
  );
}