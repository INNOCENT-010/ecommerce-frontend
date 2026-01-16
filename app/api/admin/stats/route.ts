import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    // Call your FastAPI backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    
    const response = await fetch(`${backendUrl}/api/admin/stats`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const stats = await response.json();

    // Format to CSV if requested
    if (format === 'csv') {
      const csv = convertToCSV(stats.recentOrders || []);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="stats.csv"'
        }
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

function convertToCSV(orders: any[]): string {
  const headers = ['ID', 'Customer', 'Total', 'Status', 'Date'];
  const rows = orders.map(order => [
    order.id,
    order.customer,
    order.total,
    order.status,
    order.date
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}