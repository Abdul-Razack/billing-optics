import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (str: string, options?: any) => options?.defaultValue || str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...Component.defaultProps, t: (str: string, options?: any) => options?.defaultValue || str };
    return Component;
  },
}));
