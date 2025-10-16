
import React, { useEffect, useState } from 'react';
import { CopyIcon, CheckIcon } from './icons';
import { Spinner } from '@/components/Spinner';
import { useGlobal } from "@/context/GlobalContext";

interface PromptCardProps {
    text: string;
    workflowId: any | null;
}

export const ImageCard: React.FC<PromptCardProps> = ({ text, workflowId }) => {
    const { tokenData } = useGlobal();

    if (workflowId == null || !tokenData) return <Spinner />
    if (!workflowId.result || !tokenData) return <Spinner />
    console.log("Workflow ID in ImageCard:", workflowId);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [image, setImage] = useState<string>("");
    useEffect(() => {
        const fetchWorkflowId = async () => {

            try {
                const res = await fetch(`/api/create-image?token=${tokenData.access_token}&workflowId=${workflowId.result.data.json.result.workflowId}&prompt=${text}`, {
                    method: "GET",
                    credentials: "include", // gửi cookie thật của user nếu cần
                });
                if (!res.ok) throw new Error("Không có dữ liệu");
                const data = await res.json();
                console.log("Fetched image data:", data);
                setImage(data?.imagePanels[0]?.generatedImages[0]?.encodedImage);
                setIsLoading(false);
            } catch (e) {
                console.error(e);
            }

        };

        fetchWorkflowId();

    }, [])

    return (
        <>
            {isLoading ? <Spinner /> : <div className="relative bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md group">
                <img src={`data:image/jpeg;base64,${image}`} alt="" />
            </div>}
        </>
    )
};
