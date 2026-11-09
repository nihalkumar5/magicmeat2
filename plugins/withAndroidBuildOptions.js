const {
  withAppBuildGradle,
  withGradleProperties,
  withSettingsGradle,
} = require('@expo/config-plugins');

const nodeExecutable = process.env.MAGICMEAT_NODE_PATH || process.execPath;

module.exports = function withAndroidBuildOptions(config) {
  config = withGradleProperties(config, (gradleConfig) => {
    const properties = gradleConfig.modResults;

    const setProperty = (key, value) => {
      const existing = properties.find(
        (property) => property.type === 'property' && property.key === key,
      );

      if (existing) {
        existing.value = value;
      } else {
        properties.push({ type: 'property', key, value });
      }
    };

    setProperty('reactNativeArchitectures', 'arm64-v8a');
    setProperty('expoNodeExecutable', nodeExecutable);

    return gradleConfig;
  });

  config = withSettingsGradle(config, (gradleConfig) => {
    let contents = gradleConfig.modResults.contents;

    contents = contents.replace(
      'pluginManagement {\n',
      'pluginManagement {\n  def nodeExecutable = providers.gradleProperty("expoNodeExecutable").getOrElse("node")\n',
    );

    contents = contents.replaceAll('commandLine("node",', 'commandLine(nodeExecutable,');
    gradleConfig.modResults.contents = contents;
    return gradleConfig;
  });

  config = withAppBuildGradle(config, (gradleConfig) => {
    let contents = gradleConfig.modResults.contents;

    if (!contents.includes('def nodeExecutable =')) {
      contents = contents.replace(
        'def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()\n',
        'def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()\ndef nodeExecutable = findProperty(\'expoNodeExecutable\') ?: \'node\'\n',
      );
    }

    contents = contents
      .replaceAll('["node",', '[nodeExecutable,')
      .replace('// nodeExecutableAndArgs = ["node"]', 'nodeExecutableAndArgs = [nodeExecutable]');

    gradleConfig.modResults.contents = contents;
    return gradleConfig;
  });

  return config;
};
