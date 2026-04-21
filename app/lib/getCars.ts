// lib/getCars.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function getScrapedCars() {
  try {
    const { data } = await axios.get('https://carforlease.pl/oferta/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const cars: any[] = [];

    $('.car-item').each((i, el) => {
      // ZDJĘCIE
      const aTag = $(el).find('a.lazy');
      const image = aTag.attr('data-src') || '/placeholder-car.jpg';

      // NAZWA
      const title = $(el).find('header a').first().text().trim();
      const [brand, ...modelParts] = title.split(' ');

      // OPIS
      const opis = $(el).find('header p').first().text().trim();

      // SPECYFIKACJA
      const liTexts = $(el).find('ul li')
        .map((_, li) => $(li).text().replace(/\s+/g, ' ').trim()).get();

      const paliwo   = liTexts[0] || '';
      const skrzynia = liTexts[1] || '';
      const przebieg = liTexts[2] || '';
      const silnik   = liTexts[3] || '';
      const rokRaw   = liTexts[4] || '';
      const rok      = parseInt(rokRaw.match(/\d{4}/)?.[0] || '2023');

      // CENA
      const cenaRaw = $(el).find('strong').filter((_, e) =>
        $(e).find('small').length > 0
      ).first().text().replace(/[^\d.]/g, '');
      const price = parseFloat(cenaRaw) || 0;

      // LINK
      const rawLink = $(el).find('header a').first().attr('href') || '';
      const link = rawLink.replace('../auto/', '/auto/').replace(/\/$/, '');

      cars.push({
        brand:        brand || 'Auto',
        model:        modelParts.join(' ') || 'Oferta',
        version:      opis,
        fuel:         paliwo,
        transmission: skrzynia,
        drive:        'FWD',
        power:        silnik,
        year:         rok,
        price,
        image,
        brandLogo:    `/${(brand || 'auto').toLowerCase()}Logo.png`,
        tag:          'Dostępny',
        przebieg,
        link,
      });
    });

    console.log(`✅ Pobrano ${cars.length} aut`);
    return cars;

  } catch (error) {
    console.error('Scraping error:', error);
    return [];
  }
}