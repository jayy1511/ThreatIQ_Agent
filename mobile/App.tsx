/**
 * ThreatIQ Mobile App
 * Entry point
 */

import React from "react";
import { StatusBar } from "expo-status-bar";
import { AppNavigator } from "./src/navigation";

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}
