import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const FloatingChatButton: React.FC = () => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    // Navigate to Chat screen in root navigator
    // Need to go up through all parent navigators to reach the root
    let rootNav = navigation;
    while (rootNav.getParent()) {
      rootNav = rootNav.getParent();
    }
    rootNav.navigate('Chat');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#4CAF50', '#66BB6A']}
        style={styles.button}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <Icon name="robot" size={28} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingChatButton;
