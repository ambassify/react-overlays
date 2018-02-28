'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _popper = require('popper.js');

var _popper2 = _interopRequireDefault(_popper);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _componentOrElement = require('prop-types-extra/lib/componentOrElement');

var _componentOrElement2 = _interopRequireDefault(_componentOrElement);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _getContainer = require('./utils/getContainer');

var _getContainer2 = _interopRequireDefault(_getContainer);

var _ownerDocument = require('./utils/ownerDocument');

var _ownerDocument2 = _interopRequireDefault(_ownerDocument);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var displayName = 'Position';

var validPopperPlacements = [
// These are inlined from Popper.placements for docgen.
'auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

var validPopperFlipBehaviours = validPopperPlacements.concat([false, // disabling flip
'flip', 'clockwise', 'counterclockwise']);

var propTypes = {
  /**
   * A node, element, or function that returns either. The child will be
   * be positioned next to the `target` specified.
   */
  target: _propTypes2.default.oneOfType([_componentOrElement2.default, _propTypes2.default.func]),
  /**
   * How to position the component relative to the target
   */
  placement: _propTypes2.default.oneOf(validPopperPlacements),
  /**
   * How to adjust position of the component when hitting overlap with target
   */
  flip: _propTypes2.default.oneOfType([_propTypes2.default.oneOf(validPopperFlipBehaviours), _propTypes2.default.arrayOf(_propTypes2.default.oneOf(validPopperFlipBehaviours))]),
  /**
   * "offsetParent" of the component
   */
  container: _propTypes2.default.oneOfType([_componentOrElement2.default, _propTypes2.default.func]),
  /**
   * Minimum spacing in pixels between container border and component border
   */
  containerPadding: _propTypes2.default.number,
  /**
   * Whether the position should be changed on each update
   */
  shouldUpdatePosition: _propTypes2.default.bool,
  /**
   * @private
   */
  children: _propTypes2.default.element.isRequired
};

var defaultProps = {
  placement: 'right',
  flip: false,
  containerPadding: 0,
  shouldUpdatePosition: false
};

/**
 * The Position component calculates the coordinates for its child, to position
 * it relative to a `target` component or node. Useful for creating callouts
 * and tooltips, the Position component injects a `style` props with `left` and
 * `top` values for positioning your component.
 *
 * It also injects "arrow" `left`, and `top` values for styling callout arrows
 * for giving your components a sense of directionality.
 */

var Position = function (_React$Component) {
  _inherits(Position, _React$Component);

  function Position(props, context) {
    _classCallCheck(this, Position);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props, context));

    _this.onUpdate = function (_ref) {
      var _arrowPosition;

      var placement = _ref.placement,
          offsets = _ref.offsets;
      var popper = offsets.popper,
          reference = offsets.reference;


      var arrowPositionDirection = void 0;
      var arrowPositionDimension = void 0;

      if (placement === 'left' || placement === 'right') {
        arrowPositionDirection = 'top';
        arrowPositionDimension = 'height';
      } else {
        arrowPositionDirection = 'left';
        arrowPositionDimension = 'width';
      }

      var popperPosition = popper[arrowPositionDirection];
      var popperSize = popper[arrowPositionDimension];
      var referencePosition = reference[arrowPositionDirection];
      var referenceSize = reference[arrowPositionDimension];

      var popperPositionMin = referencePosition - popperSize;
      var popperPositionMax = referencePosition + referenceSize;
      var arrowPositionRelReverse = (popperPosition - popperPositionMin) / (popperPositionMax - popperPositionMin);
      var arrowPosition = (1 - arrowPositionRelReverse) * popperSize;

      // A change in placement might cause the positioned element to rerender, so
      // schedule a recalculation of the position.
      if (placement !== _this.state.placement) {
        _this.popper.scheduleUpdate();
      }

      _this.setState({
        placement: placement,
        position: {
          left: popper.left,
          top: popper.top
        },
        arrowPosition: (_arrowPosition = {}, _arrowPosition[arrowPositionDirection] = arrowPosition, _arrowPosition)
      });
    };

    _this.state = _this.getNullState();

    _this._needsFlush = false;
    _this._lastTarget = null;

    _this.popper = null;
    return _this;
  }

  Position.prototype.componentDidMount = function componentDidMount() {
    this.updatePosition(this.getTarget());
  };

  Position.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (nextProps.placement !== this.props.placement) {
      // Do our best to re-render with the intended next placement.
      this.setState({
        placement: nextProps.placement
      });
    }

    this._needsFlush = true;
  };

  Position.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    if (!this._needsFlush) {
      return;
    }

    this._needsFlush = false;

    var target = this.getTarget();
    if (target !== this._lastTarget || this.props.placement !== prevProps.placement || this.props.container !== prevProps.container || this.props.containerPadding !== prevProps.containerPadding || this.props.shouldUpdatePosition !== prevProps.shouldUpdatePosition) {
      this.updatePosition(target);
    } else if (this.popper && this.props.shouldUpdatePosition && this.props.children !== prevProps.children) {
      this.popper.scheduleUpdate();
    }
  };

  Position.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.popper) {
      this.popper.destroy();
    }
  };

  Position.prototype.getNullState = function getNullState() {
    return {
      placement: this.props.placement,
      position: { visibility: 'hidden' },
      arrowPosition: null
    };
  };

  Position.prototype.getTarget = function getTarget() {
    var target = this.props.target;

    target = typeof target === 'function' ? target() : target;
    return target && _reactDom2.default.findDOMNode(target) || null;
  };

  Position.prototype.updatePosition = function updatePosition(target) {
    if (this.popper) {
      this.popper.destroy();
    }

    this._lastTarget = target;

    if (!target) {
      this.setState(this.getNullState());

      return;
    }

    var _props = this.props,
        placement = _props.placement,
        flip = _props.flip,
        shouldUpdatePosition = _props.shouldUpdatePosition,
        container = _props.container,
        containerPadding = _props.containerPadding;

    var containerNode = (0, _getContainer2.default)(container, (0, _ownerDocument2.default)(this).body);

    this.popper = new _popper2.default(target, _reactDom2.default.findDOMNode(this), {
      placement: placement,
      eventsEnabled: shouldUpdatePosition,
      modifiers: {
        preventOverflow: {
          boundariesElement: containerNode,
          padding: containerPadding
        },
        flip: {
          enabled: flip !== false,
          behaviour: flip
        },
        applyStyle: {
          enabled: false
        }
      },
      onCreate: this.onUpdate,
      onUpdate: this.onUpdate
    });
  };

  Position.prototype.render = function render() {
    var _props2 = this.props,
        className = _props2.className,
        children = _props2.children,
        props = _objectWithoutProperties(_props2, ['className', 'children']);

    var child = _react2.default.Children.only(children);

    delete props.target;
    delete props.placement;
    delete props.container;
    delete props.containerPadding;
    delete props.shouldUpdatePosition;

    return _react2.default.cloneElement(child, _extends({}, props, this.state, {
      className: (0, _classnames2.default)(child.props.className, className)
    }));
  };

  return Position;
}(_react2.default.Component);

Position.displayName = displayName;
Position.propTypes = propTypes;
Position.defaultProps = defaultProps;

exports.default = Position;
module.exports = exports['default'];