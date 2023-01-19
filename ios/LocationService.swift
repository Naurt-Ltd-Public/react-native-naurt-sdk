//
//  LocationService.swift
//  NaurtInternalApp
//
//  Created by Nathaniel Curnick on 18/01/2023.
//

import CoreLocation
import Foundation
import UIKit
import NaurtSDK

internal class LocationService: NSObject, CLLocationManagerDelegate {
    
    public static var sharedInstance = LocationService()
    let locationManager: CLLocationManager
    var backgroundTask: UIBackgroundTaskIdentifier = UIBackgroundTaskIdentifier.invalid
    var locationDataArray: [CLLocation]
    
    override init() {
        locationManager = CLLocationManager()
        
        locationManager.desiredAccuracy = kCLLocationAccuracyBest;
        locationManager.distanceFilter = kCLDistanceFilterNone;
        
        
        locationManager.requestAlwaysAuthorization();
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
        locationDataArray = [CLLocation]()
        super.init();
        locationManager.delegate = self
        
    }
    
    // Delegate Methods
    func startUpdatingLocation(){
        print("The location manager's delegate is \(self.locationManager.delegate)")
        print("I am \(self)")
        print("I have been asked to start updating location")
        if #available(iOS 14.0, *) {
            print("My status is \(self.locationManager.authorizationStatus)")
        } else {
            // Fallback on earlier versions
        };
        print("Location services are \(CLLocationManager.locationServicesEnabled())");
        if CLLocationManager.locationServicesEnabled(){
            locationManager.startUpdatingLocation()
            print("I actually started")
        }
    }
    
    func stopUpdatingLocation() {
        print(self.locationManager.location);
        self.locationManager.stopUpdatingLocation();
        print("Stopped lm")
        
    }
    
    func didUpdateLocation(){
        NotificationCenter.default.post(name: Notification.Name(rawValue:"didUpdateLocation"), object: nil)
    }
    
    public func cleanse() {
        self.locationDataArray = [CLLocation]();
    }
    
    // Location Manager Methods
    public func locationManager(_ manager: CLLocationManager, didUpdateLocations location: [CLLocation]){
        print("Location manager is giving me locations")
        if let newLocation = location.last {
            self.locationDataArray.append(newLocation);
            self.didUpdateLocation();
        }
        
    }
    
    public func locationManager(_ manager: CLLocationManager,
                         didFailWithError error: Error){
        print("Something in location failed")
        if (error as NSError).domain == kCLErrorDomain && (error as NSError).code == CLError.Code.denied.rawValue{
            //User denied your app access to location information.
        }
    }
    
    public func locationManager(_ manager: CLLocationManager,
                                  didChangeAuthorization status: CLAuthorizationStatus){
        if status == .authorizedAlways{
            //You can resume logging by calling startUpdatingLocation here
            print("I have the location permissions I need")
        }
    }
    
    public func locationManager(_ manager: CLLocationManager, didFinishDeferredUpdatesWithError error: Error?) {
        print("Did finish deferred updates with error");
        if let err = error {
            print(err);
        }
    }
    
    func locationManagerDidPauseLocationUpdates(_ manager: CLLocationManager) {
        // Request additional background execution time
        print("Did pause")
        backgroundTask = UIApplication.shared.beginBackgroundTask(expirationHandler: {
            // End the background task if the app is terminated
            UIApplication.shared.endBackgroundTask(self.backgroundTask)
            self.backgroundTask = UIBackgroundTaskIdentifier.invalid
        })
    }
    
    func locationManagerDidResumeLocationUpdates(_ manager: CLLocationManager) {
        print("Did resume")
        // End the background task if location updates are resumed
        if backgroundTask != UIBackgroundTaskIdentifier.invalid {
            UIApplication.shared.endBackgroundTask(backgroundTask)
            backgroundTask = UIBackgroundTaskIdentifier.invalid
        }
    }
}
