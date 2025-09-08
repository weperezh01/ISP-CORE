const formatDate = (dateString, timeString) => {
    console.log('Fecha recibida:', dateString, 'Hora recibida:', timeString);

    if (!dateString || dateString === '0000-00-00' || !Date.parse(dateString)) {
        return 'Fecha u hora no válida'; // Validar si la fecha es correcta
    }

    // Validar si la hora es correcta (00:00:00 a 23:59:59)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

    let timePart = '12:00:00'; // Hora por defecto
    if (timeRegex.test(timeString)) {
        timePart = timeString;
    } else {
        console.warn('Hora no válida recibida:', timeString);
    }

    // Crear un objeto Date usando la fecha y la hora
    const dateTimeString = `${dateString.split('T')[0]}T${timePart}`;
    const date = new Date(dateTimeString);

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
        return 'Fecha u hora no válida';  // Si no es válida, devolver un mensaje
    }

    // Opciones de formato de fecha y hora
    const options = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };

    return new Intl.DateTimeFormat('es-ES', options).format(date);
};

export default formatDate;
