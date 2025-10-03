/**
 * AddressDisplay Component
 *
 * Displays street poetry location with formatted address and Google Maps link
 */

import PropTypes from 'prop-types';
import { formatAddressForDisplay, generateMapsUrl } from '@/utils/addressFormatter.js';

export const AddressDisplay = ({ address, lat, lon, styles }) => {
    // Don't render if no location data
    if (!address && !lat && !lon) return null;

    const displayAddress = formatAddressForDisplay(address);
    const mapsUrl = generateMapsUrl(lat, lon, address);

    return (
        <div className={styles.addressContainer}>
            {displayAddress && (
                <span className={styles.addressText}>{displayAddress}</span>
            )}

            {mapsUrl && (
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapsLink}
                    aria-label="Bekijk locatie op Google Maps"
                >
                    📍 Toon op kaart
                </a>
            )}
        </div>
    );
};

AddressDisplay.propTypes = {
    address: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
    styles: PropTypes.object.isRequired
};
