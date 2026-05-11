import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PROPS_FILE = path.join(process.cwd(), 'data', 'carProperties.json');

function readAllProps(): Record<string, Record<string, unknown>> {
  try {
    if (!fs.existsSync(PROPS_FILE)) return {};
    return JSON.parse(fs.readFileSync(PROPS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeAllProps(data: Record<string, Record<string, unknown>>) {
  const dir = path.dirname(PROPS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PROPS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Reverse calcMonthly — wylicza wartość pojazdu z raty, opłaty wstępnej i okresu.
// Wzór: 2X² - (3D + total60)X + D² = 0 (większy pierwiastek).
function calcCarValue(monthly: number, downPayment: number, months: number): number {
  if (!monthly || monthly <= 0 || months <= 0) return 0;
  const targetMonthly = monthly + 5; // środek 10-zł "kosza" floor w calcMonthly
  const total = targetMonthly * months;
  const yearsLess = (60 - months) / 12;
  const total60 = total / Math.pow(0.9, yearsLess);
  const D = downPayment;
  const b = -(3 * D + total60);
  const c = D * D;
  const disc = b * b - 8 * c;
  if (disc < 0) return 0;
  const X = (-b + Math.sqrt(disc)) / 4;
  return Math.max(X, 0);
}

import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const response = await axios.get(`https://carforlease.pl/auto/${slug}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // --- FUNKCJA CZYSZCZĄCA CENĘ ---
    const cleanPrice = (text: string): number => {
      if (!text) return 0;
      const cleaned = text.replace(/[^\d.]/g, ''); // Zostawia tylko cyfry i kropkę
      return Math.round(parseFloat(cleaned)) || 0;
    };

    // --- 1. POBIERANIE CENY (Zoptymalizowane pod Forda) ---
    let price = 0;

    // KROK A: Próba z ID rata-kwota (w Fordzie jest tam "2900.00 PLN")
    const priceFromId = $('#rata-kwota').text().trim();
    if (priceFromId) {
      price = cleanPrice(priceFromId);
    }

    // KROK B: Jeśli A zawiodło lub cena to 0, szukamy w window.min (specyficzne dla Forda)
    if (price === 0) {
      $('script').each((_, el) => {
        const content = $(el).html() || '';
        // Szukamy window.min = XXXX.XX
        const match = content.match(/window\.min\s*=\s*([\d.]+)/);
        if (match && match[1]) {
          price = Math.round(parseFloat(match[1]));
        }
      });
    }

    // KROK C: Fallback na window.base (dla innych aut)
    if (price === 0) {
      $('script').each((_, el) => {
        const content = $(el).html() || '';
        const match = content.match(/window\.base\s*=\s*([\d.]+)/);
        if (match && match[1] && parseFloat(match[1]) > 0) {
          price = Math.round(parseFloat(match[1]));
        }
      });
    }

    // --- 2. MARKA I MODEL ---
    const fullTitle = $('#onecar-car-content h2').first().text().trim();
    const brand = fullTitle.split(' ')[0] || 'Auto';
    const model = fullTitle.split(' ').slice(1).join(' ') || '';

    // --- 3. ZDJĘCIA (Poprawione na dane z owl-item) ---
    const images: string[] = [];
    $('#onecar-car-carousel a[data-lightbox]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !images.includes(href)) images.push(href);
    });

    // --- 4. PARAMETRY TECHNICZNE (TABELA) ---
    const params_data: Record<string, string> = {};
    $('#onecar-car-content table tr').each((_, row) => {
      const ths = $(row).find('th');
      const tds = $(row).find('td');
      
      ths.each((i, el) => {
        const key = $(el).text().trim().replace(':', '');
        const val = $(tds[i]).text().trim();
        if (key && val) params_data[key] = val;
      });
    });

    // --- 5. LOKALIZACJA ---
    let lokalizacja = '';
    $('strong').each((_, el) => {
      if ($(el).text().includes('Lokalizacja')) {
        lokalizacja = $(el).closest('div').find('p').text().trim();
      }
    });

    // --- 6. WYPOSAŻENIE ---
    // W tym HTML opis jest w <header><p>
    const opis = $('#onecar-car-content header p').first().text().trim();

    // --- 7. OPŁATA WSTĘPNA (pierwsza/domyślna opcja w selekcie) ---
    let oplataWstepna = 0;
    const oplataText = $('#oplata-poczatkowa option').first().text().trim();
    if (oplataText) {
      oplataWstepna = parseInt(oplataText.replace(/\D/g, ''), 10) || 0;
    }

    // --- 8. OKRES UMOWY (pierwsza/domyślna opcja w selekcie, w miesiącach) ---
    let okresUmowy = 0;
    const okresText = $('#okres-umowy option').first().text().trim();
    if (okresText) {
      const m = okresText.match(/\d+/);
      if (m) okresUmowy = parseInt(m[0], 10) || 0;
    }

    // --- 9. WARTOŚĆ POJAZDU (zawsze świeżo liczona z API, auto-zapis do carProperties.json) ---
    const allProps = readAllProps();
    const customProps = { ...(allProps[slug] ?? {}) };
    let wartoscPojazdu: number | null = null;

    if (price > 0 && okresUmowy > 0) {
      const raw = calcCarValue(price, oplataWstepna, okresUmowy);
      if (raw > 0) wartoscPojazdu = Math.round(raw);
    }

    if (wartoscPojazdu != null && customProps.wartoscPojazdu !== wartoscPojazdu) {
      customProps.wartoscPojazdu = wartoscPojazdu;
      allProps[slug] = customProps;
      try {
        writeAllProps(allProps);
      } catch (e) {
        console.error('⚠️ Nie udało się zapisać wartości pojazdu:', e);
      }
    }

    return NextResponse.json({
      brand,
      model,
      images: images.length > 0 ? images : ['/placeholder-car.png'],
      opis,
      price,
      oplataWstepna,
      okresUmowy,
      lokalizacja: lokalizacja || 'Białystok',
      rok: params_data['Rok produkcji'] || 'N/A',
      nadwozie: params_data['Nadwozie'] || 'N/A',
      przebieg: params_data['Przebieg'] || 'N/A',
      paliwo: params_data['Paliwo'] || 'N/A',
      silnik: params_data['Silnik'] || 'N/A',
      skrzynia: params_data['Skrzynia biegów'] || 'N/A',
      kolor: params_data['Kolor'] || 'N/A',
      brandLogo: `/${brand.toLowerCase()}Logo.png`,
      wyposazenie: [],
      ...customProps,
      ...(wartoscPojazdu != null ? { wartoscPojazdu } : {}),
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Błąd pobierania danych' }, { status: 500 });
  }
}