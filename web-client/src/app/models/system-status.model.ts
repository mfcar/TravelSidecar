export interface SystemStatus {
  applicationVersion: string;
  buildDate: Date;
  databaseVersion: string;
  firstVersionInstalled: string | null;
  firstVersionInstalledAt: Date | null;
  dotNetVersion: string;
  isRunningOnDocker: boolean;
  latestInstalledVersion: string | null;
  latestVersionInstalledAt: Date | null;
  latestMigrationApplied: string;
  osName: string;
  osVersion: string;
  startDate: Date;
  uptime: string;
}
