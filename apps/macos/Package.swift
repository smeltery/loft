// swift-tools-version: 6.0
import PackageDescription

let package = Package(
  name: "Loft",
  platforms: [.macOS(.v14)],
  products: [
    .library(name: "LoftKit", targets: ["LoftKit"]),
    .executable(name: "Loft", targets: ["LoftApp"]),
    .executable(name: "LoftKitCheck", targets: ["LoftKitCheck"]),
  ],
  targets: [
    .target(name: "LoftKit"),
    .executableTarget(name: "LoftApp", dependencies: ["LoftKit"]),
    .executableTarget(name: "LoftKitCheck", dependencies: ["LoftKit"]),
  ]
)
