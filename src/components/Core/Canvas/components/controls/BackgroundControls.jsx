// src/components/Core/Canvas/components/controls/BackgroundControls.jsx

import React from "react";
import styles from "../../Canvas.module.scss"; // Updated import path
import {
	anwbCities,
	capitalCities,
	cityDisplayNames,
} from "@/data/canvas/searchData"; // Updated import path

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
						<option value="">ANWB steden...</option>
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
						<div className={styles.controlRow}>
							<input
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === "Enter" && query.trim()) {
										onSearch(query);
										onOpenPhotoGrid();
									}
								}}
								placeholder="Zoek een achtergrond..."
								className={styles.searchInput}
							/>
							<button
								onClick={() => handleSearchClick()}
								disabled={isLoading}
								className={styles.searchButton}
							>
								{isLoading ? "..." : "Zoek"}
							</button>
						</div>
					</div>
				)}

				{error && <p className={styles.errorMessage}>{error}</p>}
			</div>
		</div>
	);
}
