/**
 * Test button om Sentry error tracking te testen
 * Gooi een error die wordt opgevangen door ErrorBoundary en naar Sentry gestuurd
 */
export function ErrorButton() {
    return (
        <button
            onClick={() => {
                throw new Error('Test error: Sentry integration check');
            }}
            style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
            }}
        >
            Test Sentry Error
        </button>
    );
}