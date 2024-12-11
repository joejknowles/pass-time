'use client';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import {
    Container,
    Box,
    TextField,
    Typography,
    Button,
    CircularProgress,
} from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { authErrorMessages } from './authErrorMessages';


const validationSchema = Yup.object({
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    password: Yup.string().required('Password is required'),
});

type SignUpInputs = {
    email: string;
    password: string;
};

export default function SignUpPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<SignUpInputs>({
        resolver: yupResolver(validationSchema),
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    const onSubmit: SubmitHandler<SignUpInputs> = async (data) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await createUserWithEmailAndPassword(auth, data.email, data.password);
            setSuccess('Sign-up successful!');

            router.push('/');
        } catch (e: any) {
            setError(authErrorMessages[e.code] || e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Sign Up
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{ width: '100%', marginTop: 1 }}
                >
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="email"
                        label="Email Address"
                        autoComplete="email"
                        autoFocus
                        {...register('email', { required: 'Email is required' })}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        {...register('password', { required: 'Password is required' })}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                    </Button>
                    {error && <Typography color="error">{error}</Typography>}
                    {success && <Typography color="primary">{success}</Typography>}
                </Box>
            </Box>
        </Container>
    );
}