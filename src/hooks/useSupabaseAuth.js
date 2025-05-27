/**
 * useSupabaseAuth Hook
 *
 * A custom React hook that provides a complete authentication solution
 * combining Supabase auth operations with form handling capabilities.
 *
 * Architecture Overview:
 * - This hook serves as the primary interface for authentication in React components
 * - It uses the authService for actual Supabase operations (separation of concerns)
 * - It integrates useAuthForm for form state management
 * - The AuthProvider will use this hook internally for context state management
 *
 * Benefits:
 * - Can be used directly in components for auth operations
 * - Combines auth logic with form handling
 * - Provides loading states and error handling
 * - Fully typed and testable
 *
 * @example
 * // In a component
 * const { loginForm, signupForm, user, logout } = useSupabaseAuth();
 *
 * // In AuthProvider
 * const auth = useSupabaseAuth();
 * return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
 */


