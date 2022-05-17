export interface AndroidDeviceReport {
    processName: String | null,
    hasMockingAppsInstalled: String | null,
    wasLastLocationMocked: String | null,
    isDeveloper: boolean,
    isDeviceRooted: boolean,
    isInWorkProfile: boolean,
    lastReportChange: number,
}