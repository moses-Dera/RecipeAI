import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    // Vercel securely sends a Bearer token matching your CRON_SECRET env variable.
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Ping the database to keep it awake
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({ success: true, message: 'Database pinged successfully' });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to ping database' },
      { status: 500 }
    );
  }
}
