// Index - Redirect to dashboard or login
import { Redirect } from 'expo-router';
import { useAuth } from '../src/lib/auth';

export default function Index() {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    if (user) {
        return <Redirect href="/(tabs)/dashboard" />;
    }

    return <Redirect href="/(auth)/login" />;
}
