import "react-native-get-random-values";
import "react-native-reanimated";
import { LogBox } from "react-native";
import "./global.css";
import "expo-router/entry";
LogBox.ignoreLogs(["Expo AV has been deprecated", "Disconnected from Metro"]);

// Global crash handler — logs JS errors to console so they appear in
// Xcode Organizer / TestFlight crash reports for Build 3+
if (typeof ErrorUtils !== "undefined") {
  const previousHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    console.error(`[LunaFlow] ${isFatal ? "FATAL" : "ERROR"}: ${error?.message}`, error?.stack);
    previousHandler(error, isFatal);
  });
}
