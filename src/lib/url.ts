import { REALM_DATA } from '../data/realms';
import type { RealmData } from '../types';

export function dossierFromSearch(search: string): RealmData | null {
  const id = new URLSearchParams(search).get('dossier');
  if (!id) return null;
  return REALM_DATA.find((r) => r.id === id) ?? null;
}

export function realmIndexFromLocation(search: string, hash: string): number | null {
  const params = new URLSearchParams(search);
  const realmParams = params.getAll('realm');
  if (realmParams.length > 0) {
    if (realmParams.length !== 1 || !/^(0|[1-9]\d*)$/.test(realmParams[0])) return null;
    const idx = Number(realmParams[0]);
    if (idx < REALM_DATA.length) return idx;
    return null;
  }
  if (hash) {
    const id = hash.replace('#', '');
    const idx = REALM_DATA.findIndex((r) => r.id === id);
    if (idx !== -1) return idx;
  }
  return null;
}
