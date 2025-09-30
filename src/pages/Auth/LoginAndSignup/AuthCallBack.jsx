// TODO Checken of deze component nog nodig is en samenvatting verweken in  verantwoordingsdocumentatie
/**
 * De AuthCallback component dient als tussenpagina voor het verwerken van de Supabase-authenticatie callback na bijvoorbeeld e-mailbevestiging of magic link login.
 *
 * Waarvoor dient deze component?
 * Leest de hash uit de URL (waarin Supabase tokens staan na bevestiging).
 * Vraagt Supabase om de huidige sessie (supabase.auth.getSession()).
 * Redirect:
 * Als er een geldige sessie is: naar /account.
 * Geen sessie: naar /welkom.
 * Bij fout: naar /welkom?error=....
 * Is deze component nodig?
 * Supabase handelt de callback grotendeels automatisch af:
 * Supabase verwerkt de hash en slaat de sessie op in localStorage zodra de pagina wordt geladen.
 * Toch is een callback-pagina aanbevolen:
 * Je wilt de gebruiker een duidelijke redirect geven na bevestiging.
 * Je kunt loading/foutmeldingen tonen.
 * Je kunt extra logica toevoegen (bijv. onboarding, analytics).
 * Zie ook de architectuurfile (AUTH_FLOW_ARCHITECTURE.md), waar onder "Email Confirmation Callback" staat:
 *
 * // Handles Supabase email confirmation redirects
 * // Redirects to /welkom after processing
 *
 * Samenvatting
 * Supabase verwerkt de hash automatisch, maar een eigen callback-component is handig voor UX, foutafhandeling en redirects.
 * Je component volgt de aanbevolen architectuur en is dus zinvol in deze flow.
 *
 * @returns {JSX.Element|null}
 * @constructor
 */

import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import supabase from '@/services/supabase/supabase.js';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the hash fragment from URL (contains access_token, etc.)
                const hash = window.location.hash;

                if (hash) {
                    console.log('Processing auth callback...');

                    // Supabase will automatically handle the hash and update the session
                    const {data, error} = await supabase.auth.getSession();

                    if (error) {
                        throw error; // Don't wrap in new Error()
                    }

                    if (data.session) {
                        console.log('Email confirmed successfully!');
                        // Redirect to welcome or dashboard
                        navigate('/account', {replace: true});
                    } else {
                        console.log('No session found');
                        navigate('/welkom', {replace: true});
                    }
                } else {
                    console.log('No auth hash found');
                    navigate('/welkom', {replace: true});
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                setError(err.message);
                // Redirect to login with error message
                navigate('/welkom?error=' + encodeURIComponent(err.message), {replace: true});
            } finally {
                setLoading(false);
            }
        };

        handleAuthCallback();
    }, [navigate]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                flexDirection: 'column'
            }}>
                <div>Bevestigen van je account...</div>
                <div style={{marginTop: '1rem', fontSize: '0.9rem', color: '#666'}}>
                    Even geduld, we verwerken je email bevestiging.
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                flexDirection: 'column'
            }}>
                <div style={{color: 'red', marginBottom: '1rem'}}>
                    Fout bij het bevestigen van je account
                </div>
                <div style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>
                    {error}
                </div>
                <button onClick={() => navigate('/welkom')}>
                    Terug naar login
                </button>
            </div>
        );
    }

    return null;
};

export default AuthCallback;
