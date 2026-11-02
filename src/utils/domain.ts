/**
 * Extract domain from URL
 * Removes protocol and www. but keeps domain extension
 * Example: "https://www.mydomain.com" -> "mydomain.com"
 * Returns empty string if URL is invalid or is a special URL (chrome://, about:, etc.)
 */
export function extractDomain(url: string): string {
    try {
        const urlObj = new URL(url);
        // Don't process special URLs
        if (urlObj.protocol.startsWith('chrome') || urlObj.protocol === 'about:') {
            return '';
        }
        let domain = urlObj.hostname;
        if (!domain) {
            return '';
        }
        if (domain.startsWith('www.')) {
            domain = domain.substring(4);
        }
        return domain;
    } catch {
        return '';
    }
}

/**
 * Extract tenantHost by removing string between first and second dot
 * Example: "dev7.brief.wppes-map-dev.com" -> "dev7.wppes-map-dev.com"
 */
export function extractTenantHost(domain: string): string {
    const parts = domain.split('.');
    if (parts.length <= 2) {
        return domain;
    }
    parts.splice(1, 1);
    return parts.join('.');
}

/**
 * Build localhost object from current tab URL
 * Returns null if domain cannot be extracted (invalid URL, special URL, etc.)
 */
export function buildLocalhostObject(tabUrl: string): any {
    if (!tabUrl || typeof tabUrl !== 'string') {
        return null;
    }

    const domain = extractDomain(tabUrl);
    if (!domain) {
        return null;
    }

    return {
        tenantHost: extractTenantHost(domain),
        applicationHost: domain,
    };
}
