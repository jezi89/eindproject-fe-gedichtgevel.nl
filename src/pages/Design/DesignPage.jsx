import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import Canvas from "../../components/Core/Canvas/Canvas.jsx";
import { CanvasDataService } from "../../services/canvas/canvasDataService.js";
import { poems, getPoemById } from "../../data/canvas/testdata.js";

export function DesignPage() {
	const navigate = useNavigate();
	const { poemId } = useParams();
	const [poemData, setPoemData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [dataSource, setDataSource] = useState(null); // Track where data came from

	// Priority-based data loading: sessionStorage → demo poem → fallback
	useEffect(() => {
		const loadPoemData = async () => {
			setLoading(true);
			setError(null);

			try {
				console.log("🎨 DesignPage: Loading poem data...", { poemId });

				// Priority 1: Check for poem data from canvas navigation (sessionStorage)
				const storedPoemData = CanvasDataService.getPoemForCanvas();
				if (storedPoemData) {
					console.log(
						"✅ DesignPage: Using poem from navigation:",
						storedPoemData.title
					);
					setPoemData(storedPoemData);
					setDataSource("navigation");
					setLoading(false);
					return;
				}

				// Priority 2: If we have a poemId, try to get demo poem by ID
				if (poemId) {
					console.log("🔍 DesignPage: Looking for demo poem with ID:", poemId);
					const demoPoemData = getPoemById(poemId);
					if (demoPoemData) {
						console.log(
							"✅ DesignPage: Using demo poem data:",
							demoPoemData.title
						);
						// Standardize demo data format
						const standardizedDemo =
							CanvasDataService.standardizePoemData(demoPoemData);
						setPoemData(standardizedDemo);
						setDataSource("demo");
						setLoading(false);
						return;
					}
				}

				// Priority 3: Fallback to default demo poem (first poem in testdata)
				if (poems && poems.length > 0) {
					console.log(
						"📝 DesignPage: Using fallback demo poem:",
						poems[0].title
					);
					const fallbackDemo = CanvasDataService.standardizePoemData(poems[0]);
					setPoemData(fallbackDemo);
					setDataSource("fallback");
					setLoading(false);
					return;
				}

				// Priority 4: Ultimate fallback - create minimal poem data
				console.warn(
					"⚠️ DesignPage: No poem data available, using minimal fallback"
				);
				const minimalFallback = {
					id: "fallback-poem",
					title: "Welkom bij de Canvas",
					author: "Gedichtgevel.nl",
					lines: [
						"Welkom bij de creatieve canvas!",
						"Hier kun je gedichten visueel vormgeven.",
						"Zoek een gedicht om te beginnen,",
						"of experimenteer met deze demo tekst.",
					],
					source: "fallback",
					timestamp: Date.now(),
					metadata: {
						wordCount: 20,
						lineCount: 4,
						originalFormat: "fallback",
					},
				};
				setPoemData(minimalFallback);
				setDataSource("minimal");
				setLoading(false);
			} catch (error) {
				console.error("❌ DesignPage: Failed to load poem data:", error);
				setError(error.message);
				setLoading(false);
			}
		};

		loadPoemData();
	}, [poemId]);

	const handleCanvasSave = (imageData) => {
		// TODO: Implement save functionality
		console.log("Canvas save requested:", imageData);
	};

	const handleCanvasBack = () => {
		// Navigate back to home or previous page using CanvasDataService
		console.log("⬅️ DesignPage: Navigating back from canvas");
		CanvasDataService.clearPoemData();

		// Try to go back in history, fallback to home
		if (window.history.length > 1) {
			window.history.back();
		} else {
			navigate("/");
		}
	};

	// Show loading state while poem data is being fetched
	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					height: "calc(100vh - 80px)",
					background: "#1d2230",
					color: "#ffffff",
					gap: "1rem",
				}}
			>
				<div style={{ fontSize: "2rem" }}>🎨</div>
				<h2>Canvas wordt geladen...</h2>
				<p style={{ opacity: 0.7 }}>Gedichtdata wordt voorbereid</p>
			</div>
		);
	}

	// Show error state if something went wrong
	if (error) {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					height: "calc(100vh - 80px)",
					background: "#1d2230",
					color: "#ffffff",
					gap: "1rem",
				}}
			>
				<div style={{ fontSize: "2rem" }}>❌</div>
				<h2>Er ging iets mis</h2>
				<p style={{ opacity: 0.7, textAlign: "center", maxWidth: "400px" }}>
					{error}
				</p>
				<button
					onClick={() => navigate("/")}
					style={{
						padding: "0.5rem 1rem",
						background: "#4a5568",
						color: "white",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
					}}
				>
					Terug naar home
				</button>
			</div>
		);
	}

	// Show message if no poem data (shouldn't happen with fallbacks, but just in case)
	if (!poemData) {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					height: "calc(100vh - 80px)",
					background: "#1d2230",
					color: "#ffffff",
					gap: "1rem",
				}}
			>
				<div style={{ fontSize: "2rem" }}>📝</div>
				<h2>Geen gedichtdata beschikbaar</h2>
				<p style={{ opacity: 0.7 }}>
					Ga terug en selecteer een gedicht om te bewerken
				</p>
				<button
					onClick={() => navigate("/")}
					style={{
						padding: "0.5rem 1rem",
						background: "#4a5568",
						color: "white",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
					}}
				>
					Terug naar zoeken
				</button>
			</div>
		);
	}

	// Add data source indicator for debugging/user feedback
	const getDataSourceMessage = () => {
		switch (dataSource) {
			case "navigation":
				return "✅ Gedicht geladen vanuit zoekresultaten";
			case "demo":
				return "📝 Demo gedicht geladen";
			case "fallback":
				return "🎨 Standaard demo gedicht geladen";
			case "minimal":
				return "⚠️ Minimale fallback data geladen";
			default:
				return "";
		}
	};

	return (
		<div style={{ position: "relative", height: "100vh" }}>
			{/* Data source indicator - only show for non-navigation sources */}
			{dataSource !== "navigation" && (
				<div
					style={{
						position: "absolute",
						top: "10px",
						right: "10px",
						background: "rgba(0, 0, 0, 0.7)",
						color: "white",
						padding: "0.5rem 1rem",
						borderRadius: "4px",
						fontSize: "0.875rem",
						zIndex: 1000,
						opacity: 0.8,
					}}
				>
					{getDataSourceMessage()}
				</div>
			)}

			<Canvas
				poemData={poemData}
				onSave={handleCanvasSave}
				onBack={handleCanvasBack}
			/>
		</div>
	);
}