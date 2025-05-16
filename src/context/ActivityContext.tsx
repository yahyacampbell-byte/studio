
"use client";

import type { GameActivity, AIAnalysisResults, GameId } from '@/lib/types';
import { LOCAL_STORAGE_ACTIVITY_KEY, LOCAL_STORAGE_INSIGHTS_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ActivityContextType {
  activities: GameActivity[];
  addActivity: (activityData: { gameId: GameId; gameTitle: string; score: number; activityDuration: number }) => void;
  aiAnalysisHistory: AIAnalysisResults[];
  addAIAnalysisToHistory: (results: AIAnalysisResults) => void;
  latestAIAnalysis: AIAnalysisResults | null;
  isLoadingAI: boolean;
  setIsLoadingAI: (loading: boolean) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [activities, setActivities] = useState<GameActivity[]>([]);
  const [aiAnalysisHistory, setAIAnalysisHistoryState] = useState<AIAnalysisResults[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedActivities = localStorage.getItem(LOCAL_STORAGE_ACTIVITY_KEY);
      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      }
      const storedAIAnalysisHistory = localStorage.getItem(LOCAL_STORAGE_INSIGHTS_KEY);
      if (storedAIAnalysisHistory) {
        setAIAnalysisHistoryState(JSON.parse(storedAIAnalysisHistory));
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_ACTIVITY_KEY);
      localStorage.removeItem(LOCAL_STORAGE_INSIGHTS_KEY);
    }
  }, []);

  const updateLocalStorageActivities = useCallback((updatedActivities: GameActivity[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVITY_KEY, JSON.stringify(updatedActivities));
    } catch (error) {
      console.error("Error saving activities to localStorage:", error);
    }
  }, []);
  
  const updateLocalStorageAIAnalysisHistory = useCallback((updatedHistory: AIAnalysisResults[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_INSIGHTS_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error saving AI analysis history to localStorage:", error);
    }
  }, []);

  const addActivity = useCallback((activityData: { gameId: GameId; gameTitle: string; score: number; activityDuration: number }) => {
    const newActivity: GameActivity = {
      ...activityData,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    setActivities(prevActivities => {
      const updated = [...prevActivities, newActivity];
      updateLocalStorageActivities(updated);
      return updated;
    });
  }, [updateLocalStorageActivities]);

  const addAIAnalysisToHistory = useCallback((newAnalysis: AIAnalysisResults) => {
    setAIAnalysisHistoryState(prevHistory => {
      const updatedHistory = [...prevHistory, newAnalysis];
      updateLocalStorageAIAnalysisHistory(updatedHistory);
      return updatedHistory;
    });
  }, [updateLocalStorageAIAnalysisHistory]);
  
  const latestAIAnalysis = aiAnalysisHistory.length > 0 ? aiAnalysisHistory[aiAnalysisHistory.length - 1] : null;

  return (
    <ActivityContext.Provider value={{ 
        activities, 
        addActivity, 
        aiAnalysisHistory, 
        addAIAnalysisToHistory, 
        latestAIAnalysis,
        isLoadingAI, 
        setIsLoadingAI 
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
