"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/react";

interface DraggableProps {
  id: string;
  children: React.ReactNode;
}

export function Draggable({ id, children }: DraggableProps) {
  const { ref, isDragging } = useDraggable({ id });

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.4 : undefined,
        cursor: "grab",
      }}
      className="w-full active:cursor-grabbing transition-opacity duration-200"
    >
      {children}
    </div>
  );
}
