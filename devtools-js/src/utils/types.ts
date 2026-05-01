/**
 * Check if value is a string.
 * Useful for type validation and runtime type checking.
 */
export const isString = (val: any): val is string => typeof val === "string";

/**
 * Check if value is a number.
 * Useful for type validation and runtime type checking.
 */
export const isNumber = (val: any): val is number => typeof val === "number";

/**
 * Check if value is a boolean.
 * Useful for type validation and runtime type checking.
 */
export const isBoolean = (val: any): val is boolean => typeof val === "boolean";

/**
 * Check if value is an array.
 * Useful for type validation and runtime type checking.
 */
export const isArray = <T = any>(val: any): val is T[] => Array.isArray(val);

/**
 * Check if value is an object.
 * Useful for type validation and runtime type checking.
 */
export const isObject = (val: any): val is object =>
  val != null && typeof val === "object" && !Array.isArray(val);

/**
 * Check if value is null.
 * Useful for type validation and runtime type checking.
 */
export const isNull = (val: any): val is null => val === null;

/**
 * Check if value is undefined.
 * Useful for type validation and runtime type checking.
 */
export const isUndefined = (val: any): val is undefined => val === undefined;

/**
 * Check if value is null or undefined.
 * Useful for type validation and runtime type checking.
 */
export const isNil = (val: any): val is null | undefined => val == null;

/**
 * Check if value is a function.
 * Useful for type validation and runtime type checking.
 */
export const isFunction = (val: any): val is Function => typeof val === "function";

/**
 * Check if value is a date.
 * Useful for type validation and runtime type checking.
 */
export const isDate = (val: any): val is Date => val instanceof Date;

/**
 * Check if value is a regular expression.
 * Useful for type validation and runtime type checking.
 */
export const isRegExp = (val: any): val is RegExp => val instanceof RegExp;

/**
 * Check if value is a symbol.
 * Useful for type validation and runtime type checking.
 */
export const isSymbol = (val: any): val is symbol => typeof val === "symbol";

/**
 * Check if value is a primitive (string, number, boolean, null, undefined, symbol).
 * Useful for type validation and runtime type checking.
 */
export const isPrimitive = (val: any): val is string | number | boolean | null | undefined | symbol =>
  val === null ||
  typeof val === "string" ||
  typeof val === "number" ||
  typeof val === "boolean" ||
  typeof val === "symbol" ||
  typeof val === "undefined";

/**
 * Check if value is a valid email address.
 * Useful for form validation and data validation.
 */
export const isEmail = (val: any): val is string =>
  isString(val) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

/**
 * Check if value is a valid URL.
 * Useful for form validation and data validation.
 */
export const isUrl = (val: any): val is string =>
  isString(val) && /^https?:\/\/.+\..+$/.test(val);

/**
 * Check if value is a valid phone number.
 * Useful for form validation and data validation.
 */
export const isPhone = (val: any): val is string =>
  isString(val) && /^[+?\d\s()-]{10,}$/.test(val);

/**
 * Check if value is a valid credit card number.
 * Useful for form validation and data validation.
 */
export const isCreditCard = (val: any): val is string =>
  isString(val) && /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(val.replace(/\s/g, ""));

/**
 * Check if value is a valid IP address (IPv4).
 * Useful for form validation and data validation.
 */
export const isIP = (val: any): val is string =>
  isString(val) && /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(val);

/**
 * Check if value is a valid IPv6 address.
 * Useful for form validation and data validation.
 */
export const isIPv6 = (val: any): val is string =>
  isString(val) && /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(val);

/**
 * Check if value is a valid hex color.
 * Useful for form validation and data validation.
 */
export const isHexColor = (val: any): val is string =>
  isString(val) && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val);

/**
 * Check if value is a valid RGB color.
 * Useful for form validation and data validation.
 */
export const isRgbColor = (val: any): val is string =>
  isString(val) && /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/.test(val);

/**
 * Check if value is a valid HSL color.
 * Useful for form validation and data validation.
 */
export const isHslColor = (val: any): val is string =>
  isString(val) && /^hsl\((\d{1,3}),\s*(\d{1,3}%),\s*(\d{1,3}%)\)$/.test(val);

/**
 * Check if value is a valid CSS color.
 * Useful for form validation and data validation.
 */
export const isColor = (val: any): val is string =>
  isHexColor(val) || isRgbColor(val) || isHslColor(val);

/**
 * Check if value is a valid credit card number (Luhn algorithm).
 * Useful for form validation and data validation.
 */
export const isCreditCardLuhn = (val: any): val is string => {
  if (!isCreditCard(val)) return false;
  
  const digits = val.replace(/\D/g, "");
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Check if value is a valid UUID.
 * Useful for form validation and data validation.
 */
export const isUuid = (val: any): val is string =>
  isString(val) && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

/**
 * Check if value is a valid ISBN-10 or ISBN-13.
 * Useful for form validation and data validation.
 */
export const isIsbn = (val: any): val is string => {
  if (!isString(val)) return false;

  const isbn = val.replace(/[-\s]/g, "");

  if (isbn.length === 10) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbn[i], 10) * (10 - i);
    }
    const check = sum % 11;
    const checkDigit = check === 0 ? 0 : 11 - check;
    return checkDigit === parseInt(isbn[9], 10);
  } else if (isbn.length === 13) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(isbn[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const check = sum % 10;
    const checkDigit = check === 0 ? 0 : 10 - check;
    return checkDigit === parseInt(isbn[12], 10);
  }

  return false;
};

/**
 * Check if value is a valid postal code (US ZIP code).
 * Useful for form validation and data validation.
 */
export const isPostalCode = (val: any): val is string =>
  isString(val) && /^\d{5}(-\d{4})?$/.test(val);

/**
 * Check if value is a valid social security number (US).
 * Useful for form validation and data validation.
 */
export const isSsn = (val: any): val is string =>
  isString(val) && /^\d{3}-\d{2}-\d{4}$/.test(val);

/**
 * Check if value is a valid username (alphanumeric with underscores, 3-20 characters).
 * Useful for form validation and data validation.
 */
export const isUsername = (val: any): val is string =>
  isString(val) && /^[a-zA-Z0-9_]{3,20}$/.test(val);

/**
 * Check if value is a valid password (at least 8 characters, with uppercase, lowercase, number, and special character).
 * Useful for form validation and data validation.
 */
export const isPassword = (val: any): val is string =>
  isString(val) && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(val);

/**
 * Check if value is a valid JWT token.
 * Useful for authentication and data validation.
 */
export const isJwt = (val: any): val is string =>
  isString(val) && /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(val);

/**
 * Check if value is a valid MongoDB ObjectId.
 * Useful for database operations and data validation.
 */
export const isObjectId = (val: any): val is string =>
  isString(val) && /^[0-9a-fA-F]{24}$/.test(val);

/**
 * Check if value is a valid base64 string.
 * Useful for data encoding and validation.
 */
export const isBase64 = (val: any): val is string =>
  isString(val) && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(val);

/**
 * Check if value is a valid JSON string.
 * Useful for data validation and parsing.
 */
export const isJson = (val: any): val is string => {
  if (!isString(val)) return false;
  try {
    JSON.parse(val);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if value is a valid XML string.
 * Useful for data validation and parsing.
 */
export const isXml = (val: any): val is string => {
  if (!isString(val)) return false;
  try {
    new DOMParser().parseFromString(val, "text/xml");
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if value is a valid HTML string.
 * Useful for data validation and parsing.
 */
export const isHtml = (val: any): val is string => {
  if (!isString(val)) return false;
  const doc = new DOMParser().parseFromString(val, "text/html");
  return doc.body.innerHTML === val;
};

/**
 * Check if value is a valid CSS selector.
 * Useful for DOM manipulation and validation.
 */
export const isCssSelector = (val: any): val is string => {
  if (!isString(val)) return false;
  try {
    document.querySelector(val);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if value is a valid CSS property.
 * Useful for CSS manipulation and validation.
 */
export const isCssProperty = (val: any): val is string => {
  if (!isString(val)) return false;
  const style = document.createElement("div").style;
  return val in style;
};

/**
 * Check if value is a valid CSS value for a given property.
 * Useful for CSS manipulation and validation.
 */
export const isCssValue = (property: string, val: any): val is string => {
  if (!isString(val)) return false;
  const style = document.createElement("div").style;
  const originalValue = style[property as any];
  try {
    style[property as any] = val;
    return style[property as any] === val;
  } catch {
    return false;
  } finally {
    style[property as any] = originalValue;
  }
};

/**
 * Check if value is a valid file path.
 * Useful for file system operations and validation.
 */
export const isFilePath = (val: any): val is string =>
  isString(val) && /^(\/|\\|[A-Za-z]:\\)[\w\/\\.-]+$/.test(val);

/**
 * Check if value is a valid file extension.
 * Useful for file validation and filtering.
 */
export const isFileExtension = (val: any): val is string =>
  isString(val) && /^\.[a-zA-Z0-9]+$/.test(val);

/**
 * Check if value is a valid MIME type.
 * Useful for file validation and HTTP operations.
 */
export const isMimeType = (val: any): val is string =>
  isString(val) && /^[a-zA-Z]+\/[a-zA-Z0-9\-\+\.]+$/.test(val);

/**
 * Check if value is a valid currency code (ISO 4217).
 * Useful for financial operations and validation.
 */
export const isCurrencyCode = (val: any): val is string =>
  isString(val) && /^[A-Z]{3}$/.test(val);

/**
 * Check if value is a valid language code (ISO 639-1).
 * Useful for internationalization and validation.
 */
export const isLanguageCode = (val: any): val is string =>
  isString(val) && /^[a-z]{2}(-[A-Z]{2})?$/.test(val);

/**
 * Check if value is a valid country code (ISO 3166-1 alpha-2).
 * Useful for internationalization and validation.
 */
export const isCountryCode = (val: any): val is string =>
  isString(val) && /^[A-Z]{2}$/.test(val);

/**
 * Check if value is a valid timezone.
 * Useful for date/time operations and validation.
 */
export const isTimezone = (val: any): val is string =>
  isString(val) && Intl.supportedValuesOf("timeZone").includes(val);

/**
 * Check if value is a valid date string.
 * Useful for date validation and parsing.
 */
export const isDateString = (val: any): val is string => {
  if (!isString(val)) return false;
  const date = new Date(val);
  return !isNaN(date.getTime());
};

/**
 * Check if value is a valid time string (HH:MM or HH:MM:SS).
 * Useful for time validation and parsing.
 */
export const isTimeString = (val: any): val is string =>
  isString(val) && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(val);

/**
 * Check if value is a valid datetime string (ISO 8601).
 * Useful for datetime validation and parsing.
 */
export const isDateTimeString = (val: any): val is string =>
  isString(val) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/.test(val);

/**
 * Check if value is a valid duration string (e.g., "1h 30m", "2d", "30s").
 * Useful for time duration validation and parsing.
 */
export const isDurationString = (val: any): val is string =>
  isString(val) && /^(\d+(ms|s|m|h|d|w|y)\s*)+$/.test(val);

/**
 * Check if value is a valid semver string.
 * Useful for version validation and comparison.
 */
export const isSemver = (val: any): val is string =>
  isString(val) && /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)?(\+[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)?$/.test(val);

/**
 * Check if value is a valid git commit hash.
 * Useful for version control operations and validation.
 */
export const isGitCommitHash = (val: any): val is string =>
  isString(val) && /^[a-f0-9]{7,40}$/.test(val);

/**
 * Check if value is a valid git branch name.
 * Useful for version control operations and validation.
 */
export const isGitBranchName = (val: any): val is string =>
  isString(val) && /^[a-zA-Z0-9\/\-_]+$/.test(val);

/**
 * Check if value is a valid git tag name.
 * Useful for version control operations and validation.
 */
export const isGitTagName = (val: any): val is string =>
  isString(val) && /^[a-zA-Z0-9\-._]+$/.test(val);

/**
 * Check if value is a valid npm package name.
 * Useful for package management and validation.
 */
export const isNpmPackageName = (val: any): val is string =>
  isString(val) && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(val);

/**
 * Check if value is a valid Docker image name.
 * Useful for container operations and validation.
 */
export const isDockerImageName = (val: any): val is string =>
  isString(val) && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\/[a-z0-9]([a-z0-9-]*[a-z0-9])?)*(:[a-z0-9]([a-z0-9-]*[a-z0-9])?)?$/.test(val);

/**
 * Check if value is a valid Helm chart name.
 * Useful for Helm operations and validation.
 */
export const isHelmChartName = (val: any): val is string =>
  isString(val) && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(val);

/**
 * Check if value is a valid AWS ARN.
 * Useful for AWS operations and validation.
 */
export const isAwsArn = (val: any): val is string =>
  isString(val) && /^arn:aws:[a-z0-9-]+:[a-z0-9-]*:[0-9]{12}:.+/.test(val);

/**
 * Check if value is a valid AWS region.
 * Useful for AWS operations and validation.
 */
export const isAwsRegion = (val: any): val is string =>
  isString(val) && /^(us|eu|ap|ca|sa|af)-(east|west|south|north)-(1|2)$/.test(val);

/**
 * Check if value is a valid AWS account ID.
 * Useful for AWS operations and validation.
 */
export const isAwsAccountId = (val: any): val is string =>
  isString(val) && /^[0-9]{12}$/.test(val);

/**
 * Check if value is a valid Azure resource ID.
 * Useful for Azure operations and validation.
 */
export const isAzureResourceId = (val: any): val is string =>
  isString(val) && /^\/subscriptions\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/.+$/.test(val);

/**
 * Check if value is a valid GCP project ID.
 * Useful for GCP operations and validation.
 */
export const isGcpProjectId = (val: any): val is string =>
  isString(val) && /^[a-z][a-z0-9-]{6,30}[a-z0-9]$/.test(val);

/**
 * Check if value is a valid Kubernetes namespace.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sNamespace = (val: any): val is string =>
  isString(val) && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(val);

/**
 * Check if value is a valid Kubernetes label.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sLabel = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes annotation.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sAnnotation = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes resource type.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sResourceType = (val: any): val is string =>
  isString(val) && /^[a-z][a-z0-9]*$/.test(val);

/**
 * Check if value is a valid Kubernetes API version.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sApiVersion = (val: any): val is string =>
  isString(val) && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?\/[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(val);

/**
 * Check if value is a valid Kubernetes kind.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sKind = (val: any): val is string =>
  isString(val) && /^[A-Z][a-zA-Z0-9]*$/.test(val);

/**
 * Check if value is a valid Kubernetes selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes label selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sLabelSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes field selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sFieldSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes node selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sNodeSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes service selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sServiceSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes ingress selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sIngressSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes deployment selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sDeploymentSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes statefulset selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sStatefulSetSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes daemonset selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sDaemonSetSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes job selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sJobSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes cronjob selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sCronJobSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes replica set selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sReplicaSetSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod template selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodTemplateSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod spec selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodSpecSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod status selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodStatusSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod condition selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodConditionSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod phase selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodPhaseSelector = (val: any): val is string =>
  isString(val) && /^(Pending|Running|Succeeded|Failed|Unknown)$/.test(val);

/**
 * Check if value is a valid Kubernetes pod restart policy selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodRestartPolicySelector = (val: any): val is string =>
  isString(val) && /^(Always|OnFailure|Never)$/.test(val);

/**
 * Check if value is a valid Kubernetes pod termination grace period selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodTerminationGracePeriodSelector = (val: any): val is string =>
  isString(val) && /^[0-9]+$/.test(val);

/**
 * Check if value is a valid Kubernetes pod security context selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodSecurityContextSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod volume selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodVolumeSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod volume mount selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodVolumeMountSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container port selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerPortSelector = (val: any): val is string =>
  isString(val) && /^[0-9]+$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container env selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerEnvSelector = (val: any): val is string =>
  isString(val) && /^[a-z0-9A-Z]([a-z0-9A-Z-_.=,]*[a-z0-9A-Z])?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceSelector = (val: any): val is string =>
  isString(val) && /^(requests|limits)$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource type selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceTypeSelector = (val: any): val is string =>
  isString(val) && /^(cpu|memory|ephemeral-storage|storage)$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource quantity selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceQuantitySelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(m|K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource limit selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceLimitSelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(m|K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource request selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceRequestSelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(m|K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource limit type selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceLimitTypeSelector = (val: any): val is string =>
  isString(val) && /^(cpu|memory|ephemeral-storage|storage)$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource request type selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceRequestTypeSelector = (val: any): val is string =>
  isString(val) && /^(cpu|memory|ephemeral-storage|storage)$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource limit quantity selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceLimitQuantitySelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(m|K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource request quantity selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceRequestQuantitySelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(m|K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource limit cpu selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceLimitCpuSelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(m|K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource limit memory selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceLimitMemorySelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource limit ephemeral-storage selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceLimitEphemeralStorageSelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource limit storage selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceLimitStorageSelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource request cpu selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceRequestCpuSelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(m|K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource request memory selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceRequestMemorySelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource request ephemeral-storage selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceRequestEphemeralStorageSelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource request storage selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceRequestStorageSelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource limit cpu quantity selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceLimitCpuQuantitySelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(m|K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource limit memory quantity selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceLimitMemoryQuantitySelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource limit ephemeral-storage quantity selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceLimitEphemeralStorageQuantitySelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource limit storage quantity selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceLimitStorageQuantitySelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource request cpu quantity selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceRequestCpuQuantitySelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(m|K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource request memory quantity selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceRequestMemoryQuantitySelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource request ephemeral-storage quantity selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceRequestEphemeralStorageQuantitySelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource request storage quantity selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceRequestStorageQuantitySelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource limit cpu millicores selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceLimitCpuMillicoresSelector = (val: any): val is string =>
  isString(val) && /^[0-9]+m$/.test(val);

/**
 * Check if value is a valid Kubernetes pod container resource limit memory bytes selector.
 * Useful for Kubernetes operations and validation.
 */
export const isK8sPodContainerResourceLimitMemoryBytesSelector = (val: any): val is string =>
  isString(val) && /^[0-9]+(K|M|G|T|P|E|Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(val);
