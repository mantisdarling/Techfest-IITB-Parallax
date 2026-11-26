import { describe, expect, it } from 'vitest';
import { modalReducer, type ModalState } from './useModals';
import { REALM_DATA } from '../data/realms';

const CLOSED: ModalState = { dossier: null, campusMapOpen: false, passModalOpen: false };

describe('modalReducer', () => {
  it('opens the dossier exclusively', () => {
    const state = modalReducer(
      { ...CLOSED, campusMapOpen: true },
      { type: 'OPEN_DOSSIER', payload: REALM_DATA[0] }
    );
    expect(state.dossier).toBe(REALM_DATA[0]);
    expect(state.campusMapOpen).toBe(false);
    expect(state.passModalOpen).toBe(false);
  });

  it('opens map and pass exclusively', () => {
    const withDossier = modalReducer(CLOSED, { type: 'OPEN_DOSSIER', payload: REALM_DATA[1] });
    const withMap = modalReducer(withDossier, { type: 'OPEN_MAP' });
    expect(withMap).toEqual({ ...CLOSED, campusMapOpen: true });
    const withPass = modalReducer(withMap, { type: 'OPEN_PASS' });
    expect(withPass).toEqual({ ...CLOSED, passModalOpen: true });
  });

  it('closes individual modals without touching others', () => {
    const open = modalReducer(CLOSED, { type: 'OPEN_PASS' });
    expect(modalReducer(open, { type: 'CLOSE_PASS' })).toEqual(CLOSED);
    const map = modalReducer(CLOSED, { type: 'OPEN_MAP' });
    expect(modalReducer(map, { type: 'CLOSE_MAP' })).toEqual(CLOSED);
  });

  it('returns state unchanged for unknown actions', () => {
    const state = { ...CLOSED, campusMapOpen: true };
    expect(modalReducer(state, { type: 'NOOP' } as never)).toBe(state);
  });
});
