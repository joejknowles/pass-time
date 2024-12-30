import EverywhereProviders from "./EverywhereProviders";

export const SignedOutLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <EverywhereProviders>
            {children}
        </EverywhereProviders>
    );
};

export const withSignedOutLayout = (Component: React.ComponentType) => {
    return () => (
        <SignedOutLayout>
            <Component />
        </SignedOutLayout>
    );
};
