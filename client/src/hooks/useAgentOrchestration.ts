import { useState, useCallback } from 'react';
import type { AgentTask, OrchestratorResult, AgentFeedback } from '@/lib/agent-orchestrator';
import {
  orchestrateAgents,
  executeParallelTasks,
  executeSequentialTasks,
  provideFeedback,
  getAgentMetrics,
  assessTaskComplexity,
  recommendAgentTeam
} from '@/lib/agent-orchestrator';

export interface UseAgentOrchestrationState {
  tasks: AgentTask[];
  results: OrchestratorResult[];
  isLoading: boolean;
  error: string | null;
  currentTask: AgentTask | null;
  selectedAgents: string[];
}

export const useAgentOrchestration = () => {
  const [state, setState] = useState<UseAgentOrchestrationState>({
    tasks: [],
    results: [],
    isLoading: false,
    error: null,
    currentTask: null,
    selectedAgents: []
  });

  const addTask = useCallback((task: AgentTask) => {
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  }, []);

  const executeTask = useCallback(async (task: AgentTask) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, currentTask: task }));

    try {
      const result = await orchestrateAgents(task);
      setState(prev => ({
        ...prev,
        results: [...prev.results, result],
        isLoading: false
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  const executeTasks = useCallback(
    async (tasks: AgentTask[], parallel: boolean = true) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const results = parallel
          ? await executeParallelTasks(tasks)
          : await executeSequentialTasks(tasks);

        setState(prev => ({
          ...prev,
          results: [...prev.results, ...results],
          isLoading: false
        }));
        return results;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }));
        throw error;
      }
    },
    []
  );

  const submitFeedback = useCallback(async (feedback: AgentFeedback) => {
    try {
      await provideFeedback(feedback);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  }, []);

  const getAgentPerformance = useCallback(async (agentId: string) => {
    try {
      return await getAgentMetrics(agentId);
    } catch (error) {
      console.error('Failed to get agent metrics:', error);
      return null;
    }
  }, []);

  const assessComplexity = useCallback((task: AgentTask): number => {
    return assessTaskComplexity(task);
  }, []);

  const suggestAgents = useCallback((task: AgentTask): string[] => {
    return recommendAgentTeam(task);
  }, []);

  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: [],
      currentTask: null
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    // State
    ...state,

    // Task management
    addTask,
    removeTask,
    clearResults,

    // Task execution
    executeTask,
    executeTasks,

    // Feedback and metrics
    submitFeedback,
    getAgentPerformance,

    // Analysis
    assessComplexity,
    suggestAgents,

    // Error handling
    clearError
  };
};

export default useAgentOrchestration;
