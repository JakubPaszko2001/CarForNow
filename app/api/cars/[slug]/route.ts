import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function readCustomProps(slug: string): Record<string, unknown> {
  try {
    const file = path.join(process.cwd(), 'data', 'carProperties.json');
    if (!fs.existsSync(file)) return {};
    const all = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return all[slug] ?? {};
  } catch {
    return {};
  }
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

    return NextResponse.json({
      brand,
      model,
      images: images.length > 0 ? images : ['/placeholder-car.png'],
      opis,
      price,
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
      ...readCustomProps(slug),
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Błąd pobierania danych' }, { status: 500 });
  }
}