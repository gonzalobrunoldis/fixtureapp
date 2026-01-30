import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { message: 'Standings API endpoint not implemented yet' },
    { status: 501 }
  );
}
