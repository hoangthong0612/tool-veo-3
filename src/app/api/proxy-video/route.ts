import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // 1. Lấy URL của video từ query params
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');

    // 2. Kiểm tra xem URL có được cung cấp không
    if (!videoUrl) {
        return new NextResponse('Vui lòng cung cấp tham số URL của video', {
            status: 400,
        });
    }

    try {
        // 3. Dùng fetch để lấy video từ Google Cloud Storage
        // Yêu cầu này được thực hiện từ server nên không bị CORS
        const videoResponse = await fetch(videoUrl);

        // 4. Kiểm tra nếu không lấy được video
        if (!videoResponse.ok || !videoResponse.body) {
            return new NextResponse('Không thể lấy video từ nguồn', {
                status: videoResponse.status,
            });
        }

        // 5. Lấy headers gốc (quan trọng nhất là Content-Type)
        const headers = new Headers();
        headers.set(
            'Content-Type',
            videoResponse.headers.get('Content-Type') || 'video/mp4'
        );
        headers.set(
            'Content-Length',
            videoResponse.headers.get('Content-Length') || ''
        );

        // 6. Trả về một Response mới, stream thẳng body của video về cho client
        // Cách này rất hiệu quả vì không cần tải toàn bộ video về server trước
        return new Response(videoResponse.body, {
            status: 200,
            headers: headers,
        });

    } catch (error) {
        console.error('[VIDEO_PROXY_ERROR]', error);
        return new NextResponse('Lỗi máy chủ nội bộ', { status: 500 });
    }
}