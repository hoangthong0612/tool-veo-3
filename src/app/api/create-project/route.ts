import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`https://labs.google/fx/api/trpc/project.createProject`, {
      method: "POST",
      headers: {
        // 👇 Chỉ server mới được quyền gắn cookie header
        Cookie: process.env.NEXT_PUBLIC_COOKIE_NAME ?? "",
      },
      body: JSON.stringify({
        "json": {
          "projectTitle": "New",
          "toolName": "PINHOLE"
        }
      })
    });

    if (!res.ok) {
      return NextResponse.json({ status: 0, message: "Không có dữ liệu" });
    }

    const data = await res.json();

    return NextResponse.json({ status: 1, projectId: data.result.data.json.result.projectId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: 0, message: "Lỗi proxy" });
  }
}
