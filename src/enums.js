export var BackgroundStatus;
(function (BackgroundStatus) {
    BackgroundStatus[BackgroundStatus["Foreground"] = 0] = "Foreground";
    BackgroundStatus[BackgroundStatus["Background"] = 1] = "Background";
})(BackgroundStatus || (BackgroundStatus = {}));
export var EnvironmentFlag;
(function (EnvironmentFlag) {
    EnvironmentFlag[EnvironmentFlag["Inside"] = 0] = "Inside";
    EnvironmentFlag[EnvironmentFlag["Outside"] = 1] = "Outside";
    EnvironmentFlag[EnvironmentFlag["Unknown"] = 2] = "Unknown";
})(EnvironmentFlag || (EnvironmentFlag = {}));
export var LocationOrigin;
(function (LocationOrigin) {
    LocationOrigin[LocationOrigin["NaurtNetwork"] = 0] = "NaurtNetwork";
    LocationOrigin[LocationOrigin["NaurtStandard"] = 1] = "NaurtStandard";
    LocationOrigin[LocationOrigin["NaurtAdvanced"] = 2] = "NaurtAdvanced";
    LocationOrigin[LocationOrigin["GNSS"] = 3] = "GNSS";
})(LocationOrigin || (LocationOrigin = {}));
export var PlatformOrigin;
(function (PlatformOrigin) {
    PlatformOrigin[PlatformOrigin["Android"] = 0] = "Android";
    PlatformOrigin[PlatformOrigin["Ios"] = 1] = "Ios";
})(PlatformOrigin || (PlatformOrigin = {}));
