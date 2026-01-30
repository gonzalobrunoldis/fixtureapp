import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { message: 'Predictions API endpoint not implemented yet' },
    { status: 501 }
  );
}
