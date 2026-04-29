import { NextResponse } from 'next/server';
import { getScrapedCars } from '@/app/lib/getCars';
import fs from 'fs';
import path from 'path';

function readProps(): Record<string, Record<string, unknown>> {
  try {
    const file = path.join(process.cwd(), 'data', 'carProperties.json');
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return {};
  }
}

export async function GET() {
  const cars = await getScrapedCars();
  const props = readProps();

  const merged = cars.map((car: Record<string, unknown>) => {
    const slug = String(car.link ?? '').replace('/auto/', '').replace(/\//g, '');
    return { ...car, ...(props[slug] ?? {}) };
  });

  return NextResponse.json(merged);
}
