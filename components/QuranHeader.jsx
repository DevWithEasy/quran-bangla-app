import { View, Text } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function QuranHeader({name}) {
    const router = useRouter()
  return (
    <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 8,
          paddingVertical: 16,
          backgroundColor : '#138d75',
          elevation : 1
        }}
      >
        <Ionicons
          name="chevron-back-outline"
          size={24}
          onPress={() => router.back()}
          color= "#ffffff"
        />
        <Text
          style={{ fontSize: 18, fontFamily: "banglaRegular", color: "#ffffff" }}
        >
          {name}
        </Text>
        <Ionicons
          name="settings-outline"
          size={22}
          onPress={() => router.push("/settings")}
          color= "#ffffff"
        />
      </View>
  )
}