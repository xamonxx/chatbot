import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const chatContent = body.chatContent || body.content || '';

        const quotation = `QUOTATION / PROPOSAL

Dear Valued Customer,

Based on your consultation: "${chatContent.substring(0, 100)}..."

PROJECT BREAKDOWN:

1. Kitchen Set (Premium Aluminium)
   - Length: 3 meter
   - Unit Price: Rp 4.500.000/meter
   - Subtotal: Rp 13.500.000

2. Wall Panel (WPC Premium)
   - Area: 10 m²
   - Unit Price: Rp 350.000/m²
   - Subtotal: Rp 3.500.000

---
TOTAL ESTIMATE: Rp 17.000.000 ($1,190 USD)
---

Terms:
- 50% down payment required
- Valid for 30 days

Best regards,
Home Putra Interior Team
`;

        return NextResponse.json({
            success: true,
            quotation: quotation,
            proposal: quotation,
            formattedProposal: quotation,
            copyable: true
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            quotation: ""
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: 'ok', message: 'Proposal Generate API Ready' });
}
