export const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'No definido';
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' })
        .format(value)
        .replace('RD$', 'RD$ ');
};
