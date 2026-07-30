import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { DashboardStackParamList } from "./types";
import { stackScreenOptions } from "./stackScreenOptions";

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: "Özet" }} />
    </Stack.Navigator>
  );
}
