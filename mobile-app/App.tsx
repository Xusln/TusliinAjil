import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/appNavigator';  // доор үүсгэнэ

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}