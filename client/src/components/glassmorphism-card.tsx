import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as React from "react";

interface GlassmorphismCardProps extends React.HTMLAttributes<HTMLDivElement> {
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
