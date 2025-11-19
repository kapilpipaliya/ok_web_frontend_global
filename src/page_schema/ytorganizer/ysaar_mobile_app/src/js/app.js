import { SplashScreen } from "@capacitor/splash-screen";

// Hide splash screen when page loads
window.addEventListener("load", async () => {
  await SplashScreen.hide();
});
