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
          padding: 8,
        }}
      >
        <Ionicons
          name="chevron-back-outline"
          size={24}
          onPress={() => router.back()}
          color= "#138d75"
        />
        <Text
          style={{ fontSize: 18, fontFamily: "banglaRegular", color: "#138d75" }}
        >
          {name}
        </Text>
        <Ionicons
          name="settings-outline"
          size={22}
          onPress={() => router.push("/settings")}
          color= "#138d75"
        />
      </View>
  )
}