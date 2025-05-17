
"use client";

import type { GameActivity, AIAnalysisResults, GameId } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, Timestamp, doc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

interface ActivityContextType {
  activities: GameActivity[];
  addActivity: (activityData: { gameId: GameId; gameTitle: string; score: number; activityDuration: number }) => Promise<void>;
  aiAnalysisHistory: AIAnalysisResults[];
  addAIAnalysisToHistory: (results: Omit<AIAnalysisResults, 'lastAnalyzed'>) => Promise<void>;
  latestAIAnalysis: AIAnalysisResults | null;
  isLoadingAI: boolean;
  setIsLoadingAI: (loading: boolean) => void;
  isLoadingActivities: boolean; // New state for loading activities
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// Helper to convert Firestore Timestamps in AIAnalysisResults to ISO strings
const mapFirestoreTimestampToISO = (docData: DocumentData): AIAnalysisResults => {
  const data = { ...docData } as AIAnalysisResults;
  if (data.lastAnalyzed && data.lastAnalyzed instanceof Timestamp) {
    data.lastAnalyzed = data.lastAnalyzed.toDate().toISOString();
  }
  // If intelligenceScores have timestamps, map them here too if necessary
  return data;
};


export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoadingAuth } = useAuth();
  const [activities, setActivities] = useState<GameActivity[]>([]);
  const [aiAnalysisHistory, setAIAnalysisHistory] = useState<AIAnalysisResults[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.id) {
        setIsLoadingActivities(true);
        try {
          // Fetch activities
          const activitiesColRef = collection(db, `users/${user.id}/activities`);
          const activitiesQuery = query(activitiesColRef, orderBy("timestamp", "asc"));
          const activitiesSnapshot = await getDocs(activitiesQuery);
          const fetchedActivities = activitiesSnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              ...data,
              id: docSnap.id,
              timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as GameActivity;
          });
          setActivities(fetchedActivities);

          // Fetch AI analysis history
          const analysesColRef = collection(db, `users/${user.id}/aiAnalyses`);
          const analysesQuery = query(analysesColRef, orderBy("lastAnalyzed", "asc"));
          const analysesSnapshot = await getDocs(analysesQuery);
          const fetchedAnalyses = analysesSnapshot.docs.map(docSnap => 
             mapFirestoreTimestampToISO(docSnap.data() as DocumentData)
          );
          setAIAnalysisHistory(fetchedAnalyses);

        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setActivities([]);
          setAIAnalysisHistory([]);
        } finally {
          setIsLoadingActivities(false);
        }
      } else if (!isLoadingAuth) { // If not loading auth and no user, means logged out
        setActivities([]);
        setAIAnalysisHistory([]);
        setIsLoadingActivities(false);
      }
    };

    if (!isLoadingAuth) {
        fetchUserData();
    }
  }, [user, isLoadingAuth]);

  const addActivity = useCallback(async (activityData: { gameId: GameId; gameTitle: string; score: number; activityDuration: number }) => {
    if (!user || !user.id) {
      console.error("Cannot add activity: User not logged in.");
      // Optionally, throw an error or show a toast
      return;
    }
    setIsLoadingAI(true); // Assuming this might trigger AI later or is part of a flow
    const newActivityFirestore: Omit<GameActivity, 'id'> = {
      ...activityData,
      timestamp: serverTimestamp() as any, // Firestore will convert this
    };
    try {
      const activitiesColRef = collection(db, `users/${user.id}/activities`);
      const docRef = await addDoc(activitiesColRef, newActivityFirestore);
      
      // Create the client-side version with the ID and converted timestamp
      const newActivityClient: GameActivity = {
        ...activityData,
        id: docRef.id,
        timestamp: new Date().toISOString(), // Immediate representation
      };
      setActivities(prevActivities => [...prevActivities, newActivityClient]);
    } catch (error) {
      console.error("Error adding activity to Firestore:", error);
    } finally {
      setIsLoadingAI(false);
    }
  }, [user]);

  const addAIAnalysisToHistory = useCallback(async (analysisData: Omit<AIAnalysisResults, 'lastAnalyzed'>) => {
    if (!user || !user.id) {
      console.error("Cannot add AI analysis: User not logged in.");
      return;
    }
    const newAnalysisFirestore = {
      ...analysisData,
      lastAnalyzed: serverTimestamp() as any, // Firestore will convert this
    };
    try {
      const analysesColRef = collection(db, `users/${user.id}/aiAnalyses`);
      const docRef = await addDoc(analysesColRef, newAnalysisFirestore);
      
      // Create client-side version with ID and converted timestamp
      const newAnalysisClient: AIAnalysisResults = {
          ...analysisData,
          lastAnalyzed: new Date().toISOString(), // Immediate representation
      };
      setAIAnalysisHistory(prevHistory => [...prevHistory, newAnalysisClient]);
    } catch (error) {
      console.error("Error adding AI analysis to Firestore:", error);
    }
  }, [user]);

  const latestAIAnalysis = aiAnalysisHistory.length > 0 ? aiAnalysisHistory[aiAnalysisHistory.length - 1] : null;

  return (
    <ActivityContext.Provider value={{
        activities,
        addActivity,
        aiAnalysisHistory,
        addAIAnalysisToHistory,
        latestAIAnalysis,
        isLoadingAI,
        setIsLoadingAI,
        isLoadingActivities
      }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = (): ActivityContextType => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};
