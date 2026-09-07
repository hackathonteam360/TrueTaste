const { withStringsXml, AndroidConfig } = require('@expo/config-plugins');

module.exports = function withGoogleAndroidClientId(config) {
  return withStringsXml(config, (config) => {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
    if (!clientId) {
      return config;
    }
    config.modResults = AndroidConfig.Strings.setStringItem(
      [{ $: { name: 'default_web_client_id' }, _: clientId }],
      config.modResults,
    );
    return config;
  });
};
