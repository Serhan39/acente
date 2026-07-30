import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SettingsHomeScreen } from "../screens/settings/SettingsHomeScreen";
import { CashAccountsListScreen } from "../screens/settings/CashAccountsListScreen";
import { CashAccountFormScreen } from "../screens/settings/CashAccountFormScreen";
import { CategoriesScreen } from "../screens/settings/CategoriesScreen";
import { SettingsStackParamList } from "./types";
import { stackScreenOptions } from "./stackScreenOptions";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="SettingsHome" component={SettingsHomeScreen} options={{ title: "Ayarlar" }} />
      <Stack.Screen name="CashAccounts" component={CashAccountsListScreen} options={{ title: "Kasa / Banka" }} />
      <Stack.Screen name="CashAccountForm" component={CashAccountFormScreen} options={{ title: "Hesap" }} />
      <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: "Kategoriler" }} />
    </Stack.Navigator>
  );
}
