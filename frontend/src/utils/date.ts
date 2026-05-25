/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { format } from 'date-fns';

export const formatDate = (date: Date | string, pattern = 'dd MMM yyyy') => {
  return format(new Date(date), pattern);
};

export default formatDate;
