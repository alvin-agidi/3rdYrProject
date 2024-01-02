import React, { Component } from "react";
import { View, Text, StyleSheet, Image } from "react-native";

class Project extends Component {
  render() {
    return (
      <View>
        <Text>Testing</Text>
        <Image
          style={{
            height: 50,
            width: 50,
          }}
          source={{
            uri: "https://cdn.sstatic.net/Img/home/illo-public.svg?v=14bd5a506009",
          }}
        />
      </View>
    );
  }
}

export default Project;
