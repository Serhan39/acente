import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { colors } from "../theme/theme";

export const stackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: "700" },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};
