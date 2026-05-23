export const appConfig = {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
};
export default appConfig;
