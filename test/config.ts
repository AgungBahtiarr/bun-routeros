function env(key: string): string | undefined {
    return process.env[key];
}

export const config = {
    host: env('HOST') || '127.0.0.1',
    user: env('USERNAME') || 'admin',
    password: env('PASSWORD') || '',
    sslPort: env('SSL_PORT') ? parseInt(env('SSL_PORT')!, 10) : 8729,
};

export default config;

