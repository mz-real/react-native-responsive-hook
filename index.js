// packages
import { Dimensions, PixelRatio, Platform } from 'react-native';
import useResponsive from './useResponsiveScreen';
import { baseDevice, baseFontSize, breakpoints, maxFontScaleFactor } from './constants';

// Retrieve initial screen's width
let screenWidth = Dimensions.get('window').width;

// Retrieve initial screen's height
let screenHeight = Dimensions.get('window').height;

/**
 * Determines if the platform is iOS.
 * @type {boolean}
 */
const isIOS = Platform.OS === 'ios';

/**
 * Determines if the platform is Android.
 * @type {boolean}
 */
const isAndroid = Platform.OS === 'android';

/**
 * Determines if the device is in landscape orientation.
 * @type {boolean}
 */
const isLandscape = screenWidth > screenHeight;

/**
 * Determines if the device is in portrait orientation.
 * @type {boolean}
 */
const isPortrait = screenWidth < screenHeight;

/**
 * The shorter screen edge, used as the baseline for font scaling.
 * @type {number}
 */
const base = isLandscape ? screenHeight : screenWidth;

/**
 * Converts provided width percentage to independent pixel (dp).
 * @param  {string} widthPercent The percentage of screen's width that UI element should cover
 *                               along with the percentage symbol (%).
 * @return {number}              The calculated dp depending on current device's screen width.
 */
const widthPercentageToDP = widthPercent => {
  // Parse string percentage input and convert it to number.
  const elemWidth = typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);

  // Use PixelRatio.roundToNearestPixel method in order to round the layout
  // size (dp) to the nearest one that correspons to an integer number of pixels.
  return PixelRatio.roundToNearestPixel(screenWidth * elemWidth / 100);
};

/**
 * Converts provided height percentage to independent pixel (dp).
 * @param  {string} heightPercent The percentage of screen's height that UI element should cover
 *                                along with the percentage symbol (%).
 * @return {number}               The calculated dp depending on current device's screen height.
 */
const heightPercentageToDP = heightPercent => {
  // Parse string percentage input and convert it to number.
  const elemHeight = typeof heightPercent === "number" ? heightPercent : parseFloat(heightPercent);

  // Use PixelRatio.roundToNearestPixel method in order to round the layout
  // size (dp) to the nearest one that correspons to an integer number of pixels.
  return PixelRatio.roundToNearestPixel(screenHeight * elemHeight / 100);
};

let orientationSubscription = null;
let orientationHandler = null;

/**
 * Event listener function that detects orientation change (every time it occurs) and triggers
 * screen rerendering. It does that, by changing the state of the screen where the function is
 * called. State changing occurs for a new state variable with the name 'orientation' that will
 * always hold the current value of the orientation after the 1st orientation change.
 * Invoke it inside the screen's constructor or in componentDidMount lifecycle method.
 * @param {object} that Screen's class component this variable. The function needs it to
 *                      invoke setState method and trigger screen rerender (this.setState()).
 */
const listenOrientationChange = that => {
  orientationHandler = newDimensions => {
    // Retrieve and save new dimensions
    screenWidth = newDimensions.window.width;
    screenHeight = newDimensions.window.height;

    // Trigger screen's rerender with a state update of the orientation variable
    that.setState({
      orientation: screenWidth < screenHeight ? 'portrait' : 'landscape'
    });
  };

  orientationSubscription = Dimensions.addEventListener('change', orientationHandler);
};

/**
 * Wrapper function that removes orientation change listener and should be invoked in
 * componentWillUnmount lifecycle method of every class component (UI screen) that
 * listenOrientationChange function has been invoked. This should be done in order to
 * avoid adding new listeners every time the same component is re-mounted.
 */
const removeOrientationListener = () => {
  // React Native >= 0.65 returns a subscription; >= 0.72 dropped
  // Dimensions.removeEventListener entirely.
  if (orientationSubscription && typeof orientationSubscription.remove === 'function') {
    orientationSubscription.remove();
  } else if (orientationHandler && typeof Dimensions.removeEventListener === 'function') {
    Dimensions.removeEventListener('change', orientationHandler);
  }

  orientationSubscription = null;
  orientationHandler = null;
};

/**
 * Converts provided width percentage to viewport-relative units (vw).
 * @param  {string} widthPercent The percentage of viewport's width that UI element should cover.
 * @returns {number} The calculated vw value.
 */
const viewportWidthPercentage = widthPercent => {
  const elemWidth = typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
  return Math.floor((screenWidth / 100) * elemWidth);
};

/**
 * Converts provided height percentage to viewport-relative units (vh).
 * @param  {string} heightPercent The percentage of viewport's height that UI element should cover.
 * @returns {number} The calculated vh value.
 */
const viewportHeightPercentage = heightPercent => {
  const elemHeight = typeof heightPercent === 'number' ? heightPercent : parseFloat(heightPercent);
  return Math.floor((screenHeight / 100) * elemHeight);
};

/**
 * Converts provided font size to rem units.
 * @param  {string} size The font size in pixels.
 * @returns {number} The calculated rem value.
 */
const remUnit = size => {
  const elemSize = typeof size === 'number' ? size : parseFloat(size);
  const multiplier = Math.max(screenHeight, screenWidth) < baseDevice.height ? 0.9 : 1;
  return Math.floor((base / baseDevice.width) * elemSize * multiplier);
};

/**
 * Converts provided font size to responsive font units (rf).
 * @param  {string} size The font size in pixels.
 * @returns {number} The calculated rf value.
 */
const responsiveFont = size => {
  const elemSize = typeof size === 'number' ? size : parseFloat(size);
  const scaledFontSize = Math.min(baseFontSize * maxFontScaleFactor, elemSize);
  return scaledFontSize;
};

/**
 * Gets the current breakpoint group based on the device width.
 * @returns {string} The name of the current breakpoint group.
 */
const getBreakpointGroup = () => {
for (let group in breakpoints) {
  if (screenWidth >= breakpoints[group][0] && screenWidth <= breakpoints[group][1]) {
    return group;
  }
}
};

/**
 * The current breakpoint group based on the device width.
 * @type {string}
 */
const breakpointGroup = getBreakpointGroup();

export {
  isLandscape,
  isPortrait,
  isAndroid,
  isIOS,
  breakpointGroup,
  widthPercentageToDP,
  heightPercentageToDP,
  listenOrientationChange,
  removeOrientationListener,
  viewportWidthPercentage,
  viewportHeightPercentage,
  remUnit,
  responsiveFont,
  useResponsive,
};
