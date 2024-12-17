import DataProvider from "./DataProvider";

export const SignedInLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <DataProvider>
            {children}
        </DataProvider>
    );
};

export const withSignedInLayout = (Component: React.ComponentType) => {
    return () => (
        <SignedInLayout>
            <Component />
        </SignedInLayout>
    );
};
