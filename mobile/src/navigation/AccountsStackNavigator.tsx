import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AccountsListScreen } from "../screens/accounts/AccountsListScreen";
import { AccountFormScreen } from "../screens/accounts/AccountFormScreen";
import { AccountDetailScreen } from "../screens/accounts/AccountDetailScreen";
import { AccountsStackParamList } from "./types";
import { stackScreenOptions } from "./stackScreenOptions";

const Stack = createNativeStackNavigator<AccountsStackParamList>();

export function AccountsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="AccountsList" component={AccountsListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AccountForm" component={AccountFormScreen} options={{ title: "Cari Hesap" }} />
      <Stack.Screen name="AccountDetail" component={AccountDetailScreen} options={{ title: "" }} />
    </Stack.Navigator>
  );
}
