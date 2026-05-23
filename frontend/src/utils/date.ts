import { format } from 'date-fns';

export const formatDate = (date: Date | string, pattern = 'dd MMM yyyy') => {
  return format(new Date(date), pattern);
};

export default formatDate;
