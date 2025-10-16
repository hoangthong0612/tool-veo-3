import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`https://labs.google/fx/api/trpc/media.createOrUpdateWorkflow`, {
      method: "POST",
      headers: {
        // 👇 Chỉ server mới được quyền gắn cookie header
        Cookie: process.env.NEXT_PUBLIC_COOKIE_NAME ?? "",
      },
      body: JSON.stringify({
        "json": {
          "clientContext": {
            "tool": "BACKBONE",
            "sessionId": ";1760633829782"
          },
          "mediaGenerationIdsToCopy": [],
          "workflowMetadata": {
            "workflowName": "Whisk: 17/10/25"
          }
        }
      })
    });

    if (!res.ok) {
      return NextResponse.json({ status: 0, message: "Không có dữ liệu" });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: 0, message: "Lỗi proxy" });
  }
}
