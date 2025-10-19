
import React, { useEffect, useState, useRef } from 'react';
import { CopyIcon, CheckIcon } from './icons';
import { Spinner } from '@/components/Spinner';
import { useGlobal } from "@/context/GlobalContext";

interface PromptCardProps {
    text: string;
    workflowId: any | null;
    aspectRatio?: '9:16' | '16:9' | '1:1';
    onHeightChange?: (height: number) => void;
}

export const ImageCard: React.FC<PromptCardProps> = ({ text, workflowId, aspectRatio = '1:1', onHeightChange }) => {
    const { tokenData } = useGlobal();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [image, setImage] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const hasWorkflow = Boolean(workflowId && workflowId.result);
    const createdOnceRef = useRef(false);
    useEffect(() => {
        if (!hasWorkflow) {
            return;
        }
        if (createdOnceRef.current) {
            return;
        }
        const fetchWorkflowId = async () => {

            try {
                const res = await fetch(`/api/create-image`, {
                    method: "POST",
                    credentials: "include",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        workflowId: workflowId.result.data.json.result.workflowId,
                        prompt: text,
                    }),
                });
                if (!res.ok) throw new Error("Không có dữ liệu");
                const data = await res.json();
                console.log("Fetched image data:", data);
                setImage(data?.imagePanels[0]?.generatedImages[0]?.encodedImage);
                setIsLoading(false);
            } catch (e) {
                console.error(e);
                setError('Lỗi tạo ảnh. Vui lòng thử lại.');
                setIsLoading(false);
            }

        };

        setIsLoading(true);
        setError(null);
        fetchWorkflowId();
        createdOnceRef.current = true;

    }, [hasWorkflow, text, workflowId])

    return (
        <>
            {!hasWorkflow || isLoading ? <Spinner /> : error ? (
                <div className="relative bg-gray-800 p-5 rounded-xl border border-gray-700 text-red-300">
                    {error}
                </div>
            ) : (
                <div className="relative bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-md group" ref={(el) => {
                    if (!el || !onHeightChange) return;
                    const report = () => onHeightChange(el.offsetHeight);
                    report();
                    const ro = new ResizeObserver(report);
                    ro.observe(el);
                    // Store observer on element to disconnect automatically on unmount
                    // @ts-ignore
                    el.__ro = ro;
                }}>
                    <div 
                        className={`w-full mx-auto ${
                            aspectRatio === '9:16' ? 'aspect-[9/16]' : 
                            aspectRatio === '16:9' ? 'aspect-[16/9]' : 
                            'aspect-square'
                        }`}
                    >
                        <img 
                            className="w-full h-full object-cover rounded-lg" 
                            src={`data:image/jpeg;base64,${image}`} 
                            alt="" 
                        />
                    </div>
                </div>
            )}
        </>
    )
};
