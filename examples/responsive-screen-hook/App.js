// Import necessary packages
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useResponsive } from 'react-native-responsive-hook';

// Define the App component
const App = () => {
  const { styles } = useStyles(); // Use the hook to get styles

  return (
    <View style={styles.container}>
      <View style={styles.responsiveBox}>
        <Text style={styles.text}>Responsive Box - Adjusts based on orientation and screen size.</Text>
      </View>
    </View>
  );
};

// Define the useStyles hook
const useStyles = () => {
  const { isLandscape, isPortrait, wp, hp, fontSize, select } = useResponsive();

  // Utilize the hook values to create dynamic styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isLandscape ? 'lightblue' : 'gray', // Change background color based on orientation
      alignItems: 'center',
      justifyContent: 'center',
    },
    responsiveBox: {
      borderWidth: 2,
      borderColor: 'orange',
      flexDirection: 'column',
      justifyContent: 'space-around',
      width: isPortrait ? wp(85) : wp(50),  // Adjust width based on orientation
      height: hp(17),                       // Adjust height using hp function
      // select() picks a value for the current breakpoint, cascading down
      // to the nearest smaller one that is defined.
      backgroundColor: select({
        xs: 'lightgreen',
        sm: 'lightpink',
        md: 'lightyellow',
        lg: 'lightcoral',
        xl: 'lightskyblue',
        xxl: 'lightsteelblue',
      }),
      padding: select({ xs: 8, md: 16, xl: 32 }),
    },
    text: {
      color: 'white',
      fontSize: fontSize(16), // Scales with the screen and the OS text-size setting
    }
  });

  return {styles};
};

export default App;
