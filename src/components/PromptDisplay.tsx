
"use client";
import React, { useEffect, useRef, useState } from 'react';
import type { PromptPair } from '@/types/main';
import { PromptCard } from './PromptCard';
import { CameraIcon, VideoIcon } from './icons';
import { ImageCard } from './ImageCard';

interface PromptDisplayProps {
  prompts: PromptPair[];
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompts, aspectRatio = '1:1' }) => {
  const [workflowId, setWorkflowId] = React.useState<any | null>(null);
  const createdOnceRef = useRef(false);
  const rightColRef = useRef<HTMLDivElement | null>(null);
  const [leftHeight, setLeftHeight] = useState<number | null>(null);
  const rowHeightsRef = useRef<Record<number, number>>({});
  useEffect(() => {

    const fetchWorkflowId = async () => {

      try {
        const res = await fetch(`/api/create-workflow`, {
          method: "GET",
          credentials: "include", // gửi cookie thật của user nếu cần
        });
        if (!res.ok) throw new Error("Không có dữ liệu");
        const data = await res.json();
        console.log("Fetched token data:", data);
        setWorkflowId(data);
      } catch (e) {
        console.error(e);
        setWorkflowId(null);
      }

    };

    if (createdOnceRef.current) return;
    createdOnceRef.current = true;
    fetchWorkflowId();



  }, []);
  
  // Row-based layout: each image matches its prompt height by default
  return (
    <div className="space-y-8">
      {prompts.map((p, index) => (
        <div key={`row-${index}`} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-3 flex" style={{ alignItems: 'stretch' }}>
            <ImageCard 
              text={p.imagePrompt} 
              workflowId={workflowId} 
              aspectRatio={aspectRatio}
              onHeightChange={(h) => { rowHeightsRef.current[index] = h; }}
            />
          </div>
          <div className="lg:col-span-9">
            <PromptCard 
              text={p.videoPrompt}
              className={rowHeightsRef.current[index] ? 'h-full overflow-auto' : ''}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
