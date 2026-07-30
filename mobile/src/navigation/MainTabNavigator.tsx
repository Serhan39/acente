import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { DashboardStackNavigator } from "./DashboardStackNavigator";
import { TransactionsStackNavigator } from "./TransactionsStackNavigator";
import { AccountsStackNavigator } from "./AccountsStackNavigator";
import { InvoicesStackNavigator } from "./InvoicesStackNavigator";
import { SettingsStackNavigator } from "./SettingsStackNavigator";
import { MainTabParamList } from "./types";
import { colors } from "../theme/theme";

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  DashboardTab: "home",
  TransactionsTab: "swap-horizontal",
  AccountsTab: "people",
  InvoicesTab: "document-text",
  SettingsTab: "settings",
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name as keyof MainTabParamList]} color={color} size={size - 4} />
        ),
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStackNavigator} options={{ title: "Özet" }} />
      <Tab.Screen name="TransactionsTab" component={TransactionsStackNavigator} options={{ title: "Gelir/Gider" }} />
      <Tab.Screen name="AccountsTab" component={AccountsStackNavigator} options={{ title: "Cari" }} />
      <Tab.Screen name="InvoicesTab" component={InvoicesStackNavigator} options={{ title: "Faturalar" }} />
      <Tab.Screen name="SettingsTab" component={SettingsStackNavigator} options={{ title: "Ayarlar" }} />
    </Tab.Navigator>
  );
}
