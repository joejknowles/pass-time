import EverywhereProviders from "./EverywhereProviders";

export const SignedInLayout = ({ children }: { children: React.ReactNode }) => {
  return <EverywhereProviders>{children}</EverywhereProviders>;
};

export const withSignedInLayout = (Component: React.ComponentType) => {
  return () => (
    <SignedInLayout>
      <Component />
    </SignedInLayout>
  );
};
