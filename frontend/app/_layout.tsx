import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { Platform, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { SimpleThemeProvider, useSimpleTheme } from "../context/SimpleTheme";
import { ThemeProvider } from "../context/ThemeContext";
import MessageOverlay from "../components/MessageOverlay";

function RootLayoutInner() {
  const { T } = useSimpleTheme();
  const router = useRouter();

  // Every notification (task reminder or daily summary) should land on
  // Today, regardless of what screen was open when it fired or whether the
  // app was foregrounded, backgrounded, or fully closed. The response
  // listener covers the first two; getLastNotificationResponseAsync covers
  // a cold start, since a tap that already happened before this listener
  // was registered would otherwise be missed.
  useEffect(() => {
    // expo-notifications' response APIs aren't implemented on web at all —
    // calling them there throws, not just no-ops.
    if (Platform.OS === "web") return;

    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.replace("/");
    });
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) router.replace("/");
    });
    return () => sub.remove();
  }, [router]);

  return (
    // edgeToEdgeEnabled (app.json) makes Android draw the app under the
    // status bar and the system navigation bar. Only the top inset is
    // applied here — the bottom inset is handled by the tab bar itself in
    // (tabs)/_layout.tsx, since that's the component actually sitting at
    // the bottom edge.
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar style={T.statusBar} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: T.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="focus"
          options={{ presentation: "modal" }}
        />
      </Stack>
      {/* Mounted once here so notify()/confirmAsync() (utils/confirm.ts) can
          be called from any screen and still render the app's themed modal
          instead of the OS's native alert/confirm dialog. */}
      <MessageOverlay />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#090909" }} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SimpleThemeProvider>
          <RootLayoutInner />
        </SimpleThemeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
