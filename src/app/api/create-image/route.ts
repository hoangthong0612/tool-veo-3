import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const token = searchParams.get("token");
        const workflowId = searchParams.get("workflowId");
        const prompt = searchParams.get("prompt");
        const res = await fetch(`https://aisandbox-pa.googleapis.com/v1/whisk:generateImage`, {
            method: "POST",
            headers: {
                // 👇 Chỉ server mới được quyền gắn cookie header
                authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({
                "clientContext": {
                    "workflowId": workflowId,
                    "tool": "BACKBONE",
                    "sessionId": ";1760632653749"
                },
                "imageModelSettings": {
                    "imageModel": "IMAGEN_3_5",
                    "aspectRatio": "IMAGE_ASPECT_RATIO_PORTRAIT"
                },
                "seed": 442806,
                "prompt": prompt,
                "mediaCategory": "MEDIA_CATEGORY_BOARD"
            })
        });

        if (!res.ok) {
            return NextResponse.json({ status: 0, message: "Không có dữ liệu" });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        console.log('Error during image generation:', err);
        console.error(err);
        return NextResponse.json({ status: 0, message: "Lỗi proxy" });
    }
}