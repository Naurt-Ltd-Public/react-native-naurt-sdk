require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))


Pod::Spec.new do |s|
  s.name         = "react-native-naurt-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "13.4" }
  s.source       = { :git => "https://github.com/Naurt-Ltd-Public/react-native-naurt-sdk.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"

  s.dependency "React"

  s.dependency 'Naurt.swift', "0.1.2"

  s.swift_version = '5.0'
end

