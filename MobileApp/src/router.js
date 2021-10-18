import GamepadScreen from './screen/Gamepad/gamepad.screen';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

const Nav = createStackNavigator(
  {
    Home: {
      screen: GamepadScreen,
    },
  },
  {
    initialRouteName: 'Home',
  },
);
export default createAppContainer(Nav);
