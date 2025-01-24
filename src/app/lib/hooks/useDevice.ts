import { useMediaQuery } from "@mui/material";

interface ValueOptions<T = any> {
    smallestWidthOrLess?: T;
    widerThanSmallestWidth?: T;
    smallerPhoneWidthOrLess?: T;
    widerThanSmallerPhoneWidth?: T;
    smallPhoneWidthOrLess?: T;
    widerThanSmallPhoneWidth?: T;
    mediumPhoneWidthOrLess?: T;
    widerThanMediumPhoneWidth?: T;
    largePhoneWidthOrLess?: T;
    widerThanLargePhoneWidth?: T;
    phabletWidthOrLess?: T;
    widerThanPhabletWidth?: T;
}

interface Options<T = any> {
    [key: string]: ValueOptions<T>;
}

export const useDevice = <T = any>(options: Options<T> = {}) => {
    const isPhabletWidthOrLess = useMediaQuery("(max-width:710px)");
    const isLargePhoneWidthOrLess = useMediaQuery("(max-width:580px)");
    const isMediumPhoneWidthOrLess = useMediaQuery("(max-width:400px)");
    const isSmallPhoneWidthOrLess = useMediaQuery("(max-width:320px)");
    const isSmallerPhoneWidthOrLess = useMediaQuery("(max-width:300px)");
    const isExtraSmallPhoneWidthOrLess = useMediaQuery("(max-width:280px)");

    const breakpoints = [
        { name: 'phabletWidth' as const, query: isPhabletWidthOrLess },
        { name: 'largePhoneWidth' as const, query: isLargePhoneWidthOrLess },
        { name: 'mediumPhoneWidth' as const, query: isMediumPhoneWidthOrLess },
        { name: 'smallPhoneWidth' as const, query: isSmallPhoneWidthOrLess },
        { name: 'smallerPhoneWidth' as const, query: isSmallerPhoneWidthOrLess },
        { name: 'smallestWidth' as const, query: isExtraSmallPhoneWidthOrLess },
    ];

    const values: { [key: string]: T | undefined } = {};

    for (const key in options) {
        const valueOptions = options[key];
        for (const breakpoint of breakpoints) {
            if (breakpoint.query) {
                const value = valueOptions[`${breakpoint.name}OrLess`];
                if (value === undefined) {
                    continue;
                }
                values[key] = value
            } else {
                const value = valueOptions[`widerThan${breakpoint.name.charAt(0).toUpperCase() + breakpoint.name.slice(1)}` as keyof ValueOptions<T>];
                if (value === undefined) {
                    continue;
                }
                values[key] = value;
                break;
            }
        }
    }

    return {
        isPhabletWidthOrLess,
        isLargePhoneWidthOrLess,
        isMediumPhoneWidthOrLess,
        isSmallPhoneWidthOrLess,
        isSmallerPhoneWidthOrLess,
        isExtraSmallPhoneWidthOrLess,
        values,
    };
};
