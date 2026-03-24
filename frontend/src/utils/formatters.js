export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        currencyDisplay: 'symbol'
    }).format(amount || 0).replace('PHP', '₱');
};

export const formatDateLocal = (dateString, options = {}) => {
    if (!dateString) return 'No Date';

    const date = new Date(dateString);

    const defaultOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...options
    };

    return date.toLocaleString('en-US', defaultOptions);
};
