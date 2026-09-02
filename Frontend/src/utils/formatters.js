export const formatMoney = (value) => {
  const amount = Number(value || 0);
  const formatted = Number.isFinite(amount)
    ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)
    : '0';

  return `${formatted.replace(/\s/g, '.')} DA`;
};

export const formatPrice = (value) => formatMoney(value);

export const formatDate = (value) => new Intl.DateTimeFormat('fr-FR').format(new Date(value));
