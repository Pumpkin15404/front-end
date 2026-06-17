import { Dimensions, ScaledSize } from 'react-native';

const { width, height } = Dimensions.get('window');

export const screen: ScaledSize = { width, height, scale: 1, fontScale: 1 };

export function wp(percent: number): number {
  return (width * percent) / 100;
}

export function hp(percent: number): number {
  return (height * percent) / 100;
}

export const isSmallDevice = width < 375;
