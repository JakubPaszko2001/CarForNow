import { NextResponse } from 'next/server';
import { getScrapedCars } from '@/app/lib/getCars';

export async function GET() {
  const cars = await getScrapedCars();
  return NextResponse.json(cars);
}