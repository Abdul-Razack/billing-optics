export interface DbConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  url: string;
}
export function getDatabaseConfig(envUrl?: string): DbConfig;

export const DEFAULT_CONFIG: {
  host: string;
  port: number;
  database: string;
  adminUser: string;
  appUser: string;
};
