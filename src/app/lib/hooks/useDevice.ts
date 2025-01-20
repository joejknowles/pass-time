import { useMediaQuery } from "@mui/material";

export const useDevice = () => {
    const isPhabletWidthOrLess = useMediaQuery("(max-width:710px)");
    const isLargePhoneWidthOrLess = useMediaQuery("(max-width:600px)");
    const isMediumPhoneWidthOrLess = useMediaQuery("(max-width:480px)");
    const isSmallPhoneWidthOrLess = useMediaQuery("(max-width:360px)");
    const isExtraSmallPhoneWidthOrLess = useMediaQuery("(max-width:320px)");

    return {
        isPhabletWidthOrLess,
        isLargePhoneWidthOrLess,
        isMediumPhoneWidthOrLess,
        isSmallPhoneWidthOrLess,
        isExtraSmallPhoneWidthOrLess,
    };
};
