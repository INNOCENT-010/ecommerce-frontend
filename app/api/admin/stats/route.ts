//api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    
    const orders = await prisma.order.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });

    
    const stats = {
      totalOrders: await prisma.order.count(),
      totalRevenue: await prisma.order.aggregate({
        _sum: { total: true }
      }),
      recentOrders: orders.map(order => ({
        id: order.id,
        customer: order.user?.email || 'Guest',
        total: order.total,
        status: order.status,
        date: order.createdAt.toISOString().split('T')[0]
      }))
    };

    
    if (format === 'csv') {
      const csv = convertToCSV(stats.recentOrders);
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
      { error: 'Internal server error' },
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
