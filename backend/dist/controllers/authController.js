import { supabase } from '../config/supabase.js';
export class AuthController {
    static async signup(req, res) {
        try {
            const { email, password } = req.body;
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error)
                throw error;
            res.status(201).json({
                success: true,
                data: { user: data.user },
                message: 'Signup successful. Please check your email for verification.'
            });
        }
        catch (error) {
            console.error('Signup error:', error);
            res.status(400).json({
                success: false,
                error: 'Failed to create account'
            });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error)
                throw error;
            res.json({
                success: true,
                data: {
                    user: data.user,
                    session: data.session
                }
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
    }
}
