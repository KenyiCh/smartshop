// Formato peruano para la interfaz: S/ 1,079 o S/ 1,079.50
export const formatPrice = (price: number): string => {
  const hasCents = Math.round(price * 100) % 100 !== 0;
  return price.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

export const formatPriceWithCurrency = (price: number): string => {
  return `S/ ${formatPrice(price)}`;
};
