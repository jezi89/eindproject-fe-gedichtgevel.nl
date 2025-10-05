// src/components/Core/Canvas/components/controls/BackgroundControls.jsx

import React, {useState} from "react";
import styles from "../Canvas.module.scss"; // Updated import path
import {
    anwbCities,
    capitalCities,
    cityDisplayNames,
} from "@/data/canvas/searchData.js"; // Updated import path
import {useAuthContext} from "@/context/auth/AuthContext.jsx";

export default function BackgroundControls({
                                               // State
                                               query,
                                               setQuery,
                                               isFreeSearchVisible,
                                               setIsFreeSearchVisible,
                                               selectedAnwbCity,
                                               setSelectedAnwbCity,
                                               selectedCapital,
                                               setSelectedCapital,
                                               isLoading,
                                               error,
                                               hoverFreezeActive,
                                               useCustomTerm,
                                               setUseCustomTerm,
                                               usePremiumSearch,
                                               setUsePremiumSearch,

                                               // Handlers
                                               onSearch,
                                               onOpenPhotoGrid,
                                               onCitySearch,
                                               onResetToCollection,
                                               handleSearchClick,
                                               handleDropdownSearch,
                                               backgroundSectionOpen,
                                               setBackgroundSectionOpen,
                                           }) {
    const {user} = useAuthContext();
    return (
        <div className={styles.controlSection}>
            <button
                className={styles.sectionHeader}
                onClick={() => setBackgroundSectionOpen(!backgroundSectionOpen)}
            >
                <h3>🖼️ Achtergrond</h3>
                <span
                    className={`${styles.sectionToggle} ${
                        !backgroundSectionOpen ? styles.collapsed : ""
                    }`}
                >
					▼
				</span>
            </button>

            <div
                className={`${styles.sectionContent} ${
                    !backgroundSectionOpen ? styles.collapsed : ""
                }`}
            >
                {/* Hoofdknop om foto grid te openen */}
                <button
                    onClick={onOpenPhotoGrid}
                    className={styles.chooseBackgroundButton}
                >
                    🖼️ Kies achtergrond
                </button>

                {/* Dropdown selecties */}
                <div className={styles.controlRow}>
                    <select
                        value={selectedAnwbCity}
                        onChange={(e) => handleDropdownSearch(e, "anwb")}
                        className={styles.cityDropdown}
                    >
                        <option value="">ANWB's mooie steden</option>
                        {anwbCities.sort().map((city) => (
                            <option key={city} value={city}>
                                {cityDisplayNames[city] || city}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.controlRow}>
                    <select
                        value={selectedCapital}
                        onChange={(e) => handleDropdownSearch(e, "capital")}
                        className={styles.cityDropdown}
                    >
                        <option value="">Hoofdsteden...</option>
                        {capitalCities.sort().map((city) => (
                            <option key={city} value={city}>
                                {cityDisplayNames[city] || city}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Button row: Vrij zoeken + Reset collectie */}
                <div className={styles.buttonRow}>
                    <button
                        onClick={() => {
                            const willOpen = !isFreeSearchVisible;
                            setIsFreeSearchVisible(willOpen);

                            // Reset dropdowns wanneer vrij zoeken wordt geopend
                            if (willOpen) {
                                setSelectedAnwbCity("");
                                setSelectedCapital("");
                            }
                        }}
                    >
                        {isFreeSearchVisible ? "← Terug" : "Vrij zoeken"}
                    </button>
                    <div className={styles.resetButtonContainer}>
                        <button
                            onClick={() => {
                                setSelectedAnwbCity(""); // Reset ANWB dropdown
                                setSelectedCapital(""); // Reset hoofdsteden dropdown
                                setIsFreeSearchVisible(false); // Verberg vrij zoeken balk
                                onResetToCollection();
                                onOpenPhotoGrid();
                            }}
                        >
                            Reset collectie
                        </button>
                        {/* Timer indicator for hover freeze */}
                        {hoverFreezeActive && (
                            <div
                                className={styles.timerIndicator}
                                title="Hover freeze active (5 seconds)"
                            >
                                🚫
                            </div>
                        )}
                    </div>
                </div>

                {/* Vrij zoeken input (alleen als visible) */}
                {isFreeSearchVisible && (
                    <div className={styles.freeSearchSection}>
                        {/* Search input */}
                        <div className={styles.controlRow}>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter" && query.trim()) {
                                        handleSearchClick();
                                    }
                                }}
                                placeholder={
                                    useCustomTerm
                                        ? "Zoek een achtergrond..."
                                        : "Stad of zoekterm (bijv. Amsterdam)..."
                                }
                                className={styles.searchInput}
                            />
                        </div>

                        {/* Search options checkboxes */}
                        <div className={styles.searchOptions}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={useCustomTerm}
                                    onChange={(e) => setUseCustomTerm(e.target.checked)}
                                />
                                <span>Eigen zoekterm (zonder "gevels in")</span>
                            </label>

                            {/* Premium search only for authenticated users */}
                            {user && (
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={usePremiumSearch}
                                        onChange={(e) => setUsePremiumSearch(e.target.checked)}
                                    />
                                    <span>Premium zoeken (Flickr)</span>
                                </label>
                            )}
                        </div>

                        {/* Search button - repositioned below options */}
                        <button
                            onClick={handleSearchClick}
                            disabled={isLoading || !query.trim()}
                            className={styles.searchButtonLarge}
                        >
                            {isLoading ? "Zoeken..." : "🔍 Zoek achtergrond"}
                        </button>

                        {/* Info text */}
                        <p className={styles.searchInfo}>
                            {useCustomTerm
                                ? `💡 Zoekt naar exact wat je invoert ${user && usePremiumSearch ? '(via Flickr)' : '(via Pexels)'}`
                                : user && usePremiumSearch
                                    ? `💡 Zoekt automatisch naar gevels in de opgegeven stad (via Flickr)`
                                    : `💡 Zoekt automatisch naar facades in de opgegeven stad (via Pexels - Engels voor betere resultaten)`
                            }
                        </p>
                    </div>
                )}

                {error && <p className={styles.errorMessage}>{error}</p>}
            </div>
        </div>
    );
}
