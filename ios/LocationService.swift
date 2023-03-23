import CoreLocation
import Foundation
import UIKit
import NaurtSDK

internal class LocationService: NSObject, CLLocationManagerDelegate, LocationServiceDelegate {
    
    
    let locationManager: CLLocationManager
    var backgroundTask: UIBackgroundTaskIdentifier = UIBackgroundTaskIdentifier.invalid
    var user: LocationServiceUser? = nil;
    
    
    override init() {
        locationManager = CLLocationManager()
        
        locationManager.desiredAccuracy = kCLLocationAccuracyBest;
        locationManager.distanceFilter = kCLDistanceFilterNone;
        
        
        locationManager.requestAlwaysAuthorization();
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
        
        super.init();
        locationManager.delegate = self
        
    }
    
    // Delegate Methods
    func startUpdatingLocation(){
        if CLLocationManager.locationServicesEnabled(){
            self.locationManager.startUpdatingLocation();
        }
    }
    
    func stopUpdatingLocation() {
        self.locationManager.stopUpdatingLocation();
    }
    
    func didUpdateLocation(location: CLLocation){
        self.user?.newLocationServicePoint(newLocation: location);
    }
    
    // Location Manager Methods
    public func locationManager(_ manager: CLLocationManager, didUpdateLocations location: [CLLocation]){
        if let newLocation = location.last {
            self.didUpdateLocation(location: newLocation);
        }
        
    }
    
    public func locationManager(_ manager: CLLocationManager,
                         didFailWithError error: Error){
        if (error as NSError).domain == kCLErrorDomain && (error as NSError).code == CLError.Code.denied.rawValue{
            //User denied your app access to location information.
        }
    }
    
    public func locationManager(_ manager: CLLocationManager,
                                  didChangeAuthorization status: CLAuthorizationStatus){
        if status == .authorizedAlways{
            //You can resume logging by calling startUpdatingLocation here
        }
    }
    
    func locationManagerDidPauseLocationUpdates(_ manager: CLLocationManager) {
        // Request additional background execution time
        backgroundTask = UIApplication.shared.beginBackgroundTask(expirationHandler: {
            // End the background task if the app is terminated
            UIApplication.shared.endBackgroundTask(self.backgroundTask)
            self.backgroundTask = UIBackgroundTaskIdentifier.invalid
        })
    }
    
    func locationManagerDidResumeLocationUpdates(_ manager: CLLocationManager) {
        // End the background task if location updates are resumed
        if backgroundTask != UIBackgroundTaskIdentifier.invalid {
            UIApplication.shared.endBackgroundTask(backgroundTask)
            backgroundTask = UIBackgroundTaskIdentifier.invalid
        }
    }
}
