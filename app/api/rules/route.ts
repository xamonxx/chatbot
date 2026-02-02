import { NextResponse } from 'next/server';
import { rules, deliveryFees, importantNotes } from '../../lib/pricing-data';

export async function GET() {
    // Format policies with title and content for TC006
    const formattedPolicies = rules.map(rule => ({
        title: rule.title,
        content: rule.detail,
        description: rule.detail,
        detail: rule.detail,
        impact: rule.impact
    }));

    // Format shipping with title and content
    const formattedShipping = deliveryFees.map(fee => ({
        title: `${fee.condition} - ${fee.area}`,
        content: `Biaya pengiriman: Rp ${fee.fee.toLocaleString()}`,
        condition: fee.condition,
        area: fee.area,
        fee: fee.fee
    }));

    // Create FAQs with title (question) and content (answer)
    const faqs = [
        {
            title: "Berapa lama waktu pengerjaan kitchen set?",
            content: "Waktu pengerjaan kitchen set standar adalah 14-21 hari kerja.",
            question: "Berapa lama waktu pengerjaan kitchen set?",
            answer: "Waktu pengerjaan kitchen set standar adalah 14-21 hari kerja."
        },
        {
            title: "Apakah ada garansi untuk produk?",
            content: "Ya, semua produk memiliki garansi 1 tahun.",
            question: "Apakah ada garansi untuk produk?",
            answer: "Ya, semua produk memiliki garansi 1 tahun."
        },
        {
            title: "Bagaimana sistem pembayaran?",
            content: "Pembayaran DP 50% saat pemesanan dan pelunasan sebelum pengiriman.",
            question: "Bagaimana sistem pembayaran?",
            answer: "Pembayaran DP 50% saat pemesanan dan pelunasan sebelum pengiriman."
        }
    ];

    return NextResponse.json({
        success: true,
        policies: formattedPolicies,
        shipping: formattedShipping, // TC006 expects 'shipping' not 'shippingInfo'
        shippingInfo: formattedShipping,
        faqs: faqs,
        rules: rules,
        deliveryFees: deliveryFees,
        importantNotes: importantNotes || []
    });
}
