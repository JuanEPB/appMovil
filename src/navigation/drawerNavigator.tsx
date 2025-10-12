import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {DashboardScreen} from "../screens/DashboardScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { DocumentsScreen } from "../screens/DocumentsScreen";
import { Sidebar } from "../components/Sidebar";
import { MedicamentosScreen } from "../screens/MedicamentosScreen";
import { FormMedicament } from "../screens/FormMedicament";
import { CalendarScreen } from "../screens/CalendarScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";

export type RootDrawerParamList = {
  Dashboard: undefined;
  Documents: undefined;
  Chat: undefined;
  Profile: undefined;
  Settings: undefined;
  Medicamentos: undefined;
  FormMedicament: undefined;
  Calendar: undefined;
  EditUser: undefined;
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#1A237E",
        headerTitleAlign: "center",
      }}
      drawerContent={(props) => <Sidebar {...props} />}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Documents" component={DocumentsScreen} />
      <Drawer.Screen
          name="Calendar"
          component={CalendarScreen}
         
        />

      <Drawer.Screen
        name="Chat"
        component={ChatScreen}
       
      />

      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name= "EditUser" component={EditProfileScreen}/>
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Medicamentos" component={MedicamentosScreen} />
      <Drawer.Screen name="FormMedicament" component={FormMedicament}/>

    </Drawer.Navigator>
  );
};
