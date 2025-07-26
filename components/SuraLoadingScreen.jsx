import { Image, StyleSheet, Text, View } from 'react-native';

export default function SuraLoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.titleView}>
          <Text style={styles.title}>কুরআন বাংলা</Text>
          <Text style={styles.subTitle}>উচ্চারণ, বাংলা ও ইংরেজি অনুবাদ, অডিও সূরা</Text>
        </View>
        
      </View>
    </View>
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
    position : 'relative',
  },
  image: {
    width: 150,
    height: 150,
  },
  titleView: {
    position: 'absolute',
    bottom : -65,
    flexDirection : 'column',
    alignItems : 'center',
    justifyContent : 'center'
  },
  title: {
    fontFamily : 'banglaSemiBold',
    fontSize : 30,
    color: '#138d75',
  },
  subTitle: {
    fontFamily : 'banglaRegular',
    color: '#6a6d6cff',
  },
});
