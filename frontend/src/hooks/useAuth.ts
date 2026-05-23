export function useAuth() {
  return {
    user: null,
    isAuthenticated: false,
    login: async () => {},
    logout: () => {},
  };
}

export default useAuth;
