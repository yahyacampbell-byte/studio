
"use client";

import type { GameActivity, AIAnalysisResults, GameId } from '@/lib/types';
import { LOCAL_STORAGE_ACTIVITY_KEY, LOCAL_STORAGE_INSIGHTS_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ActivityContextType {
  activities: GameActivity[];
  addActivity: (activityData: { gameId: GameId; gameTitle: string; score: number; activityDuration: number }) => void;
  clearActivities: () => void;
  aiResults: AIAnalysisResults | null;
  setAIResults: (results: AIAnalysisResults | null) => void;
  isLoadingAI: boolean;
  setIsLoadingAI: (loading: boolean) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [activities, setActivities] = useState<GameActivity[]>([]);
  const [aiResults, setAIResultsState] = useState<AIAnalysisResults | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedActivities = localStorage.getItem(LOCAL_STORAGE_ACTIVITY_KEY);
      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      }
      const storedAIResults = localStorage.getItem(LOCAL_STORAGE_INSIGHTS_KEY);
      if (storedAIResults) {
        setAIResultsState(JSON.parse(storedAIResults));
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
  
  const updateLocalStorageAIResults = useCallback((updatedResults: AIAnalysisResults | null) => {
    try {
      if (updatedResults) {
        localStorage.setItem(LOCAL_STORAGE_INSIGHTS_KEY, JSON.stringify(updatedResults));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_INSIGHTS_KEY);
      }
    } catch (error) {
      console.error("Error saving AI results to localStorage:", error);
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

  const clearActivities = useCallback(() => {
    setActivities([]);
    updateLocalStorageActivities([]);
    setAIResultsState(null); 
    updateLocalStorageAIResults(null);
  }, [updateLocalStorageActivities, updateLocalStorageAIResults]);

  const setAIResults = useCallback((results: AIAnalysisResults | null) => {
    setAIResultsState(results);
    updateLocalStorageAIResults(results);
  }, [updateLocalStorageAIResults]);


  return (
    <ActivityContext.Provider value={{ activities, addActivity, clearActivities, aiResults, setAIResults, isLoadingAI, setIsLoadingAI }}>
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
