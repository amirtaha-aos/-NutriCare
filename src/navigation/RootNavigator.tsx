import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MainNavigator } from './MainNavigator';
import ChatScreen from '../screens/chat/ChatScreen';
import VoiceChatScreen from '../screens/chat/VoiceChatScreen';

const Stack = createStackNavigator();

export const RootNavigator: React.FC = () => {
  // BYPASS AUTH - Go directly to main app
  // TODO: Re-enable authentication before production release

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="VoiceChat"
          component={VoiceChatScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
