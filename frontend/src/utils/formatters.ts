export const formatCurrency = (val: number | null | undefined): string => {
    if (val == null || isNaN(val)) return '$0.00';
    if (Math.abs(val) >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (Math.abs(val) >= 1_000) return `$${(val / 1_000).toFixed(2)}K`;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
};

export const formatPct = (val: number | null | undefined, isDecimal: boolean = false, includeSign: boolean = false): string => {
    if (val == null || isNaN(val)) return '0.00%';
    const v = isDecimal ? val * 100 : val;
    const str = `${v.toFixed(2)}%`;
    if (includeSign && val > 0) return '+' + str;
    return str;
};

export const formatNumber = (val: number | null | undefined): string => {
    if (val == null || isNaN(val)) return '0';
    if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(2)}K`;
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);
};

export const formatRisk = (val: number | null | undefined): string => {
    if (val == null || isNaN(val)) return '0.00';
    return val.toFixed(2);
};

export const formatShap = (val: number | null | undefined): string => {
    if (val == null || isNaN(val)) return '0.00';
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}`;
};

export const formatHealth = (val: number | null | undefined): string => {
    if (val == null || isNaN(val)) return '0.00';
    return val.toFixed(2);
};
