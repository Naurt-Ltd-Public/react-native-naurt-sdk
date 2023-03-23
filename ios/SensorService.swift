//
//  SensorService.swift
//  NaurtInternalApp
//
//  Created by Nathaniel Curnick on 18/01/2023.
//

import Foundation
import CoreMotion
import NaurtSDK

public struct CMWrapper {
    let motion: CMDeviceMotion;
    let timeS: Double;
}


public class MotionWrapper {
    var accel: (Double, Double, Double)?
    var gyro: (Double, Double, Double)?
    var mag: (Double, Double, Double)?
    var timeS: Double?
    
    public init() {
        self.accel = nil;
        self.gyro = nil;
        self.mag = nil;
        self.timeS = nil;
    }
    
    fileprivate func addMotion(motion: CMDeviceMotion, timeS: Double) {
        self.accel = (motion.userAcceleration.x, motion.userAcceleration.y, motion.userAcceleration.z);
        self.gyro = (motion.rotationRate.x, motion.rotationRate.y, motion.rotationRate.z);
        self.timeS = timeS;
    }
    
    fileprivate func addMag(mag: CMMagnetometerData, timeS: Double) {
        self.mag = (mag.magneticField.x, mag.magneticField.y, mag.magneticField.z);
        self.timeS = timeS;
    }
    
    public func isReady() -> Bool {
        return self.timeS != nil && self.gyro != nil && self.accel != nil && self.mag != nil;
    }
    
    fileprivate func reset() {
        self.mag = nil;
        self.accel = nil;
        self.gyro = nil;
        self.timeS = nil;
    }
    
    public func toString() -> String {
        
        let nan: String = "nan,nan,nan";
        let t: String = {
            if let t = self.timeS {
                return "\(t)";
            } else {
                return "nan"
            }
        }();
        
        let a: String = {
            if let a = self.accel {
                return "\(a.0),\(a.1),\(a.2)";
            } else {
                return nan;
            }
        }();
        
        let g: String = {
            if let g = self.gyro {
                return "\(g.0),\(g.1),\(g.2)";
            } else {
                return nan;
            }
        }();
        
        let m: String = {
            if let m = self.mag {
                return "\(m.0),\(m.1),\(m.2)"
            } else {
                return nan;
            }
        }();
        
        let out = "\(t),\(a),\(g),\(m)\n";
        
        return out;
    }
    
    public func asStruct() -> NaurtSDK.MotionContainer? {
        if self.isReady() {
            return NaurtSDK.MotionContainer(accel: self.accel!, gyro: self.gyro!, mag: self.mag!, timeS: self.timeS!);
        } else {
            return nil;
        }
    }
}

public class SensorSerivce: SensorServiceDelegate {
    public var user: NaurtSDK.SensorServiceUser? = nil;
    
    let sensorManager: CMMotionManager;
    var sensorData: MotionWrapper;
    let deviceMotionUpdateInterval: Double = 0.2;
    
    init() {
        self.sensorManager = CMMotionManager();
        self.sensorData = MotionWrapper();
        
        self.sensorManager.showsDeviceMovementDisplay = true;
        
        if !self.sensorManager.isMagnetometerAvailable {
            fatalError("NO Mag");
        }
    }
    
    public func startUpdatingSensors() {
        self.sensorManager.deviceMotionUpdateInterval = self.deviceMotionUpdateInterval;
        self.sensorManager.magnetometerUpdateInterval = self.deviceMotionUpdateInterval;
        sensorManager.startDeviceMotionUpdates(to: .main) { (data, error) in
            guard data != nil, error == nil else {
                return;
            }
            self.sensorData.addMotion(motion: data!, timeS: NSDate().timeIntervalSince1970);
            self.shouldNotifyDidUpdateSensor();
        };
        
        sensorManager.startMagnetometerUpdates(to: .main) {(data, error) in
            guard data != nil, error == nil else {
                return;
            }
            self.sensorData.addMag(mag: data!, timeS: NSDate().timeIntervalSince1970);
            self.shouldNotifyDidUpdateSensor();
        }
    }
    
    public func stopUpdatingSensors() {
        self.sensorManager.stopDeviceMotionUpdates();
        self.sensorManager.stopMagnetometerUpdates();
    }
    
    private func shouldNotifyDidUpdateSensor() {
        if self.sensorData.isReady() {
            self.notifyDidUpdateSensor();
        }
    }
    
    public func cleanseSensors() {
        self.sensorData.reset();
    }
    
    public func isReady() -> Bool {
        return self.sensorData.isReady();
    }
    
    public func notifyDidUpdateSensor() {
            NotificationCenter.default.post(name: Notification.Name(rawValue: "didUpdateSensor"), object: nil);
        }
}



