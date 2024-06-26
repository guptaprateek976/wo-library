import type { Options } from "@storybook/core-webpack";
import type { Configuration } from "webpack";

import { isObject } from "lodash-es";

const CSS_REGEX = String.raw`/\.css$/`;

export function cssModules(
  config: Configuration,
  { configType }: { configType: Options["configType"] },
) {
  if (!config.module?.rules) {
    return config;
  }
  const cssRule = config.module.rules.find(
    (rule) => isObject(rule) && rule.test?.toString() === CSS_REGEX,
  );
  if (!isObject(cssRule)) {
    return config;
  }
  config.module.rules = [
    ...config.module.rules.filter(
      (rule) => isObject(rule) && rule.test?.toString() !== CSS_REGEX,
    ),
    {
      ...cssRule,
      exclude: /\.module\.css$/,
    },
    {
      ...cssRule,
      test: /\.module\.css$/,
      // @ts-expect-error: TS18048 because of the use of `map`
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      use: cssRule.use.map((rule: { loader: string; options: object }) => {
        if (rule.loader && /\Wcss-loader/g.test(rule.loader)) {
          return {
            ...rule,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            options: {
              ...rule.options,
              modules: {
                exportLocalsConvention: "camelCase",
                localIdentName:
                  configType === "DEVELOPMENT"
                    ? "[name]__[local]"
                    : "[hash:base64]",
              },
              sourceMap: configType === "DEVELOPMENT",
            },
          };
        }
        return rule;
      }),
    },
  ];
  return config;
}

export function modulesFullySpecified(config: Configuration) {
  if (!config.module?.rules) {
    return config;
  }
  for (const rule of config.module.rules) {
    if (isObject(rule) && rule.test?.toString().includes("js")) {
      if (rule.resolve) {
        // disables compulsory file extension in import for modules
        rule.resolve.fullySpecified = false;
      } else {
        rule.resolve = { fullySpecified: false };
      }
    }
  }
  return config;
}

export function nodeNextExtensionAlias(config: Configuration) {
  if (!config.resolve) {
    return config;
  }
  config.resolve.extensionAlias = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ".js": [".js", ".jsx", ".ts", ".tsx"],
  };
  return config;
}
