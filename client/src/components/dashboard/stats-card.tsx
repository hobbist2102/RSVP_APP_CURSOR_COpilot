import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, UserX, Clock, Users, Activity } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode | string;
  variant?: 'default' | 'primary' | 'secondary';
  onClick?: () => void;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  variant = 'default',
  onClick,
  change
}: StatsCardProps & { change?: { value: number; text: string } }) {
  // Get proper icon for each metric type
  const getIcon = () => {
    if (typeof icon === 'string') {
      switch (icon) {
        case 'confirmed':
          return <UserCheck className="h-5 w-5" />;
        case 'declined':
          return <UserX className="h-5 w-5" />;
        case 'pending':
          return <Clock className="h-5 w-5" />;
        case 'total':
          return <Users className="h-5 w-5" />;
        default:
          return <Activity className="h-5 w-5" />;
      }
    }
    return icon;
  };

  // Clean titles to avoid duplication
  const getCleanTitle = () => {
    switch (title) {
      case 'RSVP Confirmed':
        return 'Confirmed';
      case 'RSVP Declined':
        return 'Declined';
      case 'Awaiting Response':
        return 'Pending';
      case 'Total Guests':
        return 'Total';
      default:
        return title;
    }
  };

  return (
    <Card 
      className="bg-card border-border text-card-foreground hover:bg-muted/50 transition-colors cursor-pointer flat"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-accent">
                {getIcon()}
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {getCleanTitle()}
              </p>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {value}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatsCard;