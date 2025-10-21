import { NextResponse } from "next/server";
import { json } from "stream/consumers";

export async function POST(request: Request) {
    try {
        const { imageData, aspectRatio, prompt, projectId }: { imageData: any, aspectRatio: string, prompt: string, projectId: string } = await request.json();
        console.log("Received upload-image-video request with:", { imageData, aspectRatio, prompt, projectId });
        if (!imageData) {
            return NextResponse.json({ status: 0, message: "Thiếu tham số" }, { status: 400 });
        }

        // Get token server-side from session endpoint with cookie
        const sessionRes = await fetch(`https://labs.google/fx/api/auth/session`, {
            headers: {
                Cookie: process.env.NEXT_PUBLIC_COOKIE_NAME ?? "",
            },
        });
        if (!sessionRes.ok) {
            return NextResponse.json({ status: 0, message: "Không thể lấy token" }, { status: 502 });
        }
        const sessionData = await sessionRes.json();
        const token = sessionData?.access_token as string | undefined;
        if (!token) {
            return NextResponse.json({ status: 0, message: "Token không hợp lệ" }, { status: 401 });
        }
        let aspectRatioSetting = "VIDEO_ASPECT_RATIO_PORTRAIT";
        if (aspectRatio === '16:9') {
            aspectRatioSetting = "VIDEO_ASPECT_RATIO_LANDSCAPE";
        } else if (aspectRatio === '1:1') {
            aspectRatioSetting = "VIDEO_ASPECT_RATIO_SQUARE";
        }

        const res = await fetch(`https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoStartImage`, {
            method: "POST",
            headers: {
                authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({
                "clientContext": {
                    "projectId": projectId,
                    "tool": "PINHOLE",
                    "userPaygateTier": "PAYGATE_TIER_TWO"
                },
                "requests": [
                    {
                        "aspectRatio": aspectRatioSetting,
                        "seed": 100000,
                        "textInput": {
                            "prompt": prompt
                        },
                        "promptExpansionInput": {
                            "prompt": prompt,
                            "seed": 100000,
                            "templateId": "0TNlfC6bSF",
                            "imageInputs": [
                                {
                                    "mediaId": imageData.id,
                                    "imageUsageType": "IMAGE_USAGE_TYPE_UNSPECIFIED"
                                }
                            ]
                        },
                        "videoModelKey": "veo_3_1_i2v_s_fast_ultra",
                        "startImage": {
                            "mediaId": imageData.id
                        },
                        "metadata": {
                            "sceneId": crypto.randomUUID() // tự tạo
                        }
                    }
                ]
            })
        });

        if (!res.ok) {
            return NextResponse.json({ status: 0, message: "Không có dữ liệu" }, { status: res.status });
        }

        const data = await res.json();
        console.log("Video generation response data:", JSON.stringify(data));
        return NextResponse.json(data);
    } catch (err) {
        console.log('Error during image generation:', err);
        return NextResponse.json({ status: 0, message: "Lỗi proxy" }, { status: 500 });
    }
}