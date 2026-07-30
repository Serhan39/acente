import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TransactionsListScreen } from "../screens/transactions/TransactionsListScreen";
import { TransactionFormScreen } from "../screens/transactions/TransactionFormScreen";
import { TransactionsStackParamList } from "./types";
import { stackScreenOptions } from "./stackScreenOptions";

const Stack = createNativeStackNavigator<TransactionsStackParamList>();

export function TransactionsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="TransactionsList" component={TransactionsListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TransactionForm" component={TransactionFormScreen} options={{ title: "Yeni İşlem" }} />
    </Stack.Navigator>
  );
}
