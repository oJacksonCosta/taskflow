"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/react";

interface DroppableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function Droppable({ id, children, className }: DroppableProps) {
  const { ref, isDropTarget } = useDroppable({ id });

  return (
    <div
      ref={ref}
      className={`${className} ${isDropTarget ? "border-default bg-card border-2 border-dashed" : "border-2 border-transparent"} rounded-2xl transition-all duration-200`}
    >
      {children}
    </div>
  );
}
