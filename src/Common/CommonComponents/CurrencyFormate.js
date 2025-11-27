// currency formate by country code
export const formatCurrency = (amount, code) => {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: code
    }).format(amount)
}
// indian curreny without decimals
export const formatCurrencyWithoutDecimals = (amount, code, numberSystem) => {
    return new Intl.NumberFormat(numberSystem == 'en-IN' ? 'en-IN' : undefined, {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 0 // Removes decimal values
    }).format(amount)
}

export const formatLabel = (label) => {
    return label
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

export const matchesWord = (command, key) => {
    const c = command.toLowerCase().replace(/\s+/g, "");
    const k = key.toLowerCase().replace(/\s+/g, "");
    return (
        c === k ||
        c === k + "s" ||
        c + "s" === k ||
        c === k.replace(/s$/, "") ||
        c.replace(/s$/, "") === k
    );
}

export const extractScreenName = (command) => {
    // Remove common verbs and articles from the start
    return command
        .toLowerCase()
        .replace(/^(open|go to|show me|navigate to|i want to open|i need to open|take me to|take me|show|see|find|view|the|a|my)\s+/i, "")
        .replace(/\s+$/, "") // Remove trailing spaces
        .trim();
}


export const normalizePath = (path) => {
    return path
        .toLowerCase()
        .replace(/^\//, "")
        .replace(/[^a-z]/g, "");
};

export const normalizeWord = (word) => {
    return word
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/ies$/, "y")
        .replace(/s$/, "");
};