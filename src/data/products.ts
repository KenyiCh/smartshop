// Catálogo mock centralizado de SmartShop.
// TODOS los precios, tiendas, horas y reseñas son DATOS DE EJEMPLO del prototipo:
// no provienen de las tiendas reales ni de un scraping.

export type StoreName =
  | "Falabella"
  | "Ripley"
  | "Oechsle"
  | "Hiraoka"
  | "Coolbox"
  | "Mercado Libre";

export const STORES: StoreName[] = [
  "Falabella",
  "Ripley",
  "Oechsle",
  "Hiraoka",
  "Coolbox",
  "Mercado Libre",
];

export type ShippingType = "domicilio" | "retiro" | "domicilio-y-retiro";

export interface Shipping {
  type: ShippingType;
  /** Costo de envío a domicilio en soles (0 = gratis). */
  cost: number;
  eta: string;
}

export interface StoreOffer {
  store: StoreName;
  /** Precio online, sin tarjeta de la tienda. */
  price: number;
  /** Precio «antes» que muestra la tienda. */
  listPrice?: number;
  /** Precio exclusivo con la tarjeta de la tienda (P06). */
  cardPrice?: { price: number; card: string };
  /** Cuotas sin intereses. */
  installments?: { months: number; conditions: string };
  warranty: string;
  shipping: Shipping;
  url: string;
  /** Hora en que se tomó el precio (ISO, hora de Lima). */
  updatedAt: string;
  /** Si el enlace es de afiliado, se rotula en la interfaz. */
  affiliate: boolean;
  /** Tienda oficial verificada. */
  official: boolean;
  storeRating: number;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface Review {
  id: number;
  user: string;
  rating: number;
  date: string;
  comment: string;
}

export type Category =
  | "laptops"
  | "celulares"
  | "audifonos"
  | "smartwatches"
  | "pcs-de-marca"
  | "monitores";

export interface Product {
  id: number;
  name: string;
  brand: string;
  model: string;
  category: Category;
  image: string;
  description: string;
  specifications: Record<string, string>;
  rating: number;
  totalReviews: number;
  offers: StoreOffer[];
  /** Mejor precio entre tiendas, por semana. */
  priceHistory: PricePoint[];
  reviews: Review[];
}

// ---------------------------------------------------------------------------
// Ayudantes para armar los datos de ejemplo

const HISTORY_DATES = [
  "2026-08-20", "2026-08-27", "2026-09-03", "2026-09-10", "2026-09-17",
  "2026-09-24", "2026-10-01", "2026-10-08", "2026-10-15", "2026-10-22",
  "2026-10-29", "2026-11-05", "2026-11-12", "2026-11-19",
];

/** Genera un historial semanal a partir del precio actual y una forma relativa. */
const history = (current: number, shape: number[]): PricePoint[] =>
  HISTORY_DATES.map((date, i) => ({
    date,
    price: Math.round(current * (shape[i] ?? 1)),
  }));

// Formas típicas (el último valor es 1 = precio de hoy)
const BAJA_SUAVE = [1.09, 1.09, 1.08, 1.08, 1.06, 1.06, 1.05, 1.05, 1.04, 1.04, 1.03, 1.02, 1.01, 1];
const ESTABLE = [1.01, 1, 1.02, 1.01, 1, 1.01, 1.02, 1, 1.01, 1, 1.02, 1.01, 1, 1];
const SUBE_ANTES_DE_BF = [1.02, 1.01, 1.02, 1.01, 1.02, 1.03, 1.04, 1.06, 1.07, 1.08, 1.08, 1.05, 1.02, 1];
const SUBE = [0.95, 0.95, 0.96, 0.96, 0.97, 0.97, 0.98, 0.98, 0.99, 0.99, 1, 1, 1, 1];

const SHIP = {
  gratis: { type: "domicilio-y-retiro", cost: 0, eta: "Envío gratis a domicilio en 2 a 4 días o retiro en tienda" },
  pagado: (cost: number): Shipping => ({ type: "domicilio-y-retiro", cost, eta: `Envío a domicilio S/ ${cost} en 24 a 48 h o retiro gratis` }),
  soloRetiro: { type: "retiro", cost: 0, eta: "Solo retiro en tienda (gratis)" },
  full: { type: "domicilio", cost: 0, eta: "Envío Full gratis al día siguiente en Lima" },
} satisfies Record<string, Shipping | ((c: number) => Shipping)>;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const url = (store: StoreName, name: string) => {
  const base: Record<StoreName, string> = {
    Falabella: "https://www.falabella.com.pe/falabella-pe/search?Ntt=",
    Ripley: "https://simple.ripley.com.pe/search/",
    Oechsle: "https://www.oechsle.pe/",
    Hiraoka: "https://hiraoka.com.pe/catalogsearch/result/?q=",
    Coolbox: "https://www.coolbox.pe/",
    "Mercado Libre": "https://listado.mercadolibre.com.pe/",
  };
  return base[store] + slug(name);
};

const CARD: Partial<Record<StoreName, string>> = {
  Falabella: "Tarjeta CMR",
  Ripley: "Tarjeta Ripley",
  Oechsle: "Tarjeta Oh",
};

type OfferOpts = Partial<Omit<StoreOffer, "store" | "price" | "url" | "cardPrice">> & {
  card?: number;
};

const offer = (productName: string, store: StoreName, price: number, opts: OfferOpts = {}): StoreOffer => {
  const { card, ...rest } = opts;
  return {
    store,
    price,
    warranty: "12 meses de garantía del fabricante",
    shipping: SHIP.gratis,
    url: url(store, productName),
    updatedAt: "2026-11-19T09:30:00-05:00",
    affiliate: false,
    official: true,
    storeRating: 4.3,
    ...(card && CARD[store] ? { cardPrice: { price: card, card: CARD[store]! } } : {}),
    ...rest,
  };
};

// ---------------------------------------------------------------------------
// Catálogo

const P = {
  macbookPro: "MacBook Pro 14 M3",
  iphone: "iPhone 15 Pro",
  sony: "Sony WH-1000XM5",
  watch: "Apple Watch Series 9",
  dell: "Dell XPS Desktop",
  galaxy: "Samsung Galaxy S24 Ultra",
  lg: "LG UltraWide 34WP85C",
  airpods: "AirPods Pro 2",
  ideapad: "Lenovo IdeaPad Slim 5 14",
  vivobook: "ASUS Vivobook 15",
  victus: "HP Victus 15",
  macbookAir: "MacBook Air 13 M3",
};

export const products: Product[] = [
  {
    id: 1,
    name: P.macbookPro,
    brand: "Apple",
    model: "2023 · 16 GB · 512 GB",
    category: "laptops",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
    description:
      "La MacBook Pro de 14 pulgadas con chip M3 ofrece un rendimiento excepcional para profesionales creativos y desarrolladores.",
    specifications: {
      Procesador: "Apple M3",
      RAM: "16 GB",
      Almacenamiento: "512 GB SSD",
      Pantalla: "14.2 pulgadas Liquid Retina XDR",
      Peso: "1.6 kg",
    },
    rating: 4.8,
    totalReviews: 156,
    offers: [
      offer(P.macbookPro, "Falabella", 7699, {
        listPrice: 8499, card: 7399,
        installments: { months: 12, conditions: "con tarjetas de crédito seleccionadas" },
        updatedAt: "2026-11-19T10:15:00-05:00", storeRating: 4.4,
      }),
      offer(P.macbookPro, "Ripley", 7799, {
        listPrice: 9999, card: 7499,
        installments: { months: 24, conditions: "solo con Tarjeta Ripley" },
        shipping: SHIP.pagado(15), updatedAt: "2026-11-19T08:40:00-05:00", storeRating: 4.2,
      }),
      offer(P.macbookPro, "Hiraoka", 7599, {
        warranty: "12 meses del fabricante + 6 meses Hiraoka",
        shipping: SHIP.pagado(20), updatedAt: "2026-11-18T19:05:00-05:00", storeRating: 4.6,
      }),
      offer(P.macbookPro, "Mercado Libre", 7649, {
        installments: { months: 6, conditions: "con tarjetas seleccionadas" },
        shipping: SHIP.full, affiliate: true, updatedAt: "2026-11-19T10:50:00-05:00", storeRating: 4.3,
      }),
      offer(P.macbookPro, "Coolbox", 7899, {
        listPrice: 8299, installments: { months: 12, conditions: "con tarjetas BCP e Interbank" },
        shipping: SHIP.soloRetiro, updatedAt: "2026-11-19T07:20:00-05:00", storeRating: 4.1,
      }),
    ],
    priceHistory: history(7599, BAJA_SUAVE),
    reviews: [
      { id: 1, user: "Carlos M.", rating: 5, date: "2026-10-15", comment: "Excelente laptop, muy rápida y la batería dura todo el día." },
      { id: 2, user: "Ana L.", rating: 4, date: "2026-10-10", comment: "Muy buena calidad. El precio es alto, pero vale la pena si la usas para trabajar." },
    ],
  },
  {
    id: 2,
    name: P.iphone,
    brand: "Apple",
    model: "128 GB",
    category: "celulares",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
    description: "El iPhone 15 Pro con chip A17 Pro, cuerpo de titanio y cámara de 48 MP.",
    specifications: { Procesador: "A17 Pro", Almacenamiento: "128 GB", Pantalla: "6.1 pulgadas Super Retina XDR", Cámara: "48 MP + 12 MP + 12 MP" },
    rating: 4.6,
    totalReviews: 212,
    offers: [
      offer(P.iphone, "Ripley", 3899, { listPrice: 4599, card: 3699, installments: { months: 12, conditions: "solo con Tarjeta Ripley" } }),
      offer(P.iphone, "Falabella", 3949, { card: 3799 }),
      offer(P.iphone, "Oechsle", 3999, { listPrice: 4299, card: 3749, shipping: SHIP.pagado(10) }),
      offer(P.iphone, "Mercado Libre", 3929, { shipping: SHIP.full }),
    ],
    priceHistory: history(3899, SUBE),
    reviews: [
      { id: 1, user: "Lucía R.", rating: 5, date: "2026-09-30", comment: "La cámara es muy buena y se siente premium." },
      { id: 2, user: "Diego P.", rating: 4, date: "2026-09-12", comment: "Se calienta un poco al grabar en 4K, por lo demás muy bien." },
    ],
  },
  {
    id: 3,
    name: P.sony,
    brand: "Sony",
    model: "Negro",
    category: "audifonos",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    description: "Audífonos inalámbricos con cancelación de ruido líder y hasta 30 horas de batería.",
    specifications: { Tipo: "Over-ear inalámbrico", Batería: "Hasta 30 h", Cancelación: "Activa (ANC)", Peso: "250 g" },
    rating: 4.7,
    totalReviews: 98,
    offers: [
      offer(P.sony, "Hiraoka", 1349, { shipping: SHIP.pagado(15) }),
      offer(P.sony, "Falabella", 1399, { listPrice: 1599, card: 1299 }),
      offer(P.sony, "Coolbox", 1379, { shipping: SHIP.soloRetiro }),
    ],
    priceHistory: history(1349, ESTABLE),
    reviews: [
      { id: 1, user: "Sofía T.", rating: 5, date: "2026-10-02", comment: "La cancelación de ruido es increíble para el bus." },
    ],
  },
  {
    id: 4,
    name: P.watch,
    brand: "Apple",
    model: "GPS · 41 mm",
    category: "smartwatches",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500",
    description: "Reloj inteligente con chip S9, pantalla más brillante y doble toque.",
    specifications: { Chip: "S9 SiP", Caja: "41 mm aluminio", Batería: "Hasta 18 h", Resistencia: "50 m" },
    rating: 4.5,
    totalReviews: 74,
    offers: [
      offer(P.watch, "Falabella", 1549, { card: 1449 }),
      offer(P.watch, "Ripley", 1599, { listPrice: 1999, card: 1499 }),
      offer(P.watch, "Mercado Libre", 1529, { shipping: SHIP.full }),
    ],
    priceHistory: history(1529, BAJA_SUAVE),
    reviews: [
      { id: 1, user: "Mateo G.", rating: 4, date: "2026-09-20", comment: "Muy útil para entrenar, la batería podría durar más." },
    ],
  },
  {
    id: 5,
    name: P.dell,
    brand: "Dell",
    model: "Core i7 · 16 GB · 1 TB",
    category: "pcs-de-marca",
    image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500",
    description: "Computadora de escritorio compacta para trabajo y edición.",
    specifications: { Procesador: "Intel Core i7", RAM: "16 GB", Almacenamiento: "1 TB SSD", Gráficos: "NVIDIA RTX 4060" },
    rating: 4.4,
    totalReviews: 31,
    offers: [
      offer(P.dell, "Hiraoka", 4999, { shipping: SHIP.pagado(30) }),
      offer(P.dell, "Coolbox", 5199, { shipping: SHIP.soloRetiro }),
    ],
    priceHistory: history(4999, ESTABLE),
    reviews: [],
  },
  {
    id: 6,
    name: P.galaxy,
    brand: "Samsung",
    model: "256 GB",
    category: "celulares",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
    description: "Smartphone con S Pen integrado, cámara de 200 MP y funciones de Galaxy AI.",
    specifications: { Procesador: "Snapdragon 8 Gen 3", Almacenamiento: "256 GB", Pantalla: "6.8 pulgadas QHD+", Cámara: "200 MP" },
    rating: 4.5,
    totalReviews: 143,
    offers: [
      offer(P.galaxy, "Oechsle", 4499, { card: 4199, listPrice: 5299 }),
      offer(P.galaxy, "Falabella", 4599, { card: 4299 }),
      offer(P.galaxy, "Ripley", 4549, { card: 4249 }),
      offer(P.galaxy, "Mercado Libre", 4579, { shipping: SHIP.full }),
    ],
    priceHistory: history(4499, SUBE),
    reviews: [
      { id: 1, user: "Valeria C.", rating: 5, date: "2026-10-21", comment: "La pantalla y la batería son lo mejor." },
    ],
  },
  {
    id: 7,
    name: P.lg,
    brand: "LG",
    model: "34 pulgadas",
    category: "monitores",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
    description: "Monitor ultrawide curvo QHD de 34 pulgadas con USB-C.",
    specifications: { Tamaño: "34 pulgadas", Resolución: "3440 x 1440", Panel: "IPS curvo", Conexiones: "USB-C, HDMI, DP" },
    rating: 4.3,
    totalReviews: 40,
    offers: [
      offer(P.lg, "Hiraoka", 2299, { shipping: SHIP.pagado(25) }),
      offer(P.lg, "Coolbox", 2349, {}),
      offer(P.lg, "Mercado Libre", 2399, { shipping: SHIP.full }),
    ],
    priceHistory: history(2299, BAJA_SUAVE),
    reviews: [],
  },
  {
    id: 8,
    name: P.airpods,
    brand: "Apple",
    model: "USB-C",
    category: "audifonos",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500",
    description: "Audífonos con cancelación activa de ruido, audio adaptativo y estuche USB-C.",
    specifications: { Tipo: "In-ear inalámbrico", Batería: "Hasta 6 h (30 h con estuche)", Cancelación: "Activa (ANC)" },
    rating: 4.6,
    totalReviews: 188,
    offers: [
      offer(P.airpods, "Ripley", 949, { card: 899 }),
      offer(P.airpods, "Falabella", 979, { card: 919 }),
      offer(P.airpods, "Mercado Libre", 959, { shipping: SHIP.full }),
    ],
    priceHistory: history(949, ESTABLE),
    reviews: [],
  },
  // ---- Laptops adicionales para el guion de la demo (Black Friday) ----
  {
    id: 9,
    name: P.ideapad,
    brand: "Lenovo",
    model: "Ryzen 7 · 16 GB · 512 GB",
    category: "laptops",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
    description: "Laptop ligera de 14 pulgadas para la universidad y el trabajo, con buena batería.",
    specifications: { Procesador: "AMD Ryzen 7 8845HS", RAM: "16 GB", Almacenamiento: "512 GB SSD", Pantalla: "14 pulgadas WUXGA OLED", Peso: "1.46 kg" },
    rating: 4.5,
    totalReviews: 67,
    offers: [
      offer(P.ideapad, "Oechsle", 3299, {
        listPrice: 4599, card: 2999,
        installments: { months: 12, conditions: "solo con Tarjeta Oh" },
        shipping: SHIP.pagado(15), updatedAt: "2026-11-19T10:05:00-05:00", storeRating: 4.0,
      }),
      offer(P.ideapad, "Falabella", 3349, {
        listPrice: 3699, card: 3199,
        installments: { months: 12, conditions: "con tarjetas de crédito seleccionadas" },
        updatedAt: "2026-11-19T09:10:00-05:00", storeRating: 4.4,
      }),
      offer(P.ideapad, "Hiraoka", 3399, {
        warranty: "12 meses del fabricante + 6 meses Hiraoka",
        updatedAt: "2026-11-18T18:30:00-05:00", storeRating: 4.6,
      }),
      offer(P.ideapad, "Coolbox", 3279, {
        installments: { months: 6, conditions: "con tarjetas BCP e Interbank" },
        shipping: SHIP.soloRetiro, updatedAt: "2026-11-19T11:00:00-05:00", storeRating: 4.1,
      }),
      offer(P.ideapad, "Mercado Libre", 3319, {
        shipping: SHIP.full, affiliate: true, updatedAt: "2026-11-19T10:45:00-05:00", storeRating: 4.3,
      }),
    ],
    priceHistory: history(3279, SUBE_ANTES_DE_BF),
    reviews: [
      { id: 1, user: "Andrea V.", rating: 5, date: "2026-11-02", comment: "La pantalla OLED se ve muy bien y la batería me dura toda la jornada en la universidad." },
      { id: 2, user: "Renzo Q.", rating: 4, date: "2026-10-18", comment: "Buena relación precio-calidad. Revisen la garantía: en mi caso la tienda solo daba la del fabricante." },
      { id: 3, user: "Camila S.", rating: 4, date: "2026-10-05", comment: "Liviana y rápida. El cargador es un poco grande." },
    ],
  },
  {
    id: 10,
    name: P.vivobook,
    brand: "ASUS",
    model: "Core i5 · 16 GB · 512 GB",
    category: "laptops",
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500",
    description: "Laptop de 15.6 pulgadas para estudiar y trabajar, con teclado numérico.",
    specifications: { Procesador: "Intel Core i5-1335U", RAM: "16 GB", Almacenamiento: "512 GB SSD", Pantalla: "15.6 pulgadas FHD", Peso: "1.7 kg" },
    rating: 4.2,
    totalReviews: 52,
    offers: [
      offer(P.vivobook, "Ripley", 2399, { listPrice: 2999, card: 2199, shipping: SHIP.pagado(15) }),
      offer(P.vivobook, "Falabella", 2449, { card: 2299 }),
      offer(P.vivobook, "Coolbox", 2429, { shipping: SHIP.soloRetiro }),
      offer(P.vivobook, "Mercado Libre", 2379, { shipping: SHIP.full, official: true }),
    ],
    priceHistory: history(2379, ESTABLE),
    reviews: [
      { id: 1, user: "Bruno L.", rating: 4, date: "2026-10-28", comment: "Cumple para Office y clases virtuales. La pantalla podría ser más brillante." },
    ],
  },
  {
    id: 11,
    name: P.victus,
    brand: "HP",
    model: "Core i5 · RTX 4050 · 16 GB",
    category: "laptops",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
    description: "Laptop gamer de 15.6 pulgadas a 144 Hz con gráficos NVIDIA RTX 4050.",
    specifications: { Procesador: "Intel Core i5-13420H", RAM: "16 GB", Almacenamiento: "512 GB SSD", Gráficos: "NVIDIA RTX 4050 6 GB", Pantalla: "15.6 pulgadas FHD 144 Hz" },
    rating: 4.4,
    totalReviews: 85,
    offers: [
      offer(P.victus, "Falabella", 4199, { listPrice: 4999, card: 3999 }),
      offer(P.victus, "Oechsle", 4249, { card: 3949, shipping: SHIP.pagado(15) }),
      offer(P.victus, "Hiraoka", 4149, { shipping: SHIP.pagado(20) }),
      offer(P.victus, "Coolbox", 4299, {}),
    ],
    priceHistory: history(4149, BAJA_SUAVE),
    reviews: [
      { id: 1, user: "Joaquín F.", rating: 5, date: "2026-11-10", comment: "Corre bien los juegos actuales en alto. Se escucha el ventilador." },
    ],
  },
  {
    id: 12,
    name: P.macbookAir,
    brand: "Apple",
    model: "2024 · 8 GB · 256 GB",
    category: "laptops",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500",
    description: "La laptop más delgada de Apple, sin ventilador y con hasta 18 horas de batería.",
    specifications: { Procesador: "Apple M3", RAM: "8 GB", Almacenamiento: "256 GB SSD", Pantalla: "13.6 pulgadas Liquid Retina", Peso: "1.24 kg" },
    rating: 4.7,
    totalReviews: 120,
    offers: [
      offer(P.macbookAir, "Falabella", 4799, { card: 4599 }),
      offer(P.macbookAir, "Ripley", 4849, { listPrice: 5999, card: 4649 }),
      offer(P.macbookAir, "Hiraoka", 4749, { shipping: SHIP.pagado(20) }),
      offer(P.macbookAir, "Mercado Libre", 4779, { shipping: SHIP.full }),
    ],
    priceHistory: history(4749, BAJA_SUAVE),
    reviews: [
      { id: 1, user: "Mariana D.", rating: 5, date: "2026-10-30", comment: "Silenciosa y la batería dura muchísimo." },
    ],
  },
];

// ---------------------------------------------------------------------------
// Consultas

export const getProductById = (id: number | string | undefined): Product | undefined => {
  const n = typeof id === "string" ? Number(id) : id;
  if (n === undefined || Number.isNaN(n)) return undefined;
  return products.find((p) => p.id === n);
};

/** Precio final = precio online + costo de envío a domicilio (0 si es gratis o solo retiro). */
export const finalPrice = (o: StoreOffer) => o.price + o.shipping.cost;

/** Ofertas ordenadas siempre por precio final, de menor a mayor. */
export const sortedOffers = (p: Product): StoreOffer[] =>
  [...p.offers].sort((a, b) => finalPrice(a) - finalPrice(b));

export const bestOffer = (p: Product): StoreOffer => sortedOffers(p)[0];

export const minFinalPrice = (p: Product) => finalPrice(bestOffer(p));
export const maxFinalPrice = (p: Product) => Math.max(...p.offers.map(finalPrice));

/** Precio más bajo y más alto del historial disponible (90 días aprox.). */
export const historyRange = (p: Product) => {
  const prices = p.priceHistory.map((h) => h.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
};

/** Variación porcentual del mejor precio respecto a hace 4 semanas. */
export const trendPct = (p: Product): number => {
  const h = p.priceHistory;
  if (h.length < 5) return 0;
  const now = h[h.length - 1].price;
  const before = h[h.length - 5].price;
  return Math.round(((now - before) / before) * 100);
};

/**
 * ¿El precio «antes» que muestra la tienda aparece en el historial?
 * Si el «antes» es más alto que cualquier precio registrado, el descuento puede estar inflado.
 */
export const isListPriceSuspicious = (p: Product, o: StoreOffer) =>
  o.listPrice !== undefined && o.listPrice > historyRange(p).max * 1.05;

export const shippingLabel = (s: Shipping) => {
  if (s.type === "retiro") return "Solo retiro en tienda";
  if (s.cost === 0) return s.type === "domicilio" ? "Envío gratis" : "Envío gratis o retiro";
  return `Envío S/ ${s.cost} o retiro gratis`;
};

const DATE_FMT = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Lima",
});

export const formatUpdatedAt = (iso: string) => DATE_FMT.format(new Date(iso));

/** Forma que espera ProductCard. */
export const toCardProduct = (p: Product) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  image: p.image,
  minPrice: minFinalPrice(p),
  maxPrice: maxFinalPrice(p),
  rating: p.rating,
  stores: p.offers.length,
  trendPct: trendPct(p),
});

export type CardProduct = ReturnType<typeof toCardProduct>;

export const CATEGORY_LABELS: Record<Category, string> = {
  laptops: "Laptops",
  celulares: "Celulares",
  audifonos: "Audífonos",
  smartwatches: "Smartwatches",
  "pcs-de-marca": "PCs de Marca",
  monitores: "Monitores",
};
