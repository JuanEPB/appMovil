import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import {LoginScreen} from "../screens/LoginScreen";
import {DashboardScreen} from "../screens/DashboardScreen";
import {TabNavigator} from "./TabNavigator";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const { isLogged } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLogged ? (
        <Stack.Screen name="Home" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
