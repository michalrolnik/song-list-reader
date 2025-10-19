import { apiGet } from './client';

export type Song = { id: number; band: string; title: string };

export function getSongs(): Promise<Song[]> {
  return apiGet<Song[]>('/songs');
}
