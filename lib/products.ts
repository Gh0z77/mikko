import type { Category, CategorySlug, Product } from './types';

export const categories: Category[] = [
  {
    slug: 'boys',
    title: "O'g'il bolalar",
    short: "O'g'il",
    description: "Kuchli, chidamli va har kuni kiyishga qulay kiyimlar.",
    image: '/images/model-boy-cap.webp',
    tint: '#E7F2FF',
    href: '/boys',
  },
  {
    slug: 'girls',
    title: 'Qizlar',
    short: 'Qiz',
    description: 'Yumshoq matolar, nafis detallar va qulay bichim.',
    image: '/images/model-girl.webp',
    tint: '#FFEDED',
    href: '/girls',
  },
  {
    slug: 'baby',
    title: 'Chaqaloqlar',
    short: 'Chaqaloq',
    description: "Teri uchun xavfsiz, ipakdek yumshoq to'plamlar.",
    image: '/images/model-baby.webp',
    tint: '#FFF0DE',
    href: '/baby',
  },
  {
    slug: 'shoes',
    title: 'Oyoq kiyimlar',
    short: 'Oyoq kiyim',
    description: "Yumshoq taglik, sirpanmaydigan qoplama.",
    image: '/images/product-sneakers.webp',
    tint: '#F7E9DA',
    href: '/shoes',
  },
  {
    slug: 'accessories',
    title: 'Aksessuarlar',
    short: 'Aksessuar',
    description: 'Shapkalar, sovg\'alar va mayda quvonchlar.',
    image: '/images/product-hat-plush.webp',
    tint: '#EDF6FF',
    href: '/accessories',
  },
  {
    slug: 'sale',
    title: 'Aksiyalar',
    short: 'Aksiya',
    description: 'Chegirma bilan xarid qilish uchun eng yaxshi tanlov.',
    image: '/images/product-giftbox.webp',
    tint: '#FFEFD9',
    href: '/sale',
  },
];

export const categoryLabels: Record<CategorySlug, string> = {
  boys: "O'g'il bolalar",
  girls: 'Qizlar',
  baby: 'Chaqaloqlar',
  shoes: 'Oyoq kiyimlar',
  accessories: 'Aksessuarlar',
};

const KIDS = ['92', '98', '104', '110', '116', '122', '128', '134', '140'];
const BABY = ['74', '80', '86', '92', '98'];
const SHOES = ['24', '26', '28', '30', '32', '34'];

const cream = { name: 'Krem', hex: '#F2E3CE' };
const beige = { name: 'Bej', hex: '#D9C2A7' };
const brown = { name: 'Jigarrang', hex: '#7A5138' };
const blue = { name: 'Ko\'k', hex: '#3E6FB0' };
const red = { name: 'Qizil', hex: '#C0392B' };
const orange = { name: 'Oranje', hex: '#FF7A00' };
const white = { name: 'Oq', hex: '#FFFFFF' };

/** Built-in starter catalog; staff edits from the admin panel are layered on top (lib/catalog.ts). */
export const seedProducts: Product[] = [
  {
    slug: 'bej-ayiqcha-sviter',
    name: 'Ayiqcha naqshli bej sviter',
    category: 'boys',
    price: 249000,
    oldPrice: 299000,
    images: [
      '/images/product-sweater-beige.webp',
      '/images/product-sweater-beige-detail1.webp',
      '/images/product-sweater-beige-detail2.webp',
      '/images/model-boy-cap.webp',
    ],
    sizes: KIDS,
    colors: [beige, cream, brown],
    description:
      "Yumshoq trikotajdan tikilgan, ko'krak qismida katta ayiqcha naqshi bor. Yelkalari erkin, yenglari manjetda — bola o'ynab yurganda ham kiyim o'z shaklini saqlaydi.",
    details: [
      'Oldi va orqasi bir xil yumshoq trikotaj',
      'Yuvishda shaklini yo\'qotmaydi',
      'Bola terisiga tegmaydigan yorliq',
    ],
    material: '80% paxta, 20% akril',
    badge: 'hit',
    rating: 4.9,
    reviews: 128,
    createdAt: 16,
  },
  {
    slug: 'jigarrang-parka',
    name: 'Momiq yoqali jigarrang parka',
    category: 'girls',
    price: 649000,
    images: [
      '/images/product-parka-brown.webp',
      '/images/product-parka-brown-detail1.webp',
      '/images/product-parka-brown-detail2.webp',
      '/images/model-girl.webp',
    ],
    sizes: KIDS,
    colors: [brown, beige],
    description:
      "Kuz-qish uchun issiq parka: yumshoq momiq yoqa, belbog' va katta cho'ntaklar. Suv o'tkazmaydigan tashqi qatlam shamolni ham ushlab turadi.",
    details: [
      'Yechiladigan momiq yoqa',
      'Ikki tomonlama zamok',
      'Cho\'ntak ichi issiq astar bilan',
    ],
    material: 'Tashqi qatlam: poliester, astar: flis',
    badge: 'new',
    rating: 4.8,
    reviews: 64,
    createdAt: 15,
  },
  {
    slug: 'qishki-etik-mishka',
    name: 'Mishka detalli qishki etik',
    category: 'shoes',
    price: 389000,
    oldPrice: 449000,
    images: [
      '/images/product-boots-winter.webp',
      '/images/product-boots-winter-detail1.webp',
      '/images/product-boots-winter-detail2.webp',
      '/images/model-boy-winter.webp',
    ],
    sizes: SHOES,
    colors: [beige, brown],
    description:
      "Ichki qismi jun bilan qoplangan, tagligi sirpanmaydi. Kiyish va yechish oson — yon tomonida zamok va tugma bor.",
    details: [
      'Ichki jun astar',
      'Sirpanmaydigan rezina taglik',
      'Yon zamok bilan tez kiyiladi',
    ],
    material: 'Tashqi: eko-charm, taglik: termorezina',
    rating: 4.7,
    reviews: 92,
    createdAt: 14,
  },
  {
    slug: 'mishka-krossovka',
    name: 'Yumshoq taglikli krossovka',
    category: 'shoes',
    price: 329000,
    images: [
      '/images/product-sneakers.webp',
      '/images/product-sneakers-detail1.webp',
      '/images/product-sneakers-detail2.webp',
      '/images/model-boy-cap.webp',
    ],
    sizes: SHOES,
    colors: [beige, white, orange],
    description:
      "Har kuni maktabga va sayrga. Yengil taglik oyoqni charchatmaydi, ustki qismi nafas oladi.",
    details: [
      'Yengil EVA taglik',
      'Nafas oluvchi to\'r mato',
      'Yopishqoq qayish — tez kiyiladi',
    ],
    material: 'Tashqi: to\'r mato va eko-charm',
    badge: 'hit',
    rating: 4.8,
    reviews: 156,
    createdAt: 13,
  },
  {
    slug: 'krem-sviter-mishka',
    name: 'Katta mishka naqshli krem sviter',
    category: 'baby',
    price: 219000,
    images: [
      '/images/product-sweater-cream.webp',
      '/images/product-sweater-cream-detail1.webp',
      '/images/product-sweater-cream-detail2.webp',
      '/images/model-baby.webp',
    ],
    sizes: BABY,
    colors: [cream, beige],
    description:
      "Chaqaloqlar uchun ipakdek yumshoq sviter. Bo'yni keng, ichki tikuvlari tashqariga chiqarilmagan — terini tirnamaydi.",
    details: [
      'Yumshoq, tirnamaydigan ip',
      "Keng bo'yin — boshdan oson kiyiladi",
      'Yorliq tashqariga tikilgan',
    ],
    material: '100% paxta',
    rating: 4.9,
    reviews: 73,
    createdAt: 12,
  },
  {
    slug: 'kok-kostyum-mishkalar',
    name: "Ko'k kostyum «Mishkalar»",
    category: 'boys',
    price: 419000,
    oldPrice: 499000,
    images: [
      '/images/product-suit-blue.webp',
      '/images/product-suit-blue-detail1.webp',
      '/images/product-suit-blue-detail2.webp',
      '/images/model-boy-hoodie.webp',
    ],
    sizes: KIDS,
    colors: [blue],
    description:
      "Ko'ylak va shimdan iborat to'plam. Ikkalasi ham bir xil yumshoq futerdan tikilgan, ranglari yuvilganda ham o'zgarmaydi.",
    details: [
      'To\'plam: xudi va shim',
      'Bel qismi rezinka bilan',
      'Rang o\'tmaydigan bo\'yoq',
    ],
    material: '85% paxta, 15% poliester',
    rating: 4.7,
    reviews: 41,
    createdAt: 11,
  },
  {
    slug: 'kok-sport-kostyum',
    name: "Quloqli ko'k sport kostyumi",
    category: 'boys',
    price: 459000,
    images: [
      '/images/product-tracksuit-blue.webp',
      '/images/product-tracksuit-blue-detail1.webp',
      '/images/product-tracksuit-blue-detail2.webp',
      '/images/model-boy-hoodie.webp',
    ],
    sizes: KIDS,
    colors: [blue],
    description:
      "Kapyushonda quloqchalar, old tomonda katta ayiqcha applikatsiyasi. Sport zali, sayr va uy uchun bir xil qulay.",
    details: [
      'Quloqli kapyushon',
      'Yon cho\'ntaklar',
      'Manjet va rezinka — issiqni ushlaydi',
    ],
    material: '80% paxta, 20% poliester',
    badge: 'new',
    rating: 4.9,
    reviews: 58,
    createdAt: 10,
  },
  {
    slug: 'trikotaj-komplekt',
    name: "Trikotaj komplekt «Mishka»",
    category: 'baby',
    price: 349000,
    images: [
      '/images/product-knit-set.webp',
      '/images/product-knit-set-detail1.webp',
      '/images/product-knit-set-detail2.webp',
      '/images/model-baby.webp',
    ],
    sizes: BABY,
    colors: [beige, cream],
    description:
      "Sviter va shimdan iborat issiq komplekt. Trikotaj zich, lekin yumshoq — chaqaloq uchun ham, katta yoshdagi bola uchun ham mos.",
    details: [
      'To\'plam: sviter va shim',
      'Zich trikotaj, shamol o\'tkazmaydi',
      'Yuvish mashinasida yuviladi',
    ],
    material: '70% paxta, 30% jun',
    rating: 4.8,
    reviews: 36,
    createdAt: 9,
  },
  {
    slug: 'qizil-kurtka',
    name: 'Qizil kurtka kapyushon bilan',
    category: 'girls',
    price: 559000,
    oldPrice: 629000,
    images: [
      '/images/product-jacket-red.webp',
      '/images/product-jacket-red-detail1.webp',
      '/images/product-jacket-red-detail2.webp',
      '/images/model-girl.webp',
    ],
    sizes: KIDS,
    colors: [red],
    description:
      "Yorqin qizil kurtka — kuzgi suratlarda ham, sayrda ham ko'zga tashlanadi. Ichida yumshoq astar, kapyushoni issiq.",
    details: [
      'Issiq astar',
      'Ikki yon cho\'ntak',
      'Ko\'krakda kashta ayiqcha',
    ],
    material: 'Tashqi: poliester, astar: flis',
    rating: 4.6,
    reviews: 29,
    createdAt: 8,
  },
  {
    slug: 'plyus-shapka',
    name: 'Plyus shapka «Mishka»',
    category: 'accessories',
    price: 149000,
    images: [
      '/images/product-hat-plush.webp',
      '/images/product-hat-plush-detail1.webp',
      '/images/product-hat-plush-detail2.webp',
      '/images/model-baby.webp',
    ],
    sizes: ['48-50', '52-54'],
    colors: [beige, cream],
    description:
      "Quloqchalari va pomponlari bilan yumshoq shapka. Quloqlarni to'liq yopadi, ichida paxta astar.",
    details: [
      'Quloqchinli bichim',
      'Ichki paxta astar',
      'Pomponlar yechilmaydi',
    ],
    material: '100% akril, astar paxta',
    badge: 'hit',
    rating: 5,
    reviews: 84,
    createdAt: 7,
  },
  {
    slug: 'sovga-qutisi',
    name: "Sovg'a qutisi «Mikko»",
    category: 'accessories',
    price: 89000,
    images: [
      '/images/product-giftbox.webp',
      '/images/product-giftbox-detail1.webp',
      '/images/product-giftbox-detail2.webp',
    ],
    sizes: ['Standart'],
    colors: [beige, brown],
    description:
      "Sovg'ani chiroyli qadoqlash uchun qattiq quti: lenta, ayiqcha yorliq va ichida krem qog'oz.",
    details: [
      'Qattiq karton quti',
      'Atlas lenta va yorliq',
      'Ichki o\'lchami 28 × 20 × 10 sm',
    ],
    material: 'Karton, atlas lenta',
    rating: 4.9,
    reviews: 21,
    createdAt: 6,
  },
  {
    slug: 'mikko-xalta',
    name: "Mikko sovg'a xaltasi",
    category: 'accessories',
    price: 69000,
    images: [
      '/images/product-bag-mikko.webp',
      '/images/product-bag-mikko-detail1.webp',
      '/images/product-bag-mikko-detail2.webp',
    ],
    sizes: ['Standart'],
    colors: [orange],
    description:
      "Brandlangan qog'oz xalta — xaridni uyga olib ketish yoki kichik sovg'a uchun. Tutqichlari mustahkam.",
    details: [
      'Zich qog\'oz, mat qoplama',
      'Kuchli paxta tutqich',
      'Qayta ishlatish mumkin',
    ],
    material: 'Kraft qog\'oz',
    rating: 4.8,
    reviews: 14,
    createdAt: 5,
  },
  {
    slug: 'look-kuzgi-bola',
    name: "Kuzgi look: xudi va jinsi",
    category: 'boys',
    price: 789000,
    images: [
      '/images/model-boy-hoodie.webp',
      '/images/product-tracksuit-blue.webp',
      '/images/product-sweater-beige.webp',
    ],
    sizes: KIDS,
    colors: [orange, blue],
    description:
      "Bir suratga tushish uchun tayyor to'plam: oranje xudi, jinsi va krossovka. Uchta narsa birgalikda arzonroq.",
    details: [
      'To\'plamda 3 ta narsa',
      'Ranglar bir-biriga moslangan',
      'Sovg\'a qutisida yetkaziladi',
    ],
    material: 'Paxta aralashmasi',
    badge: 'new',
    rating: 4.9,
    reviews: 18,
    createdAt: 4,
  },
  {
    slug: 'look-qiz-krem',
    name: 'Look: krem sviter va bant',
    category: 'girls',
    price: 649000,
    images: [
      '/images/model-girl.webp',
      '/images/product-sweater-cream.webp',
      '/images/product-hat-plush.webp',
    ],
    sizes: KIDS,
    colors: [cream, beige],
    description:
      "Yumshoq krem sviter va atlas bantdan iborat nafis to'plam. Bayram va suratga tushish uchun.",
    details: [
      'To\'plamda 2 ta narsa',
      'Atlas bant sovg\'a sifatida',
      'Yumshoq trikotaj',
    ],
    material: 'Paxta, atlas',
    rating: 4.8,
    reviews: 12,
    createdAt: 3,
  },
  {
    slug: 'look-chaqaloq-plyus',
    name: "Look: plys xudi to'plami",
    category: 'baby',
    price: 529000,
    images: [
      '/images/model-baby.webp',
      '/images/product-sweater-cream.webp',
      '/images/product-knit-set.webp',
    ],
    sizes: BABY,
    colors: [beige, cream],
    description:
      "Quloqli plys xudi va yumshoq shim. Birinchi qish uchun eng iliq va eng yumshoq tanlov.",
    details: [
      'To\'plamda 2 ta narsa',
      'Quloqli kapyushon',
      'Ipakdek yumshoq ichki qatlam',
    ],
    material: 'Plyus, paxta astar',
    rating: 5,
    reviews: 9,
    createdAt: 2,
  },
  {
    slug: 'look-qishki-bola',
    name: "Qishki look: kurtka va shapka",
    category: 'boys',
    price: 749000,
    oldPrice: 849000,
    images: [
      '/images/model-boy-winter.webp',
      '/images/product-jacket-red.webp',
      '/images/product-hat-plush.webp',
    ],
    sizes: KIDS,
    colors: [orange, blue, red],
    description:
      "Qishki sayr uchun tayyor to'plam: issiq kurtka, shapka va qo'lqop. Hammasi bir uslubda.",
    details: [
      'To\'plamda 3 ta narsa',
      'Shamol va sovuqqa chidamli',
      'Sovg\'a qutisida yetkaziladi',
    ],
    material: 'Poliester, flis astar',
    rating: 4.7,
    reviews: 23,
    createdAt: 1,
  },
];

/** The live catalog. Same array instance everywhere — setCatalog() swaps its contents in place. */
export const products: Product[] = [...seedProducts];

export function setCatalog(list: Product[]) {
  products.splice(0, products.length, ...list);
}

export const sizeGuide = [
  { size: '74', age: '6–9 oy', height: '68–74 sm' },
  { size: '80', age: '9–12 oy', height: '74–80 sm' },
  { size: '86', age: '1–1.5 yosh', height: '80–86 sm' },
  { size: '92', age: '1.5–2 yosh', height: '86–92 sm' },
  { size: '98', age: '2–3 yosh', height: '92–98 sm' },
  { size: '104', age: '3–4 yosh', height: '98–104 sm' },
  { size: '110', age: '4–5 yosh', height: '104–110 sm' },
  { size: '116', age: '5–6 yosh', height: '110–116 sm' },
  { size: '122', age: '6–7 yosh', height: '116–122 sm' },
  { size: '128', age: '7–8 yosh', height: '122–128 sm' },
  { size: '134', age: '8–9 yosh', height: '128–134 sm' },
  { size: '140', age: '9–10 yosh', height: '134–140 sm' },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return products.filter((product) => product.category === category);
}

export function getNewArrivals(limit = 8): Product[] {
  return [...products].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export function getSaleProducts(): Product[] {
  return products.filter((product) => product.oldPrice);
}

export function getRelated(product: Product, limit = 4): Product[] {
  const sameCategory = products.filter(
    (item) => item.category === product.category && item.slug !== product.slug,
  );
  const rest = products.filter(
    (item) => item.category !== product.category && item.slug !== product.slug,
  );
  return [...sameCategory, ...rest].slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter((product) => {
    const haystack = [
      product.name,
      product.description,
      product.material,
      categoryLabels[product.category],
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}
