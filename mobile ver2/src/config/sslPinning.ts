/**
 * SSL Pinning configuration placeholder.
 *
 * Expo Go does not support certificate pinning. Enable this only after
 * `expo prebuild` with a native module such as `react-native-ssl-pinning`
 * or `@bam.tech/react-native-app-security`.
 */
export const sslPinningConfig = {
  enabled: false,
  /**
   * Example:
   * hostnames: [{ hostname: 'api.moneyhabits.app', publicKeyHashes: ['sha256/...'] }]
   */
  hostnames: [] as Array<{ hostname: string; publicKeyHashes: string[] }>,
};

export function isSslPinningEnabled(): boolean {
  return sslPinningConfig.enabled && sslPinningConfig.hostnames.length > 0;
}
