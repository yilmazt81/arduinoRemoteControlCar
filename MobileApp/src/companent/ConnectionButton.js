/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import LottieView from 'lottie-react-native';
import {random} from 'lodash';
import {TouchableOpacity} from 'react-native';

const buttons = {
  connect: require('../shared/json/btn-connect.json'),
  disconnect: require('../shared/json/btn-disconnected.json'),
};

const REVERT_FRAME = 18;
const MAX_FRAME = 29;

export class ConnectionButton extends React.Component {
  onPressIn = () => {
    //console.log('#2');
    const {onPressIn, keyCode} = this.props;
    if (onPressIn) {
      onPressIn(keyCode);
    }
    // this.ref.play(MAX_FRAME, REVERT_FRAME);
  };

  componentDidMount() {
    setTimeout(() => {
      this.ref.play();
    }, random(200, 900));
  }

  onPressOut = () => {
    const {onPressOut, keyCode} = this.props;
    if (onPressOut) {
      onPressOut(keyCode);
    }
  };

  fadeOut = () => {
    this.ref.play(MAX_FRAME, 0);
  };

  fadeIn = () => {
    this.ref.play(0, MAX_FRAME);
  };

  onPress = () => {
    const {onPress, keyCode} = this.props;
    if (onPress) {
      onPress(keyCode);
    }
    setTimeout(() => {
      this.ref.reset();
      this.ref.play(REVERT_FRAME, MAX_FRAME);
    }, 200);
  };

  get source() {
    const {keyCode} = this.props;
    if (keyCode && buttons[keyCode]) {
      return buttons[keyCode];
    }
    return buttons.default;
  }

  onBlur = () => {
    // eslint-disable-next-line no-alert
    alert('yay!');
  };

  render() {
    return (
      <TouchableOpacity
        style={{
          flex: 1,
        }}
        activeOpacity={1}
        onPressIn={this.onPressIn}
        onPressOut={this.onPressOut}
        onPress={this.onPress}
        onBlur={this.onBlur}>
        <LottieView
          style={{width: 50, height: 50}}
          loop={false}
          speed={3}
          source={this.source}
          ref={animation => {
            this.ref = animation;
          }}
        />
      </TouchableOpacity>
    );
  }
}
