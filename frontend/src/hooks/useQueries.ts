import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Mod, ModUpload } from '../backend';

export function useListMods() {
  const { actor, isFetching } = useActor();

  return useQuery<Mod[]>({
    queryKey: ['mods'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMods(BigInt(0), BigInt(200));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetModById(modId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Mod>({
    queryKey: ['mod', modId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getModById(BigInt(modId));
    },
    enabled: !!actor && !isFetching && !!modId,
    retry: false,
  });
}

export function useUploadMod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<bigint, Error, ModUpload>({
    mutationFn: async (upload: ModUpload) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadMod(upload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mods'] });
    },
  });
}

export function useIncrementDownloadCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (modId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementDownloadCount(modId);
    },
    onSuccess: (_data, modId) => {
      queryClient.invalidateQueries({ queryKey: ['mod', modId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['mods'] });
    },
  });
}

export function useDeleteMod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (modId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMod(modId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mods'] });
      queryClient.invalidateQueries({ queryKey: ['myMods'] });
    },
  });
}

export function useGetModsByAuthor(author: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Mod[]>({
    queryKey: ['myMods', author],
    queryFn: async () => {
      if (!actor || !author) return [];
      return actor.getModsByAuthor(author);
    },
    enabled: !!actor && !isFetching && !!author,
  });
}
