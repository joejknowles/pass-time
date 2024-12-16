import DataProvider from "./DataProvider";

export const SignedOutLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <DataProvider>
            {children}
        </DataProvider>
    );
};

export const withSignedOutLayout = (Component: React.ComponentType) => {
    return () => (
        <SignedOutLayout>
            <Component />
        </SignedOutLayout>
    );
};
