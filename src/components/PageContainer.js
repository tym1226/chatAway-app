import { StyleSheet, View } from "react-native";

const PageContainer = ({ children }) => {
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    flex: 1,
  },
});

export default PageContainer;
