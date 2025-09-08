// FormatUtils.js
export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return 'N/A';
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return ['+1 ', '(', match[1], ') ', match[2], '-', match[3]].join('');
    }
    const localMatch = cleaned.match(/(\d{3})(\d{3})(\d{4})$/);
    if (localMatch) {
        return ['(', localMatch[1], ') ', localMatch[2], '-', localMatch[3]].join('');
    }
    return phoneNumber;
};
