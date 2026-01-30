import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { message: 'Sync fixtures cron endpoint not implemented yet' },
    { status: 501 }
  );
}
