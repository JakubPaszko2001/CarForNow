import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', 'carProperties.json');

function readProps(): Record<string, Record<string, unknown>> {
  try {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeProps(data: Record<string, Record<string, unknown>>) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  return NextResponse.json(readProps());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, ...props } = body;
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    const all = readProps();
    all[slug] = { ...(all[slug] ?? {}), ...props };
    writeProps(all);

    return NextResponse.json({ ok: true, slug, props: all[slug] });
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}
