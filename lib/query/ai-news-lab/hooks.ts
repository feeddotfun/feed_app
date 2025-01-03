import { UseQueryResult } from '@tanstack/react-query';
import { createGenericQuery } from '../core/use-generic-query';
import { AINewsLabService } from './service';
import { BaseResponse, AINewsLabItem } from '@/types';

const aiNewsLabService = new AINewsLabService();
const useMemeQuery = createGenericQuery<AINewsLabItem, AINewsLabService>(
  aiNewsLabService, 
  'aiNewsLab', 
  { staleTime: 10000 }
);

export const useAINewsLab = () => {
  const { useGetAll, useCustomAction } = useMemeQuery();
  const convertMutation = useCustomAction(
    (id: string) => aiNewsLabService.convertToArena(id)
  );
  const items: UseQueryResult<BaseResponse<AINewsLabItem>> = useGetAll();

  return {
    items,
    convertMutation
  };
};