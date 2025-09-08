function formatDate(isoDateString) {
    if (!isoDateString) return 'N/A';

    // Convierte la fecha a un objeto Date
    const date = new Date(isoDateString);

    // Asegúrate de manejar el huso horario de República Dominicana (UTC-4)
    const options = {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        timeZone: 'America/Santo_Domingo',
    };

    return date.toLocaleDateString('es-DO', options);
}
