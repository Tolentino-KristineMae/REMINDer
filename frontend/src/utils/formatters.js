export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        currencyDisplay: 'symbol'
    }).format(amount || 0).replace('PHP', '₱');
};

export const formatDateLocal = (dateString) => {
    if (!dateString) return 'No Date';
    // Use manual extraction to avoid timezone shifts
    const [year, month, day] = dateString.split(/[-T]/);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};
