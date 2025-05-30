# Authentication Flow Architecture

Dit document beschrijft de authenticatie architectuur, navigatie flow en de samenhang tussen verschillende auth componenten in de gedichtgevel.nl applicatie.

## Inhoudsopgave

### 1. [React Router 7 Setup](#react-router-7-setup)

- [Mode: Data Router (createBrowserRouter)](#mode-data-router-createbrowserrouter)
- [Waarom Data Router?](#waarom-data-router)
- [Huidige Implementatie Features](#huidige-implementatie-features)
- [Toekomstige Mogelijkheden](#toekomstige-mogelijkheden)

### 2. [Authentication Architecture](#authentication-architecture)

- [Layered Architecture Overzicht](#layered-architecture-overzicht)
- [Component Responsibilities](#component-responsibilities)
    - [authService (Stateless Service Layer)](#1-authservice-stateless-service-layer)
    - [useSupabaseAuth (Stateful Hook)](#2-usesupabaseauth-stateful-hook)
    - [AuthContext & AuthProvider](#3-authcontext--authprovider)
    - [useAuth (Enhanced Hook)](#4-useauth-enhanced-hook)

### 3. [Auth Flow Diagram](#auth-flow-diagram)

- [Sign Up Flow](#sign-up-flow)
- [Password Reset Flow](#password-reset-flow)
- [Login Flow](#login-flow)

### 4. [Navigatie Flows](#navigatie-flows)

- [Protected Routes](#protected-routes)
- [Redirect Patterns](#redirect-patterns)
    - [After Login](#after-login)
    - [After Password Reset](#after-password-reset)
    - [Email Confirmation Callback](#email-confirmation-callback)

### 5. [Best Practices](#best-practices)

- [State Management Beslisboom](#1-state-management-beslisboom)
- [Error Handling Pattern](#2-error-handling-pattern)
- [Navigation State Preservation](#3-navigation-state-preservation)
- [Email Confirmation Handling](#4-email-confirmation-handling)
- [Security Considerations](#5-security-considerations)

### 6. [Toekomstige Verbeteringen](#toekomstige-verbeteringen)

- [React Router 7 Features](#react-router-7-features)
- [Auth Enhancements](#auth-enhancements)
- [Code Examples voor Toekomst](#code-examples-voor-toekomst)

### 7. [Debugging Tips](#debugging-tips)

- [Check Auth State](#check-auth-state)
- [Monitor Auth Events](#monitor-auth-events)
- [Common Issues](#common-issues)

### 8. [AuthService Wrapper: Essentieel of Overbodig?](#authservice-wrapper-essentieel-of-overbodig)

- [Waarom de AuthService Wrapper?](#waarom-de-authservice-wrapper)
    - [Consistente Error Handling](#1-consistente-error-handling)
    - [Business Logic Encapsulation](#2-business-logic-encapsulation)
    - [Testing & Mocking](#3-testing--mocking)
    - [API Abstraction](#4-api-abstraction)
- [Praktische Use Cases voor AuthService](#praktische-use-cases-voor-authservice)
- [Architectuur Vereenvoudiging Opties](#architectuur-vereenvoudiging-opties)
- [Aanbeveling](#aanbeveling)

### 9. [Spring Boot Migratie Voordelen](#spring-boot-migratie-voordelen)

- [AuthService als Adapter Pattern](#1-authservice-als-adapter-pattern)
- [JWT Token Management Ready](#2-jwt-token-management-ready)
- [Spring Security Integratie Patterns](#3-spring-security-integratie-patterns)
- [Minimal Frontend Changes](#4-minimal-frontend-changes)
- [Gradual Migration Path](#5-gradual-migration-path)
- [Profile & User Data Synchronization](#6-profile--user-data-synchronization)
- [Spring Boot Auth Implementation Blueprint](#7-spring-boot-auth-implementation-blueprint)
- [Conclusie](#conclusie)

### 10. [UseSupabaseAuth Hook: Spring Boot Migratie Voordelen](#usesupabaseauth-hook-spring-boot-migratie-voordelen)

- [Waarom een Aparte Hook Laag?](#waarom-een-aparte-hook-laag)
    - [State Management Isolatie](#1-state-management-isolatie)
    - [WebSocket naar SSE/Polling Transitie](#2-websocket-naar-ssepolling-transitie)
    - [Form Integration Layer](#3-form-integration-layer)
- [Hoe useSupabaseAuth Alleen in AuthProvider Wordt Gebruikt](#hoe-usesupabaseauth-alleen-in-authprovider-wordt-gebruikt)
    - [Huidige Architectuur](#huidige-architectuur)
    - [Waarom Deze Isolatie?](#waarom-deze-isolatie)
    - [Anti-Pattern (NIET DOEN)](#anti-pattern-niet-doen)
- [Spring Boot Migratie Scenario](#spring-boot-migratie-scenario)
- [Voordelen van Deze Architectuur](#voordelen-van-deze-architectuur)
- [Conclusie](#conclusie-1)

## React Router 7 Setup

### Mode: Data Router (createBrowserRouter)

We gebruiken React Router 7 in **Data Router mode** met `createBrowserRouter`. Dit is de moderne, aanbevolen aanpak die de volgende voordelen biedt:

```javascript
// main.jsx
const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
        children: [...]
    }
]);
```

### Waarom Data Router?

- **Data Loading**: Mogelijkheid om data te laden vóór route rendering (future-ready)
- **Error Boundaries**: Ingebouwde error handling per route
- **Pending UI**: Automatische loading states tijdens navigatie
- **Type Safety**: Betere TypeScript ondersteuning
- **Form Handling**: Geïntegreerde form actions en loaders

### Huidige Implementatie Features

- **Nested Routing**: App component als root layout met geneste routes
- **Protected Routes**: ProtectedRoute wrapper voor authenticatie-vereiste pagina's
- **Route-based Code Splitting**: Voorbereid voor lazy loading
- **Programmatic Navigation**: `useNavigate` hook voor redirects

### Toekomstige Mogelijkheden

```javascript
// Voorbeeld van data loading (nog niet geïmplementeerd)
{
    path: 'collectiegevel',
        element
:
    <CollectionPage/>,
        loader
:
    async () => {
        // Pre-fetch collection data
        return await poemService.getCollection();
    }
}

// Voorbeeld van route actions
{
    path: 'login',
        element
:
    <LoginPage/>,
        action
:
    async ({request}) => {
        const formData = await request.formData();
        return authService.signIn(formData);
    }
}
```

## Authentication Architecture

### Layered Architecture Overzicht

```
┌─────────────────────────────────────────────────────────────┐
│                     UI Components                            │
│  (LoginForm, SignupForm, PasswordResetForm, etc.)          │
└─────────────────────────┬───────────────────────────────────┘
                          │ gebruikt
┌─────────────────────────▼───────────────────────────────────┐
│                     useAuth Hook                             │
│  • Stateful wrapper om AuthContext                          │
│  • Enhanced methods (signUpWithCheck, etc.)                 │
│  • Local state voor reset flows                             │
└─────────────────────────┬───────────────────────────────────┘
                          │ gebruikt
┌─────────────────────────▼───────────────────────────────────┐
│                  AuthContext/Provider                        │
│  • Global auth state management                              │
│  • User session persistence                                  │
│  • Auto-refresh tokens                                       │
└─────────────────────────┬───────────────────────────────────┘
                          │ gebruikt
┌─────────────────────────▼───────────────────────────────────┐
│                 useSupabaseAuth Hook                         │
│  • Core Supabase operations                                  │
│  • Session management                                        │
│  • Error handling                                           │
└─────────────────────────┬───────────────────────────────────┘
                          │ gebruikt
┌─────────────────────────▼───────────────────────────────────┐
│                    authService                               │
│  • Stateless Supabase client wrapper                        │
│  • Direct API calls                                          │
│  • No state management                                       │
└─────────────────────────┬───────────────────────────────────┘
                          │ gebruikt
┌─────────────────────────▼───────────────────────────────────┐
│                 Supabase Client                              │
│  • External authentication service                           │
│  • Database & storage                                       │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### 1. **authService** (Stateless Service Layer)

- **Locatie**: `/services/auth/authService.js`
- **Doel**: Direct Supabase client wrapper zonder state
- **Wanneer gebruiken**:
    - Voor eenmalige operaties zonder UI updates
    - Background tasks
    - Server-side rendering (toekomst)
    - Utility functies

```javascript
// Voorbeeld gebruik
const checkUserExists = async (email) => {
    return await authService.checkUserExists(email);
};
```

#### 2. **useSupabaseAuth** (Stateful Hook)

- **Locatie**: `/hooks/useSupabaseAuth.js`
- **Doel**: React-aware Supabase operations met state management
- **Verantwoordelijkheden**:
    - Session state beheer
    - Auth state listeners
    - Error state management
    - Loading states
- **Wanneer gebruiken**: Alleen binnen AuthProvider

#### 3. **AuthContext & AuthProvider**

- **Locatie**: `/context/auth/`
- **Doel**: Global auth state distribution
- **Features**:
    - Centralized user state
    - Auto session refresh
    - Cross-component state sync
    - Protected route support

#### 4. **useAuth** (Enhanced Hook)

- **Locatie**: `/hooks/useAuth.js`
- **Doel**: Component-friendly auth interface
- **Enhanced Features**:
    - `signUpWithCheck`: Duplicate email validation
    - `requestPasswordResetEmail`: Password reset flow
    - `updateUserPasswordAfterReset`: Complete reset flow
    - `checkEmailExists`: Pre-validation
- **Wanneer gebruiken**: In alle UI componenten

## Auth Flow Diagram

### Sign Up Flow

```
User Input → SignupForm
    ↓
useAuth.signUpWithCheck()
    ↓
Check email exists? 
    ├─ Yes → Return error "Account exists"
    └─ No → Continue
         ↓
AuthContext.signUp()
    ↓
useSupabaseAuth.signUp()
    ↓
authService.signUp()
    ↓
Supabase → Send confirmation email
    ↓
User clicks email link
    ↓
/auth/callback → AuthCallback component
    ↓
Redirect to /welkom (logged in)
```

### Password Reset Flow

```
1. Request Reset:
   PasswordResetForm → useAuth.requestPasswordResetEmail()
                    → Supabase sends reset email

2. User clicks email link:
   → Redirected to /reset-password with token
   
3. Set New Password:
   NewPasswordForm → useAuth.updateUserPasswordAfterReset()
                  → Updates password
                  → Redirect to /login
```

### Login Flow

```
LoginForm → useAuth.signIn()
         → AuthContext.signIn()
         → Success: Navigate to previous page or /account
         → Failure: Show error
```

## Navigatie Flows

### Protected Routes

```javascript
// Component wrapper voor protected content
<ProtectedRoute>
    <AccountPage/>
</ProtectedRoute>

// Logica:
if (!user && !loading) {
    return <Navigate to="/login" state={{from: location}}/>;
}
```

### Redirect Patterns

#### After Login

```javascript
// LoginForm.jsx
const location = useLocation();
const from = location.state?.from?.pathname || '/account';
navigate(from, {replace: true});
```

#### After Password Reset

```javascript
// NewPasswordForm.jsx
navigate('/login', {
    state: {message: 'Wachtwoord succesvol gereset.'}
});
```

#### Email Confirmation Callback

```javascript
// AuthCallback.jsx
// Handles Supabase email confirmation redirects
// Redirects to /welkom after processing
```

## Best Practices

### 1. State Management Beslisboom

```
Heb je UI state updates nodig?
├─ JA → Gebruik useAuth() hook
│       └─ Component re-renders automatisch
└─ NEE → Is het een utility functie?
         ├─ JA → Gebruik authService direct
         └─ NEE → Gebruik useAuth() voor consistency
```

### 2. Error Handling Pattern

```javascript
// Consistent error handling
const result = await authFunction();
if (result.success) {
    // Handle success
} else {
    // Display result.error to user
}
```

### 3. Navigation State Preservation

```javascript
// Bewaar oorspronkelijke bestemming
<Navigate to="/login" state={{from: location}}/>

// Herstel na login
const from = location.state?.from || '/default';
```

### 4. Email Confirmation Handling

- **Development**: Gebruik Supabase Inbucket voor email testing
- **Production**: Echte emails via Resend SMTP
- **Important**: Check `user.confirmed_at` voor email verificatie status

### 5. Security Considerations

- Tokens worden automatisch beheerd door Supabase
- Refresh tokens worden veilig opgeslagen
- Session expires handling in AuthProvider
- PKCE flow voor OAuth (toekomstig)

## Toekomstige Verbeteringen

### React Router 7 Features

1. **Route Loaders**: Pre-fetch user data voor protected routes
2. **Actions**: Form submissions via router actions
3. **Optimistic UI**: Immediate UI updates tijdens async operations
4. **Error Boundaries**: Route-level error handling

### Auth Enhancements

1. **Social Login**: OAuth providers toevoegen
2. **MFA**: Multi-factor authentication
3. **Session Management**: Meerdere sessies beheer
4. **Role-based Access**: Gebruikersrollen en permissies

### Code Examples voor Toekomst

```javascript
// Route met loader
{
    path: 'account',
        element
:
    <ProtectedRoute>
        <AccountPage/>
    </ProtectedRoute>,
        loader
:
    async () => {
        const user = await authService.getCurrentUser();
        if (!user) throw redirect('/login');
        return {user};
    }
}

// Form action
{
    path: 'login',
        action
:
    async ({request}) => {
        const formData = await request.formData();
        const result = await authService.signIn(
            formData.get('email'),
            formData.get('password')
        );
        if (result.success) {
            return redirect('/account');
        }
        return {error: result.error};
    }
}
```

## Debugging Tips

### Check Auth State

```javascript
// In browser console
const auth = JSON.parse(localStorage.getItem('auth-storage'));
console.log('Current user:', auth?.state?.user);
```

### Monitor Auth Events

```javascript
// Add to AuthProvider for debugging
useEffect(() => {
    console.log('Auth state changed:', {user, loading, error});
}, [user, loading, error]);
```

### Common Issues

1. **"requestPasswordReset is not a function"**: Use `requestPasswordResetEmail`
2. **Infinite redirects**: Check ProtectedRoute conditions
3. **Lost after login**: Ensure location.state is preserved
4. **Email not confirmed**: Check Supabase email settings

## AuthService Wrapper: Essentieel of Overbodig?

### Waarom de AuthService Wrapper?

De `authService` wrapper lijkt op het eerste gezicht redundant omdat Supabase zelf al een goede JavaScript client biedt. Echter, deze wrapper heeft belangrijke voordelen:

#### 1. **Consistente Error Handling**

```javascript
// Zonder wrapper - verschillende error formats
try {
    const {data, error} = await supabase.auth.signUp({...});
    if (error) {
        // Supabase error format
        console.error(error.message || error.code);
    }
} catch (e) {
    // Network/andere errors
    console.error(e);
}

// Met wrapper - altijd hetzelfde format
const result = await authService.register(email, password);
if (!result.success) {
    // Consistent: result.error is altijd een string
    setError(result.error);
}
```

#### 2. **Business Logic Encapsulation**

```javascript
// authService.js
export const register = async (email, password, captchaToken = null, profileData = {}) => {
    // Business logic: email redirect URL
    const redirectUrl = `${window.location.origin}/auth/callback`;

    // Business logic: error message translation
    if (error.code === 'user_already_exists') {
        throw new Error('Een account met dit e-mailadres bestaat al.');
    }

    // Business logic: profile handling
    // (hoewel dit nu via database trigger gaat)
};
```

#### 3. **Testing & Mocking**

```javascript
// Test file
jest.mock('@/services/auth/authService', () => ({
    login: jest.fn(() => Promise.resolve({success: true, data: mockUser})),
    checkUserExists: jest.fn(() => Promise.resolve({exists: false}))
}));

// Veel makkelijker dan Supabase client mocken
```

#### 4. **API Abstraction**

```javascript
// Als we ooit van Supabase naar een andere provider gaan:
// Alleen authService.js aanpassen, niet 20+ componenten

// Van Supabase
const {data, error} = await supabase.auth.signInWithPassword({...});

// Naar Firebase (bijvoorbeeld)
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// Maar de interface blijft: authService.login(email, password)
```

### Praktische Use Cases voor AuthService

#### 1. **Background Token Refresh**

```javascript
// In een service worker of background task
setInterval(async () => {
    const result = await authService.refreshToken();
    if (!result.success) {
        console.error('Token refresh failed:', result.error);
    }
}, 30 * 60 * 1000); // Elke 30 minuten
```

#### 2. **Pre-validation Utilities**

```javascript
// Email check voordat form submit
const validateEmailUniqueness = async (email) => {
    const {exists} = await authService.checkUserExists(email);
    return !exists;
};

// In een form validator
const emailValidator = {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    validate: {
        unique: async (value) => await validateEmailUniqueness(value)
    }
};
```

#### 3. **Server-Side Rendering (Toekomst)**

```javascript
// In een Next.js API route
export async function POST(req) {
    const {email, password} = await req.json();

    // authService werkt ook server-side
    const result = await authService.login(email, password);

    if (result.success) {
        // Set cookie, etc.
    }
}
```

#### 4. **Batch Operations**

```javascript
// Admin functionaliteit
const deactivateInactiveUsers = async () => {
    const inactiveUsers = await getInactiveUsers();

    const results = await Promise.all(
        inactiveUsers.map(user =>
            authService.updateUserProfile(user.id, {active: false})
        )
    );

    return results.filter(r => r.success).length;
};
```

### Architectuur Vereenvoudiging Opties

Als je de architectuur wilt vereenvoudigen, hier is de volgorde waarin je lagen zou kunnen verwijderen:

#### 1. **Eerste Kandidaat: useSupabaseAuth Hook** ❌

Deze hook zit tussen authService en AuthContext. Je zou kunnen:

- AuthContext direct authService laten aanroepen
- State management direct in AuthContext doen

**Waarom niet:** De scheiding tussen stateless service en stateful hook is waardevol voor testing.

#### 2. **Tweede Kandidaat: authService Wrapper** ⚠️

Direct Supabase client gebruiken in useSupabaseAuth:

```javascript
// In plaats van
const result = await authService.login(email, password);

// Direct
const {data, error} = await supabase.auth.signInWithPassword({
    email, password
});
```

**Trade-offs:**

- ✅ Minder code
- ❌ Inconsistente error handling
- ❌ Business logic verspreid
- ❌ Moeilijker testen
- ❌ Vendor lock-in

#### 3. **Beste Optie: Consolideer authService + useSupabaseAuth** ✅

Combineer de twee in één React hook:

```javascript
// useSupabaseService.js - Combineert service + hook
export function useSupabaseService() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email, password
            });

            if (error) throw error;

            return {success: true, data};
        } catch (err) {
            setError(err.message);
            return {success: false, error: err.message};
        } finally {
            setLoading(false);
        }
    }, []);

    return {login, loading, error};
}
```

### Aanbeveling

**Behoud de authService wrapper** omdat:

1. **Separation of Concerns**: UI logic (hooks) gescheiden van business logic (service)
2. **Testbaarheid**: Pure functions zijn makkelijker te testen
3. **Flexibiliteit**: Kan gebruikt worden buiten React componenten
4. **Consistency**: Uniforme error handling en response format
5. **Future-proofing**: Makkelijke migratie naar andere auth providers

Als je toch wilt vereenvoudigen, consolideer dan `authService` + `useSupabaseAuth` in één hook, maar behoud de scheiding tussen business logic en UI components.

## Spring Boot Migratie Voordelen

De huidige architectuur is **ideaal voorbereid** voor een toekomstige migratie naar Java Spring Boot als backend. Hier is waarom:

### 1. **AuthService als Adapter Pattern**

De `authService` werkt als een perfecte adapter tussen frontend en backend:

```javascript
// Huidige implementatie (Supabase)
export const login = async (email, password) => {
    const {data, error} = await supabase.auth.signInWithPassword({
        email, password
    });
    return error ? handleAuthError('Login', error) : handleAuthSuccess(data);
};

// Toekomstige implementatie (Spring Boot)
export const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    });

    const data = await response.json();
    return response.ok ? handleAuthSuccess(data) : handleAuthError('Login', data);
};
```

**Alleen authService.js hoeft aangepast te worden!** Alle React componenten blijven ongewijzigd.

### 2. **JWT Token Management Ready**

Spring Boot gebruikt typisch JWT tokens. De huidige architectuur kan dit makkelijk ondersteunen:

```javascript
// authService.js aanpassing voor JWT
let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
    // Optioneel: localStorage voor persistence
    localStorage.setItem('access_token', token);
};

export const getAuthHeaders = () => ({
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
});

// Gebruik in API calls
export const getCurrentUser = async () => {
    const response = await fetch(`${API_BASE_URL}/api/user/me`, {
        headers: getAuthHeaders()
    });
    // ...rest of implementation
};
```

### 3. **Spring Security Integratie Patterns**

De service layer past perfect bij Spring Security patterns:

```java
// Spring Boot Backend
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // Authenticate with Spring Security
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(), 
                request.getPassword()
            )
        );
        
        // Generate JWT
        String token = jwtTokenProvider.createToken(auth);
        
        // Return same structure as current authService expects
        return ResponseEntity.ok(new AuthResponse(true, token, user));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestHeader("Authorization") String token) {
        // Refresh logic matching authService.refreshToken()
    }
}
```

### 4. **Minimal Frontend Changes**

Bij migratie naar Spring Boot:

#### Wat NIET verandert:

- ✅ Alle React componenten (LoginForm, SignupForm, etc.)
- ✅ useAuth hook interface
- ✅ AuthContext/Provider logica
- ✅ Navigation en routing
- ✅ Error handling in UI

#### Wat WEL verandert:

- ❌ authService.js implementatie
- ❌ Token storage (van Supabase naar JWT)
- ❌ Mogelijk: enkele environment variables

### 5. **Gradual Migration Path**

De architectuur ondersteunt zelfs een **geleidelijke migratie**:

```javascript
// authService.js met feature flags
const USE_SPRING_BOOT = process.env.VITE_USE_SPRING_BOOT === 'true';

export const login = async (email, password) => {
    if (USE_SPRING_BOOT) {
        return loginViaSpringBoot(email, password);
    } else {
        return loginViaSupabase(email, password);
    }
};
```

### 6. **Profile & User Data Synchronization**

```javascript
// Huidige Supabase profile handling
export const getUserProfile = async (userId) => {
    const {data, error} = await supabase
        .from('profile')
        .select('*')
        .eq('id', userId)
        .single();
};

// Spring Boot equivalent
export const getUserProfile = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}`, {
        headers: getAuthHeaders()
    });
    const data = await response.json();
    return response.ok ? {profile: data} : {profile: null, error: data.message};
};
```

### 7. **Spring Boot Auth Implementation Blueprint**

Voor je toekomstige Spring Boot backend:

```java
// Dependencies needed
// - spring-boot-starter-security
// - spring-boot-starter-web
// - jjwt (for JWT)

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### Conclusie

De huidige architectuur met de authService wrapper is **een investering in de toekomst**. Het maakt de migratie naar Spring Boot:

1. **Minimaal disruptief**: Alleen service layer aanpassen
2. **Testbaar**: Kan parallel getest worden
3. **Incrementeel**: Feature-by-feature migratie mogelijk
4. **Type-safe**: Zelfde interface contract behouden

**Aanbeveling**: Behoud absoluut deze architectuur! Het is precies wat je nodig hebt voor een soepele overgang naar een Java Spring Boot backend.

## UseSupabaseAuth Hook: Spring Boot Migratie Voordelen

### Waarom een Aparte Hook Laag?

De `useSupabaseAuth` hook tussen authService en AuthProvider heeft cruciale voordelen voor Spring Boot migratie:

#### 1. **State Management Isolatie**

```javascript
// useSupabaseAuth.js - React-specifieke state
const [user, setUser] = useState(null);
const [session, setSession] = useState(null);
const [loading, setLoading] = useState(true);

// Bij Spring Boot migratie: alleen session format verandert
// Van Supabase session object naar JWT token string
const [token, setToken] = useState(localStorage.getItem('jwt_token'));
```

De hook isoleert **hoe** we state beheren van **wat** de state bevat. Bij migratie naar JWT tokens hoef je alleen de state structure in deze hook aan te passen.

#### 2. **WebSocket naar SSE/Polling Transitie**

```javascript
// Huidige implementatie met Supabase realtime
useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
    });
    return () => unsubscribe();
}, []);

// Spring Boot implementatie met polling/SSE
useEffect(() => {
    // Spring Boot: Check token validity periodically
    const interval = setInterval(async () => {
        const result = await authService.validateToken();
        if (!result.valid) {
            setUser(null);
            setToken(null);
        }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
}, []);
```

#### 3. **Form Integration Layer**

De hook combineert auth operations met form handling - dit blijft **exact hetzelfde** bij Spring Boot:

```javascript
// Deze logica verandert NIET bij migratie
const signIn = useCallback(async (email, password) => {
    try {
        setError(null);
        const result = await authService.signInWithPassword(email, password);
        if (!result.success) throw new Error(result.error);

        loginForm.resetForm(); // Form handling blijft identiek
        return result;
    } catch (err) {
        setError(err.message);
        loginForm.setErrors({form: err.message});
        throw err;
    }
}, [loginForm]);
```

### Hoe useSupabaseAuth Alleen in AuthProvider Wordt Gebruikt

#### Huidige Architectuur:

```javascript
// AuthProvider.jsx
export function AuthProvider({children}) {
    const auth = useSupabaseAuth(); // ENIGE plek waar deze hook wordt gebruikt

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

// In componenten: ALTIJD via useAuth (context)
function LoginForm() {
    const {signIn, loginForm} = useAuth(); // NIET useSupabaseAuth()
    // ...
}
```

#### Waarom Deze Isolatie?

1. **Single Source of Truth**: Één instantie van auth state voor hele app
2. **Prevents State Duplication**: Meerdere useSupabaseAuth() calls zouden aparte states creëren
3. **Centralized Updates**: Auth state changes propageren vanuit één punt

#### Anti-Pattern (NIET DOEN):

```javascript
// ❌ FOUT: Direct useSupabaseAuth in component
function BadComponent() {
    const auth = useSupabaseAuth(); // Creëert NIEUWE auth state!
    // Deze state is niet gesynchroniseerd met de rest van de app
}

// ✅ GOED: Via context
function GoodComponent() {
    const auth = useAuth(); // Gebruikt centrale auth state
}
```

### Spring Boot Migratie Scenario

Bij migratie naar Spring Boot met JWT:

#### Wat Verandert in useSupabaseAuth:

```javascript
// useSupabaseAuth.js - Spring Boot versie
export function useSpringBootAuth() {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null); // JWT token ipv session
    const [loading, setLoading] = useState(true);

    // Token interceptor voor API calls
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, [token]);

    // Login aanpassing
    const signIn = useCallback(async (email, password) => {
        try {
            const result = await authService.signInWithPassword(email, password);
            if (result.success) {
                setToken(result.data.token); // JWT token
                setUser(result.data.user);
                localStorage.setItem('jwt_token', result.data.token);
            }
            loginForm.resetForm();
            return result;
        } catch (err) {
            // Error handling blijft hetzelfde
        }
    }, [loginForm]);

    // Token refresh
    useEffect(() => {
        const refreshInterval = setInterval(async () => {
            if (token) {
                const result = await authService.refreshToken();
                if (result.success) {
                    setToken(result.data.token);
                }
            }
        }, 15 * 60 * 1000); // Refresh every 15 min

        return () => clearInterval(refreshInterval);
    }, [token]);

    // Rest blijft grotendeels hetzelfde...
}
```

#### Wat NIET Verandert:

- AuthProvider implementatie
- Component gebruik van useAuth()
- Form integration
- Error handling patterns
- Method signatures

### Voordelen van Deze Architectuur

1. **Framework Agnostic State Layer**:
    - Hook beheert React state
    - Service beheert API calls
    - Clean separation

2. **Testing Isolatie**:
   ```javascript
   // Test alleen de hook logic
   const { result } = renderHook(() => useSupabaseAuth());
   // Mock alleen authService, niet Supabase of Spring Boot
   ```

3. **Progressive Enhancement Ready**:
    - Form actions blijven werken
    - SSR compatibility behouden
    - Graceful degradation

4. **Migration Path**:
   ```javascript
   // Stap 1: Maak useSpringBootAuth naast useSupabaseAuth
   // Stap 2: Feature flag in AuthProvider
   const AUTH_PROVIDER = process.env.VITE_USE_SPRING_BOOT 
     ? useSpringBootAuth 
     : useSupabaseAuth;
   
   export function AuthProvider({children}) {
     const auth = AUTH_PROVIDER();
     // Rest blijft hetzelfde!
   }
   ```

### Conclusie

De aparte useSupabaseAuth hook is **essentieel** voor Spring Boot migratie omdat:

1. **State Management**: Isoleert React state van auth provider details
2. **Single Implementation**: Alleen deze hook hoeft aangepast voor JWT/Spring Boot
3. **Zero Component Changes**: Alle componenten blijven exact hetzelfde
4. **Gradual Migration**: Kan parallel draaien tijdens transitie

Deze architectuur maakt de migratie naar Spring Boot een kwestie van:

- ✅ authService.js aanpassen voor Spring Boot endpoints
- ✅ useSupabaseAuth → useSpringBootAuth voor JWT handling
- ❌ GEEN component changes nodig
- ❌ GEEN routing changes nodig
- ❌ GEEN form changes nodig