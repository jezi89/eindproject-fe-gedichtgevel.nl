// src/components/Core/Canvas/controls/ImageQualityControls.jsx

import React from "react";
import styles from "../Canvas.module.scss";
import { IMAGE_QUALITY_MODE } from "../../../../utils/imageOptimization";

export default function ImageQualityControls({
	imageQualityMode,
	setImageQualityMode,
	qualitySectionOpen,
	setQualitySectionOpen,
}) {
	const qualityOptions = [
		{
			value: IMAGE_QUALITY_MODE.ECO,
			label: "Eco",
			description: "Lagere resolutie (0.75x) - Bespaart bandbreedte"
		},
		{
			value: IMAGE_QUALITY_MODE.AUTO,
			label: "Auto",
			description: "Standaard kwaliteit (1.0x) - Aanbevolen"
		},
		{
			value: IMAGE_QUALITY_MODE.HIGH,
			label: "Hoog",
			description: "Hoge resolutie (2.5x) - Beste kwaliteit"
		}
	];

	return (
		<div className={styles.controlSection}>
			<button
				className={styles.sectionHeader}
				onClick={() => setQualitySectionOpen(!qualitySectionOpen)}
			>
				<h3>📷 Afbeeldingskwaliteit</h3>
				<span
					className={`${styles.sectionToggle} ${
						!qualitySectionOpen ? styles.collapsed : ""
					}`}
				>
					▼
				</span>
			</button>

			<div
				className={`${styles.sectionContent} ${
					!qualitySectionOpen ? styles.collapsed : ""
				}`}
			>
				<div className={styles.qualityModeContainer}>
					{qualityOptions.map((option) => (
						<label
							key={option.value}
							className={`${styles.qualityOption} ${
								imageQualityMode === option.value ? styles.active : ""
							}`}
						>
							<input
								type="radio"
								name="qualityMode"
								value={option.value}
								checked={imageQualityMode === option.value}
								onChange={(e) => setImageQualityMode(e.target.value)}
							/>
							<div className={styles.qualityOptionContent}>
								<span className={styles.qualityLabel}>{option.label}</span>
								<span className={styles.qualityDescription}>
									{option.description}
								</span>
							</div>
						</label>
					))}
				</div>
			</div>
		</div>
	);
}
