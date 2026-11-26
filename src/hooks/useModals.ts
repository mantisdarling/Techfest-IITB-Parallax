import { useEffect, useMemo, useReducer } from 'react';
import { dossierFromSearch } from '../lib/url';
import type { RealmData } from '../types';

export interface ModalState {
  dossier: RealmData | null;
  campusMapOpen: boolean;
  passModalOpen: boolean;
}

export type ModalAction =
  | { type: 'OPEN_DOSSIER'; payload: RealmData }
  | { type: 'CLOSE_DOSSIER' }
  | { type: 'OPEN_MAP' }
  | { type: 'CLOSE_MAP' }
  | { type: 'OPEN_PASS' }
  | { type: 'CLOSE_PASS' };

const ALL_CLOSED: ModalState = { dossier: null, campusMapOpen: false, passModalOpen: false };

export function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'OPEN_DOSSIER':
      return { ...ALL_CLOSED, dossier: action.payload };
    case 'CLOSE_DOSSIER':
      return { ...state, dossier: null };
    case 'OPEN_MAP':
      return { ...ALL_CLOSED, campusMapOpen: true };
    case 'CLOSE_MAP':
      return { ...state, campusMapOpen: false };
    case 'OPEN_PASS':
      return { ...ALL_CLOSED, passModalOpen: true };
    case 'CLOSE_PASS':
      return { ...state, passModalOpen: false };
    default:
      return state;
  }
}

export function useModals() {
  const [state, dispatch] = useReducer(modalReducer, undefined, (): ModalState => {
    const dossier =
      typeof window === 'undefined' ? null : dossierFromSearch(window.location.search);
    return { ...ALL_CLOSED, dossier };
  });

  const anyOpen = state.dossier !== null || state.campusMapOpen || state.passModalOpen;

  useEffect(() => {
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [anyOpen]);

  const actions = useMemo(
    () => ({
      openDossier: (realm: RealmData) => dispatch({ type: 'OPEN_DOSSIER', payload: realm }),
      closeDossier: () => dispatch({ type: 'CLOSE_DOSSIER' }),
      openMap: () => dispatch({ type: 'OPEN_MAP' }),
      closeMap: () => dispatch({ type: 'CLOSE_MAP' }),
      openPass: () => dispatch({ type: 'OPEN_PASS' }),
      closePass: () => dispatch({ type: 'CLOSE_PASS' }),
    }),
    []
  );

  return { modalState: state, modalActions: actions };
}
