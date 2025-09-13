import React, { useState } from "react";
import { StyleSheet } from "react-native";
import SplashScreen from "./splashScreen"; 
import AddTask from "./addTask"; 

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onSplashComplete={() => setShowSplash(false)} />;
  }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
});