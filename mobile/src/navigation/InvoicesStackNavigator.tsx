import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { InvoicesListScreen } from "../screens/invoices/InvoicesListScreen";
import { InvoiceFormScreen } from "../screens/invoices/InvoiceFormScreen";
import { InvoiceDetailScreen } from "../screens/invoices/InvoiceDetailScreen";
import { InvoicesStackParamList } from "./types";
import { stackScreenOptions } from "./stackScreenOptions";

const Stack = createNativeStackNavigator<InvoicesStackParamList>();

export function InvoicesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="InvoicesList" component={InvoicesListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="InvoiceForm" component={InvoiceFormScreen} options={{ title: "Yeni Fatura" }} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: "" }} />
    </Stack.Navigator>
  );
}
