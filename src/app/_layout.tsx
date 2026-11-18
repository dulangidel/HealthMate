import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button } from '@/core/components/Button';
import { useAppBootstrap } from '@/core/hooks/useAppBootstrap';
import { colors, spacing, typography } from '@/core/theme/theme';

export default function RootLayout() {
  const { ready, error, retry } = useAppBootstrap();

  if (!ready) {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>💚 HealthMate</Text>
        {error ? (
          <>
            <Text style={styles.error}>Could not start the app: {error}</Text>
            <Button title="Try again" onPress={retry} />
          </>
        ) : (
          <ActivityIndicator color={colors.primary} />
        )}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: '700' },
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerBackTitle: 'Back',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="record/new" options={{ title: 'Add Record', presentation: 'modal' }} />
        <Stack.Screen name="record/[id]" options={{ title: 'Edit Record' }} />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  logo: { ...typography.title },
  error: { color: colors.danger, textAlign: 'center' },
});
