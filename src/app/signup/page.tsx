"use client";
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
import { useMutation } from '@apollo/client';
import { CREATE_USER } from '@/app/lib/graphql/mutations';
import { withSignedOutLayout } from '../components/SignedOutLayout';


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

function SignUpPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<SignUpInputs>({
        resolver: yupResolver(validationSchema),
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    const [createUser, { error: graphqlError }] = useMutation(CREATE_USER);

    const onSubmit: SubmitHandler<SignUpInputs> = async (data) => {
        setIsSubmitting(true);
        setFormError(null);
        setSuccess(null);

        try {
            const firebaseResponse = await createUserWithEmailAndPassword(auth, data.email, data.password);

            await createUser({ variables: {
                email: data.email,
                firebaseId: firebaseResponse.user.uid,
                token: await firebaseResponse.user.getIdToken(),
            } });

            setSuccess('Sign-up successful!');

            router.push('/');
        } catch (e: any) {
            setFormError(authErrorMessages[e.code] || e.message);
        } finally {
            setIsSubmitting(false);
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
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Sign Up'}
                    </Button>
                    {formError && <Typography color="error">{formError}</Typography>}
                    {graphqlError && <Typography color="error">{graphqlError.message}</Typography>}
                    {success && <Typography color="primary">{success}</Typography>}
                </Box>
            </Box>
        </Container>
    );
}

export default withSignedOutLayout(SignUpPage);