/**
 * DailyPoems Component
 *
 * Displays 3 random street poems using the useDailyPoems hook and renders them with SearchResults.
 * Includes easter egg features for logged-in users.
 */

import { useNavigate } from "react-router";
import { SearchResults } from "@/components/search/SearchResults.jsx";
import { CanvasDataService } from "@/services/canvas/canvasDataService.js";
import { useDailyPoems } from "@/context/poem/DailyPoemsContext.jsx";
import { useAuth } from "@/hooks/auth/useAuth.js";
import styles from "./DailyPoems.module.scss";

export const DailyPoems = () => {
  const navigate = useNavigate();
  const { dailyPoems, isLoading, refetchDailyPoems } = useDailyPoems();
  const { user } = useAuth();

  const handleNavigateToCanvas = (poemData) => {
    if (!poemData || !poemData.id) return;

    try {
      // Standardize and store the data for the canvas
      const standardizedPoem = CanvasDataService.storePoemForCanvas(poemData);

      // Navigate to the canvas with the poem ID
      navigate(`/designgevel/${standardizedPoem.id}`, {
        state: {
          selectedPoem: standardizedPoem,
          source: "daily",
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleNavigateToRecording = (poemData) => {
    if (!poemData) return;

    try {
      // Navigate to recording page with poem data in state
      navigate("/spreekgevel", {
        state: {
          selectedPoem: poemData,
          source: "daily",
        },
      });
    } catch (error) {
      navigate("/spreekgevel");
    }
  };

  // A simple loading state could be added here if desired
  if (isLoading || !dailyPoems || dailyPoems.length === 0) {
    return null; // Or a loading skeleton
  }

  return (
    <div className={styles.dailyPoemsWrapper}>
      <SearchResults
        results={dailyPoems}
        layoutMode="daily"
        cardSize="compact"
        showGlobalToggle={false}
        sectionTitle="Straatgedichten van de Dag"
        sectionSubtitle="Ontdek onze dagelijks wisselende curatie van daadwerkelijke Nederlandse straatpoëzie"
        onNavigateToCanvas={handleNavigateToCanvas}
        onNavigateToRecording={handleNavigateToRecording}
        focusMode={false}
        canvasMode={false}
      />

      {/* Easter egg hint for anonymous users */}
      {!user && (
        <p className={styles.easterEggHint}>
          <em>Registreer om een verborgen easter egg te ontdekken...</em>
        </p>
      )}

      {/* Easter egg brick for logged-in users */}
      {user && (
        <span
          className={styles.brickEmoji}
          onClick={() => {
            if (refetchDailyPoems) refetchDailyPoems();
          }}
          title="Ververs gedichten (Alt + G)"
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === "Enter" && refetchDailyPoems && refetchDailyPoems()
          }
        >
          🧱
        </span>
      )}
    </div>
  );
};
