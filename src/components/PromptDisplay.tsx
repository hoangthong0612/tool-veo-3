
"use client";
import React, { useEffect } from 'react';
import type { PromptPair } from '@/types/main';
import { PromptCard } from './PromptCard';
import { CameraIcon, VideoIcon } from './icons';
import { ImageCard } from './ImageCard';

interface PromptDisplayProps {
  prompts: PromptPair[];
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompts }) => {
  const [workflowId, setWorkflowId] = React.useState<any | null>(null);
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

    fetchWorkflowId();



  }, []);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Image Prompts Column */}
      <div className="space-y-6">
        <h3 className="flex items-center justify-center gap-3 text-xl font-semibold text-center text-rose-400">
          <CameraIcon className="w-6 h-6" />
          <span>Prompt tạo hình ảnh</span>
        </h3>
        {prompts.map((p, index) => (
          <ImageCard key={`img-${index}`} text={p.imagePrompt} workflowId={workflowId} />
        ))}
      </div>



      {/* Video Prompts Column */}
      <div className="space-y-6">
        <h3 className="flex items-center justify-center gap-3 text-xl font-semibold text-center text-indigo-400">
          <VideoIcon className="w-6 h-6" />
          <span>Prompt tạo video (8 giây)</span>
        </h3>
        {prompts.map((p, index) => (
          <PromptCard key={`vid-${index}`} text={p.videoPrompt} />
        ))}
      </div>
    </div>
  );
};
