import * as React from "react";
import { cn } from "@/lib/utils";

interface BackgroundGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  showGrid?: boolean;
  showDots?: boolean;
}

export function BackgroundGlow({
  className,
  showGrid = true,
  showDots = true,
  ...props
}: BackgroundGlowProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 -z-10 overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-500",
        className
      )}
      {...props}
    >
      {/* Glow Blobs Container */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Blob 1: Primary Indigo Glow */}
        <div
          className="absolute -top-[10%] -left-[10%] w-[350px] h-[350px] md:w-[650px] md:h-[650px] rounded-full 
          bg-gradient-to-br from-indigo-500/20 to-purple-600/10 
          dark:from-indigo-500/15 dark:to-purple-600/5 
          blur-[80px] md:blur-[130px] animate-float-1"
        />

        {/* Blob 2: Fuchsia/Pink Secondary Glow */}
        <div
          className="absolute -bottom-[10%] -right-[10%] w-[350px] h-[350px] md:w-[600px] md:h-[600px] rounded-full 
          bg-gradient-to-tr from-fuchsia-500/15 to-rose-600/10 
          dark:from-fuchsia-500/10 dark:to-rose-600/5 
          blur-[80px] md:blur-[120px] animate-float-2"
        />

        {/* Blob 3: Cyan Accent Glow */}
        <div
          className="absolute top-[30%] right-[10%] w-[250px] h-[250px] md:w-[450px] md:h-[450px] rounded-full 
          bg-gradient-to-r from-cyan-500/15 to-blue-500/10 
          dark:from-cyan-500/10 dark:to-blue-500/5 
          blur-[80px] md:blur-[110px] animate-float-3"
        />
      </div>

      {/* Decorative Grid Overlay */}
      {showGrid && (
        <div className="absolute inset-0 bg-grid-pattern opacity-60 dark:opacity-45 pointer-events-none" />
      )}

      {/* Decorative Dot Overlay */}
      {showDots && (
        <div className="absolute inset-0 bg-dot-pattern opacity-80 dark:opacity-60 pointer-events-none" />
      )}

      {/* Vignette effect for premium depth */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--background)_95%)] 
        opacity-60 dark:opacity-85 pointer-events-none" 
      />
    </div>
  );
}
