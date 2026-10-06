const formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
});

export const formatPrice = (price: number) => formatter.format(price);
