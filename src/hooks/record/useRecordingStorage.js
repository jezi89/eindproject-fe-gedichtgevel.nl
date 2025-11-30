import { useLiveQuery } from "dexie-react-hooks";
import Dexie from "dexie";
import { useCallback } from "react";

// Define the database
class SpreekgevelDB extends Dexie {
  constructor() {
    super("spreekgevel-db");
    this.version(1).stores({
      recordings: "id, date, title, duration" // Primary key and indexed props
    });
  }
}

const db = new SpreekgevelDB();

export const useRecordingStorage = () => {
  // useLiveQuery automatically updates the component when the database changes
  const recordings = useLiveQuery(
    () => db.recordings.orderBy("date").reverse().toArray(),
    []
  );

  const saveRecording = useCallback(async (blob, metadata = {}) => {
    try {
      const id = crypto.randomUUID();
      await db.recordings.add({
        id,
        blob,
        date: new Date().toISOString(),
        title: metadata.title || `Opname ${new Date().toLocaleString()}`,
        duration: metadata.duration || 0,
        ...metadata
      });
    } catch (error) {
      console.error("Failed to save recording:", error);
      throw error;
    }
  }, []);

  const deleteRecording = useCallback(async (id) => {
    try {
      await db.recordings.delete(id);
    } catch (error) {
      console.error("Failed to delete recording:", error);
      throw error;
    }
  }, []);

  return {
    recordings: recordings || [], // Default to empty array while loading
    loading: !recordings,
    error: null, // Dexie handles errors internally mostly, but could add state if needed
    saveRecording,
    deleteRecording
  };
};
