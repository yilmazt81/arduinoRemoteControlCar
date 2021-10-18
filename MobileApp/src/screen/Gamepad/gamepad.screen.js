/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {magnetometer} from 'react-native-sensors';
import {NavigationEvents} from 'react-navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import {random} from 'lodash';
import {TouchableOpacity, SafeAreaView, Text, View} from 'react-native';
import {map, auditTime} from 'rxjs/operators';

import {Store} from '../../services/store';
import {GamepadButton} from '../../companent/GamepadButton';
import {ConnectionButton} from '../../companent/ConnectionButton';
import {Buffer} from 'buffer';
import MQTT from 'sp-react-native-mqtt';
import DeviceInfo from 'react-native-device-info';

global.Buffer = Buffer;

/*import {screen, connect} from '../shared/shared.helper.js';
import {ScreenInfo} from '../../src/services/screen-info';
*/
import {styles} from './gamepad.styles';
/*
@screen()
@connect({
  screen: ScreenInfo,
})*/
class GamepadScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
    //headerMode: null,
    //headerBackTitleVisible: false,
  };
  // holds each button lottie refereneces
  keysRef = {};
  constructor(props) {
    super(props);

    this.state = {
      angel: 0,
      speed: 40,
      mqttConnectionState: false,
      magnetometer: 'Not connected',
      mqttClient: null,
    };
  }

  componentDidMount() {
    this.onMqttConnect();
    /*this.subscription = magnetometer.pipe(
      auditTime(500),
      map(e => ({
        x: e.x.toFixed(0),
        y: e.y.toFixed(0),
      })),
    );*/
  }
  componentWillUnmount() {
    /*if (this.subscription) {
      this.subscription.unsubscribe();
    }*/
  }

  operateOnce = (field, t, callback) => {
    this.setState(state => {
      const value = t(state[field]);
      if (callback) {
        callback(value);
      }
      return {
        [field]: value,
      };
    });
  };

  onMqttConnect() {
    var uniqueId = DeviceInfo.getUniqueId();
    console.log(uniqueId);
    var clientId = 'Mobile_' + uniqueId;
    MQTT.createClient({uri: 'mqtt://192.168.0.100:1883', clientId: clientId})
      .then(client => {
        this.setState({mqttClient: client});

        client.on('closed', function () {
          console.log('mqtt.event.closed');
        });
        client.on('connect', function () {
          console.log('mqtt.event.connected');
        });
      })
      .catch(err => {
        console.error(`MQTT.createtClient error: ${err}`);
      });
  }
  onMessageDelivered(message) {
    console.log(message);
  }
  onMessageArrived(message) {
    console.log(message);
  }
  builtinConnect() {
    if (this.state.mqttConnectionState) {
      this.setState({mqttConnectionState: false});
      this.state.mqttClient.disconnect();
    } else {
      this.state.mqttClient.connect();
      this.setState({mqttConnectionState: true});
    }
  }
  buttonClickAction(command) {
    if (this.state.mqttConnectionState) {
      this.state.mqttClient.publish('/Command', command, 0, false);
    }
  }
  operateValue = (field, t, callback) => {
    this['interval_' + field] = setInterval(() => {
      this.operateOnce(field, t, callback);
    }, 100);
  };

  unoperate = field => {
    if (this['interval_' + field]) {
      clearInterval(this['interval_' + field]);
    }
  };

  btnRefs = {};

  Actions() {
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        <GamepadButton
          onPress={() => this.buttonClickAction('Stop')}
          //onPressOut={() => this.unoperate('speed')}
          keyCode="triangle"
          ref={ref => (this.btnRefs.triangle = ref)}
        />
        <View style={{flex: 1, flexDirection: 'row'}}>
          <GamepadButton
            ref={ref => (this.btnRefs.rectangle = ref)}
            onPress={() => this.buttonClickAction('rectangle')}
            keyCode="rectangle"
          />
          <GamepadButton
            ref={ref => (this.btnRefs.circle = ref)}
            onPress={() => this.buttonClickAction('Stop')}
            keyCode="circle"
          />
        </View>
        <GamepadButton
          keyCode="cross"
          ref={ref => (this.btnRefs.cross = ref)}
          onPressIn={() => this.buttonClickAction('cross')}
          //onPressOut={() => this.unoperate('speed')}
        />
      </View>
    );
  }

  Axis() {
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        <GamepadButton
          keyCode="up"
          ref={ref => (this.btnRefs.up = ref)}
          onPress={() => this.buttonClickAction('up')}
        />
        <View style={{flex: 1, flexDirection: 'row'}}>
          <GamepadButton
            ref={ref => (this.btnRefs.left = ref)}
            keyCode="left"
            //onPressIn={this.decreaseAngel}
            onPress={() => this.buttonClickAction('left')}
            //onPressOut={() => this.unoperate('angel')}
          />
          <GamepadButton
            keyCode="right"
            //onPressIn={this.increaseAngel}
            ref={ref => (this.btnRefs.right = ref)}
            onPress={() => this.buttonClickAction('right')}
            //onPressOut={() => this.unoperate('angel')}
          />
        </View>
        <GamepadButton
          keyCode="down"
          ref={ref => (this.btnRefs.down = ref)}
          onPress={() => this.buttonClickAction('down')}
        />
      </View>
    );
  }

  infoLabel(label, value) {
    return (
      <View style={{}}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.labelValue}>{value}</Text>
      </View>
    );
  }

  InfoPanel() {
    const {speed, angel} = this.state;
    const {x, y} = this.state.magnetometer || {x: 0, y: 0};
    //const {isPortrait} = this.props.store.screen;
    const isPortrait = false;
    const flexDirection = isPortrait === true ? 'row' : 'column';
    //const flexDirection = 'row';
    return (
      <View
        style={[
          {
            minWidth: 50,
            opacity: 0.7,
            backgroundColor: 'white',
            borderRightWidth: 1,
            borderRightColor: 'silver',
            borderLeftWidth: 1,
            borderLeftColor: 'silver',
            flexDirection,
            justifyContent: 'space-between',
          },
          isPortrait
            ? {
                borderLeftWidth: 0,
                borderRightWidth: 0,
                borderTopWidth: 1,
                borderTopColor: 'silver',
                borderBottomWidth: 1,
                borderBottomColor: 'silver',
                padding: 5,
              }
            : null,
        ]}>
        <ConnectionButton
          keyCode={!this.state.mqttConnectionState ? 'connect' : 'disconnect'}
          onPress={() => this.builtinConnect()}
          ref={ref => (this.btnRefs.up = ref)}
        />
        {this.infoLabel('Speed', speed)}
        {this.infoLabel('Angel', angel)}
        {this.infoLabel('G-X', x)}
        {this.infoLabel('G-Y', y)}

        <TouchableOpacity
          onPress={this.settings}
          style={{alignSelf: 'center', marginTop: 20}}>
          <Icon name={'md-cog'} size={45} color="black" />
        </TouchableOpacity>
      </View>
    );
  }
  fadeGamepadButton = (type = 'out') => {
    const keys = Object.keys(this.btnRefs);
    for (let key of keys) {
      setTimeout(
        this.btnRefs[key][type === 'out' ? 'fadeOut' : 'fadeIn'],
        random(100, 500),
      );
    }
  };

  settings = () => {
    this.fadeGamepadButton();
    setTimeout(() => {
      //Store.navigation.navigate('Profile');
    }, 1000);
  };

  onDidFocus = () => {
    this.fadeGamepadButton('in');
  };

  render() {
    /* const flexDirection =
      this.props.store.screen.isPortrait === false ? 'row' : 'column';
      */
    const flexDirection = 'row';
    return (
      <View style={{backgroundColor: '#333333', flex: 1}}>
        <NavigationEvents onDidFocus={this.onDidFocus} />

        <SafeAreaView style={[styles.container, {flexDirection}]}>
          {this.InfoPanel()}

          <View style={{marginVertical: 30, flex: 1, flexDirection}}>
            {this.Axis()}
            {this.Actions()}
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

export default GamepadScreen;
