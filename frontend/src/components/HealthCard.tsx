import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HealthCardProps extends React.ComponentProps<typeof Card> {
  gradient?: boolean;
  darkMode?: boolean;
}

export default function HealthCard({ 
  className, 
  gradient = false, 
  darkMode = false,
  ...props 
}: HealthCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300",
        gradient && !darkMode && "bg-gradient-to-br from-white to-gray-50",
        gradient && darkMode && "bg-gradient-to-br from-gray-800 to-gray-900",
        !gradient && !darkMode && "bg-white",
        !gradient && darkMode && "bg-gray-800 border-gray-700",
        darkMode && "text-white",
        className
      )}
      {...props}
    />
  );
}