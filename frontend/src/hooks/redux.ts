import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../types/store';

// Typed hooks for Redux
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Selector helpers
export const useLoadingSelector = (slice: keyof RootState, key: string): boolean => 
  useAppSelector(state => state[slice].loading[key]);

export const useErrorSelector = (slice: keyof RootState, key: string): string | null => 
  useAppSelector(state => state[slice].error[key]);
