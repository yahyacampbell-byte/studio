
"use client";

import type { GameActivity, AIAnalysisResults, GameId } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, Timestamp, doc, DocumentData, QueryDocumentSnapshot, writeBatch, deleteDoc } from 'firebase/firestore';

interface ActivityContextType {
  activities: GameActivity[];
  addActivity: (activityData: { gameId: GameId; gameTitle: string; score: number; activityDuration: number }) => Promise<void>;
  aiAnalysisHistory: AIAnalysisResults[];
  addAIAnalysisToHistory: (results: Omit<AIAnalysisResults, 'lastAnalyzed'>) => Promise<void>;
  latestAIAnalysis: AIAnalysisResults | null;
  isLoadingAI: boolean;
  setIsLoadingAI: (loading: boolean) => void;
  isLoadingActivities: boolean; 
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// Helper to convert Firestore Timestamps in AIAnalysisResults to ISO strings
const mapFirestoreTimestampToISO = (docData: DocumentData): AIAnalysisResults => {
  const rawLastAnalyzed = docData.lastAnalyzed;
  let lastAnalyzedISO: string;

  if (rawLastAnalyzed instanceof Timestamp) {
    lastAnalyzedISO = rawLastAnalyzed.toDate().toISOString();
  } else if (typeof rawLastAnalyzed === 'string') {
    // If it's already a string (e.g., from local storage mock or previous conversion), use it
    lastAnalyzedISO = rawLastAnalyzed;
  } else {
    // Fallback for missing or unexpected type. Firestore should provide Timestamp.
    // This might indicate an issue if data is being written incorrectly elsewhere.
    console.warn('mapFirestoreTimestampToISO: lastAnalyzed field was not a Timestamp or string:', rawLastAnalyzed, 'for docData:', docData);
    lastAnalyzedISO = new Date().toISOString(); // Default to now, or consider more robust error handling
  }

  return {
    intelligenceScores: docData.intelligenceScores || [],
    multipleIntelligencesSummary: docData.multipleIntelligencesSummary || '',
    broaderCognitiveInsights: docData.broaderCognitiveInsights, // This can be undefined
    actionableRecommendations: docData.actionableRecommendations || '',
    lastAnalyzed: lastAnalyzedISO,
  };
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
              timestamp: (data.timestamp instanceof Timestamp) ? data.timestamp.toDate().toISOString() : new Date(data.timestamp || Date.now()).toISOString(),
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
      } else if (!isLoadingAuth) { 
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
      return;
    }
    
    const newActivityFirestore = {
      ...activityData,
      userId: user.id, // Ensure userId is part of the activity document for potential broader queries
      timestamp: serverTimestamp(), 
    };
    try {
      const activitiesColRef = collection(db, `users/${user.id}/activities`);
      const docRef = await addDoc(activitiesColRef, newActivityFirestore);
      
      const newActivityClient: GameActivity = {
        ...activityData,
        id: docRef.id,
        timestamp: new Date().toISOString(), 
      };
      setActivities(prevActivities => [...prevActivities, newActivityClient].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    } catch (error) {
      console.error("Error adding activity to Firestore:", error);
    }
  }, [user]);

  const addAIAnalysisToHistory = useCallback(async (analysisData: Omit<AIAnalysisResults, 'lastAnalyzed'>) => {
    if (!user || !user.id) {
      console.error("Cannot add AI analysis: User not logged in.");
      return;
    }
    const newAnalysisFirestore = {
      ...analysisData,
      lastAnalyzed: serverTimestamp(), 
    };
    try {
      const analysesColRef = collection(db, `users/${user.id}/aiAnalyses`);
      await addDoc(analysesColRef, newAnalysisFirestore); // No need to get docRef if not immediately using the ID client-side for this
      
      const newAnalysisClient: AIAnalysisResults = {
          ...analysisData,
          lastAnalyzed: new Date().toISOString(), 
      };
      setAIAnalysisHistory(prevHistory => [...(prevHistory || []), newAnalysisClient].sort((a,b) => new Date(a.lastAnalyzed).getTime() - new Date(b.lastAnalyzed).getTime()));
    } catch (error) {
      console.error("Error adding AI analysis to Firestore:", error);
    }
  }, [user]);

  const latestAIAnalysis = aiAnalysisHistory && aiAnalysisHistory.length > 0 ? aiAnalysisHistory[aiAnalysisHistory.length - 1] : null;

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

    