import { ApolloProvider } from '@apollo/client';
import client from '@/app/lib/graphql/apollo-client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

declare module "@mui/material/styles" {
    interface Palette {
        blue: {
            100: string;
            200: string;
            300: string;
            400: string;
            500: string;
            600: string;
            700: string;
            800: string;
            900: string;
        };
        custom: {
            cardInputBorderSelected: string;
            cardTextSelected: string;
            cardBorderSelected: string;
            cardBackgroundSelected: string;
            cardIconSelected: string;
            white: string;
            black: string;
        };
    }
    interface PaletteOptions {
        blue?: {
            100?: string;
            200?: string;
            300?: string;
            400?: string;
            500?: string;
            600?: string;
            700?: string;
            800?: string;
            900?: string;
        };
        custom?: {
            cardInputBorderSelected?: string;
            cardTextSelected?: string;
            cardBorderSelected?: string;
            cardBackgroundSelected?: string;
            cardIconSelected?: string;
            white?: string;
            black?: string;
        };
    }
}

const rawTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        grey: {
            100: 'hsl(0, 0%, 97%)',
            200: 'hsl(0, 0%, 88%)',
            300: 'hsl(0, 0%, 75%)',
            400: 'hsl(0, 0%, 68%)',
            500: 'hsl(0, 0%, 58%)',
            600: 'hsl(0, 0%, 50%)',
            700: 'hsl(0, 0%, 40%)',
            800: 'hsl(0, 0%, 30%)',
            900: 'hsl(0, 0%, 20%)',
        },
        blue: {
            100: 'hsl(207, 90%, 95%)',
            200: 'hsl(207, 90%, 85%)',
            300: 'hsl(207, 90%, 75%)',
            400: 'hsl(207, 90%, 65%)',
            500: 'hsl(207, 90%, 55%)',
            600: 'hsl(207, 90%, 45%)',
            700: 'hsl(207, 90%, 35%)',
            800: 'hsl(207, 90%, 25%)',
            900: 'hsl(207, 90%, 15%)',
        },
    },
});

const theme = createTheme({
    ...rawTheme,
    palette: {
        ...rawTheme.palette,
        custom: {
            cardTextSelected: rawTheme.palette.blue[600],
            cardInputBorderSelected: rawTheme.palette.blue[400],
            cardBorderSelected: rawTheme.palette.blue[400],
            cardBackgroundSelected: rawTheme.palette.blue[100],
            cardIconSelected: rawTheme.palette.blue[600],
            white: 'hsl(0, 0%, 100%)',
            black: 'hsl(0, 0%, 0%)',
        },
    },
});

export default function EverywhereProviders({ children }: { children: React.ReactNode }) {
    return (
        <ApolloProvider client={client}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ApolloProvider>
    );
}
