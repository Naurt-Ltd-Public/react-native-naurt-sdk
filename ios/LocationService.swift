import CoreLocation
import Foundation

internal class LocationService: NSObject, CLLocationManagerDelegate{
    
    public static var sharedInstance = LocationService()
    let locationManager: CLLocationManager
    var locationDataArray: [CLLocation]
    var useFilter: Bool
    
    
    override init() {
        locationManager = CLLocationManager()
        
        locationManager.desiredAccuracy = kCLLocationAccuracyBest;
        locationManager.distanceFilter = kCLDistanceFilterNone;
        
        
        locationManager.requestAlwaysAuthorization();
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
        locationDataArray = [CLLocation]()
        
        useFilter = false
        
        super.init()
        
        locationManager.delegate = self
        
        
    }
    
    
    func startUpdatingLocation(){
        if CLLocationManager.locationServicesEnabled(){
            locationManager.startUpdatingLocation()
        }else{
            //tell view controllers to show an alert
            showTurnOnLocationServiceAlert()
        }
    }
    
    func stopUpdatingLocation() {
        self.locationManager.stopUpdatingLocation();
    }
    
    
    //MARK: CLLocationManagerDelegate protocol methods
    public func locationManager(_ manager: CLLocationManager,
                                  didUpdateLocations location: [CLLocation]){
        
        
        if let newLocation = location.last {
        
            self.locationDataArray.append(newLocation);
            notifiyDidUpdateLocation();
            
        }
        
    }
    
    public func locationManager(_ manager: CLLocationManager,
                         didFailWithError error: Error){
        if (error as NSError).domain == kCLErrorDomain && (error as NSError).code == CLError.Code.denied.rawValue{
            //User denied your app access to location information.
            showTurnOnLocationServiceAlert()
        }
    }
    
    public func locationManager(_ manager: CLLocationManager,
                                  didChangeAuthorization status: CLAuthorizationStatus){
        if status == .authorizedWhenInUse{
            //You can resume logging by calling startUpdatingLocation here
        }
    }
    
    func showTurnOnLocationServiceAlert(){
        NotificationCenter.default.post(name: Notification.Name(rawValue:"showTurnOnLocationServiceAlert"), object: nil)
    }
    
    func notifiyDidUpdateLocation(){
        NotificationCenter.default.post(name: Notification.Name(rawValue:"didUpdateLocation"), object: nil)
    }
    
    public func cleanseLocations(){
        // It's important to reset the cached location points after use
        // This keeps memory low and also helps finding things easier
        self.locationDataArray = [];
    }
}
