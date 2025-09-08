export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'RD$ 0.00';
    
    // Convertir a un número con separadores de miles y dos decimales
    const formattedNumber = parseFloat(amount)
        .toFixed(2) // Asegura 2 decimales
        .replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Agrega comas como separadores de miles

    // Asegurar el prefijo con espacio
    return `RD$ ${formattedNumber}`;
};
