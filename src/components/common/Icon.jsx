/**
 * Centrale Icon-component voor wanneer je meer iconen toevoegt
 * 
 * Voorbeeld implementatie:
 * ```jsx
 * // /components/common/Icon.jsx
 * import { ReactComponent as PlayIcon } from '../assets/icons/audio/play.svg';
 * import { ReactComponent as PauseIcon } from '../assets/icons/audio/pause.svg';
 * // meer imports...
 * 
 * const iconMap = {
 *     play: PlayIcon,
 *     pause: PauseIcon,
 *     // meer mappings...
 * };
 * 
 * export function Icon({ name, size = 24, color = 'currentColor', ...props }) {
 *     const IconComponent = iconMap[name];
 * 
 *     if (!IconComponent) return null;
 * 
 *     return <IconComponent width={size} height={size} fill={color} {...props} />;
 * }
 * ```
 * 
 * Gebruik: `<Icon name="play" size={32} color="#d27c1b" />`
 * 
 * Dit geeft je een flexibele, onderhoudbare opzet die eenvoudig kan uitbreiden 
 * naarmate je meer iconen toevoegt, zonder dat je je zorgen hoeft te maken over 
 * kleine performance-optimalisaties totdat je project substantieel groeit.
 */

// Import icons
// Add icon imports here

/**
 * Icon component for displaying SVG icons throughout the application
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.name - Icon name to display (must match a key in iconMap)
 * @param {number} [props.size=24] - Size of the icon in pixels
 * @param {string} [props.color="currentColor"] - Color of the icon (CSS color value)
 * @returns {JSX.Element|null} The icon component or null if icon name is not found
 */
export function Icon({ name, size = 24, color = 'currentColor', ...props }) {
  // Implementation
}
    // Define your icon map
        // Map icon names to imported components
        // Example: play: PlayIcon,





/**
 * Overwegingen voor performance:
 * 
 * Voor een klein tot middelgroot project zoals gedichtgevel.nl, met enkele tientallen iconen:
 * 
 * - Code-splitting is belangrijk: Als je route-based code-splitting gebruikt (met React Router), 
 *   worden de SVG's die alleen in specifieke routes worden gebruikt, alleen geladen wanneer 
 *   die routes worden bezocht.
 * 
 * - Iconen-bibliotheek overweging: Als je verwacht meer dan 20-30 iconen te gebruiken, 
 *   overweeg dan een iconenbibliotheek zoals:
 *   - Lucide React: Lichtgewicht
 *   - React Icons: Grote collectie, goed geoptimaliseerd
 * 
 * - Lazy loading voor zelden gebruikte iconen:
 * ```jsx
 * const StopIcon = React.lazy(() => import('../assets/icons/icons8-stop-100.svg'));
 * 
 * // In je render
 * {isPlaying && (
 *     <React.Suspense fallback={<div>...</div>}>
 *         <StopIcon />
 *     </React.Suspense>
 * )}
 * ```
 */

