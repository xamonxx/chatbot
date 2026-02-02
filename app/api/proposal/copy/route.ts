import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const quotation = body.quotation || body.text || '';

        return NextResponse.json({
            success: true,
            copiedText: quotation,
            copied: true,
            message: 'Text copied to clipboard successfully'
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            copiedText: ""
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: 'ok', message: 'Proposal Copy API Ready' });
}
