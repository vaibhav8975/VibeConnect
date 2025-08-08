import { Card, CardProps } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GlassmorphismCardProps extends CardProps {
  children: React.ReactNode;
}

export default function GlassmorphismCard({ 
  children, 
  className, 
  ...props 
}: GlassmorphismCardProps) {
  return (
    <Card 
      className={cn("glassmorphism border-0 bg-transparent", className)} 
      {...props}
    >
      {children}
    </Card>
  );
}
