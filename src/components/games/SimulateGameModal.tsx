"use client";

import React, { useState } from 'react';
import type { CognitiveGame } from '@/lib/constants';
import { useActivity } from '@/context/ActivityContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";

interface SimulateGameModalProps {
  game: CognitiveGame | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SimulateGameModal({ game, isOpen, onClose }: SimulateGameModalProps) {
  const { addActivity } = useActivity();
  const { toast } = useToast();
  const [score, setScore] = useState('');
  const [duration, setDuration] = useState(''); // in minutes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || !score || !duration) {
        toast({
            title: "Missing Information",
            description: "Please enter both score and duration.",
            variant: "destructive",
        });
        return;
    }

    const scoreNum = parseInt(score, 10);
    const durationMinutes = parseInt(duration, 10);

    if (isNaN(scoreNum) || scoreNum < 0 || isNaN(durationMinutes) || durationMinutes <= 0) {
        toast({
            title: "Invalid Input",
            description: "Score must be a non-negative number and duration must be a positive number.",
            variant: "destructive",
        });
        return;
    }
    
    addActivity({
      gameId: game.id,
      gameTitle: game.title,
      score: scoreNum,
      activityDuration: durationMinutes * 60, // Convert minutes to seconds
    });
    toast({
        title: "Activity Logged!",
        description: `${game.title} score: ${scoreNum}, duration: ${durationMinutes} min.`,
    });
    setScore('');
    setDuration('');
    onClose();
  };

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Simulate Play: {game.title}</DialogTitle>
          <DialogDescription>
            Enter your score and the duration of your play session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="score" className="text-right">
                Score
              </Label>
              <Input
                id="score"
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 1500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (min)
              </Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Log Activity</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
