import NetInfo from '@react-native-community/netinfo';

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

export const OFFLINE_MESSAGE =
  'Không có kết nối internet, vui lòng thử lại';
