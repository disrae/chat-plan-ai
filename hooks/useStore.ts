import { create } from 'zustand';

type Store = {
  successMessage: string;
  errorMessage: string;
  setSuccessMessage: (message: string) => void;
  setErrorMessage: (message: string) => void;
  clearMessages: () => void;
};

export const useStore = create<Store>((set) => ({
  successMessage: '',
  errorMessage: '',
  setSuccessMessage: (message) => set({ successMessage: message, errorMessage: '' }),
  setErrorMessage: (message) => set({ errorMessage: message, successMessage: '' }),
  clearMessages: () => set({ successMessage: '', errorMessage: '' }),
}));
