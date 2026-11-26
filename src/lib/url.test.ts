import { describe, expect, it } from 'vitest';
import { dossierFromSearch, realmIndexFromLocation } from './url';

describe('dossierFromSearch', () => {
  it('resolves a known realm id', () => {
    expect(dossierFromSearch('?dossier=robowars')?.id).toBe('robowars');
  });

  it('returns null for unknown or missing ids', () => {
    expect(dossierFromSearch('?dossier=nope')).toBeNull();
    expect(dossierFromSearch('')).toBeNull();
  });
});

describe('realmIndexFromLocation', () => {
  it('prefers a valid realm query param', () => {
    expect(realmIndexFromLocation('?realm=2', '')).toBe(2);
    expect(realmIndexFromLocation('?realm=0', '#stage')).toBe(0);
  });

  it('rejects invalid realm params without falling back to hash', () => {
    expect(realmIndexFromLocation('?realm=9', '#stage')).toBeNull();
    expect(realmIndexFromLocation('?realm=abc', '')).toBeNull();
    expect(realmIndexFromLocation('?realm=-1', '')).toBeNull();
  });

  it('falls back to a matching hash', () => {
    expect(realmIndexFromLocation('', '#drones')).toBe(2);
    expect(realmIndexFromLocation('', '#unknown')).toBeNull();
    expect(realmIndexFromLocation('', '')).toBeNull();
  });
});
