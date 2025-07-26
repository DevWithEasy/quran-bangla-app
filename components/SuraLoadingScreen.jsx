import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SuraLoadingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size={148} color="#138d75" style={styles.loadingText}/>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: 150,
    height: 150,
    position : 'relative',
  },
  image: {
    width: 150,
    height: 150,
  },
  loadingText: {
    position: 'absolute'
  },
});
