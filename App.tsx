import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_600SemiBold_Italic,
  PlayfairDisplay_800ExtraBold,
  PlayfairDisplay_800ExtraBold_Italic,
  PlayfairDisplay_900Black,
  PlayfairDisplay_900Black_Italic,
} from '@expo-google-fonts/playfair-display';
import { CrimsonPro_400Regular, CrimsonPro_400Regular_Italic, CrimsonPro_600SemiBold } from '@expo-google-fonts/crimson-pro';
import { DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import GameScreen from './src/screens/GameScreen';
import { LogoScreen } from './src/ui/LogoScreen';

// Keep the native launch screen until the in-app logo (same tile, same place) is on screen.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_600SemiBold_Italic,
    PlayfairDisplay_800ExtraBold,
    PlayfairDisplay_800ExtraBold_Italic,
    PlayfairDisplay_900Black,
    PlayfairDisplay_900Black_Italic,
    CrimsonPro_400Regular,
    CrimsonPro_400Regular_Italic,
    CrimsonPro_600SemiBold,
    DMSans_500Medium,
    DMSans_700Bold,
    Caveat_700Bold,
  });
  // A font that fails to load must never keep the game off the screen.
  const loaded = fontsLoaded || !!fontError;
  useEffect(() => {
    if (fontError) console.warn('Swatter: fonts failed to load', fontError.message);
  }, [fontError]);
  const [logoDone, setLogoDone] = useState(false);
  const finishLogo = useCallback(() => setLogoDone(true), []);

  return (
    <>
      {loaded && <GameScreen />}
      {!logoDone && <LogoScreen fontsReady={loaded} onDone={finishLogo} />}
      <StatusBar style="light" />
    </>
  );
}
