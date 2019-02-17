import { autobind } from "core-decorators";
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Popover, OverlayTrigger, Button } from "react-bootstrap";
import uncontrollable from "uncontrollable";
import css from "./checkboxTree.less";

@autobind
class TreeCheckbox extends React.Component {

  componentDidMount() {
    this.el.indeterminate = this.props.value === null;
  }

  componentDidUpdate() {
    this.el.indeterminate = this.props.value === null;
  }

  render() {
    const { id, disabled, label, value, onChange } = this.props;
    const inputProps = (!disabled) ? { onChange } : {};
    return (
      <div className="custom-checkbox">
        <input
          id={id}
          ref={el => { this.el = el; }}
          type="checkbox"
          disabled={disabled}
          checked={!!value}
          {...inputProps}
        />
        <label htmlFor={id} className="custom-checkbox">{label}</label>
      </div>
    );
  }
}

@autobind
class NodeHeader extends React.Component {
  constructor(args) {
    super(args);
    this.state = {
      showPopover: false
    };
  }
  handleSelect(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.props.node.children && this.props.node.children.length) {
      if (this.props.checkable && !this.props.node.disabled) {
        this.props.onCheck();
        if (this.props.enableShiftSelection) {
          this.props.onSelect(e);
        }
      } else if (!this.props.node.selectable) {
        this.props.onExpand();
      }
    } else {
      if (!this.props.node.disabled) {
        this.props.onCheck();
        this.props.onSelect(e);
      }
    }
  }

  handleExpand(e) {
    e.stopPropagation();
    this.props.onExpand();
  }

  getPopover() {
    const { node, actionsDropdown: Popover } = this.props;
    return <Popover id={node.id + '-popover'}
      className={css.treeActionsPopover}
      node={node}
      onClick={this.handlePopoverClick} />;
  }

  handlePopoverClick(e) {
    e.stopPropagation();
    this.nodeOverlay.hide();
  }
  handleOverlayTriggerClick(e) {
    e.stopPropagation();
    this.setState({
      showPopover: true
    })
  }
  handlePopoverHide() {
    this.setState({
      showPopover: false
    })
  }
  getNodePopover({ disabledMsg, id }) {
    return (
      <Popover id={id + '-disable-popover'}>
        {disabledMsg}
      </Popover>
    );
  }

  handleDrag({ id, name, type = "template", projectName }, evt) {
    evt.dataTransfer.setData("name", name);
    evt.dataTransfer.setData("id", id);
    evt.dataTransfer.setData("projectName", projectName);
    evt.dataTransfer.dropEffect = "move";
  }

  render() {
    const { node } = this.props;
    const { draggable = false, name } = node;
    const optionClassName = (this.state.showPopover) ? "options show" : "options";
    let nodeProps = {
      title: name,
      className: "title"
    };
    if (draggable) {
      nodeProps = {
        ...nodeProps,
        draggable: true,
        className: "title draggable",
        onDragStart: this.handleDrag.bind(this, node)
      }
    }
    return (
      <div onClick={this.handleSelect} className={classNames('node-header', { active: node.selected })}>
        <div className="selection" />
        <div className="node">
          {this.renderToggle(node.children && node.children.length)}
          {this.props.node.iconClass !== undefined && this.renderStatusIcon()}
          {this.renderCheckbox()}
          <div {...nodeProps}>
            {
              (node.disabled && node.disabledMsg) ?
                <OverlayTrigger
                  trigger="hover"
                  placement="right"
                  rootClose
                  overlay={this.getNodePopover(node)}>
                  <span className="disable-popover">{node.name}</span>
                </OverlayTrigger>
                :
                node.name
            }
          </div>
        </div>
        {this.props.actionsDropdown != undefined &&
          <div className={optionClassName}>
            <OverlayTrigger
              trigger="click"
              placement="bottom"
              overlay={this.getPopover()}
              rootClose
              ref={c => this.nodeOverlay = c}
              onClick={this.handleOverlayTriggerClick}
              onExit={this.handlePopoverHide}
            >
              <Button
                bsStyle="link"
                className="btn-icon dnac_tp_checkboxTree_gear"
              >
                <i className="dna-settings-filled" />
              </Button>
            </OverlayTrigger>

          </div>
        }
      </div>
    );
  }

  renderStatusIcon() {
    return (
      <i className={`status-icon ${this.props.node.iconClass}`} />
    );
  }
  renderToggle(visible) {
    return (
      <div className={classNames('toggler', { 'invisible': !visible })} onClick={this.handleExpand}>
        {this.props.node.expanded
          ? <span className="dna-drop-down-site" />
          : <span className="dna-drop-down-site" style={{ display: 'inline-block', transform: 'rotate(180deg)' }} />
        }
      </div>
    );
  }

  renderCheckbox() {
    if (!this.props.checkable) {
      return null;
    }

    return (
      <div className="tree-checkbox">
        <TreeCheckbox
          id={this.props.node.id + "-checkbox"}
          value={this.props.node.checked}
          onChange={this.props.onCheck}
          disabled={this.props.node.disabled}
        />
      </div>
    );
  }
}

@autobind
class TreeNode extends React.Component {
  handleExpand() {
    const { node, onExpand } = this.props;
    const { expanded } = node;

    if (onExpand) {
      onExpand(node, !expanded);
    }
  }

  handleCheck() {
    const { node, onCheck } = this.props;
    const { checked } = node;

    if (onCheck) {
      onCheck(node, !checked);
    }
  }

  handleSelect(evt) {
    const { node, onSelect } = this.props;
    const { selected } = node;

    if (onSelect) {
      onSelect(node, !selected, evt);
    }
  }

  render() {
    return (
      <li className="item">
        <NodeHeader
          checkable={this.props.checkable}
          node={{ ...this.props.node }}
          onCheck={this.handleCheck}
          onExpand={this.handleExpand}
          onSelect={this.handleSelect}
          actionsDropdown={this.props.actionsDropdown}
          enableShiftSelection={this.props.enableShiftSelection}
        />
        {this.renderChildren()}
      </li>
    );
  }

  renderChildren() {
    return this.props.node.expanded ? this.props.children : null;
  }
}
TreeNode.propTypes = {
  selectable: PropTypes.bool.isRequired,
};
TreeNode.defaultProps = {
  selectable: true,
};

@autobind
class CheckboxTree extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.expandedSet = this.createSet(props.expanded);
    this.checkedSet = this.createSet(props.checked);
    this.selectedSet = this.createSet(props.selected);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.expanded !== nextProps.expanded) {
      this.expandedSet = this.createSet(nextProps.expanded);
    }
    if (this.props.checked !== nextProps.checked) {
      this.checkedSet = this.createSet(nextProps.checked);
    }
    if (this.props.selected !== nextProps.selected) {
      this.selectedSet = this.createSet(nextProps.selected);
    }
  }

  createSet(values) {
    return values.reduce((res, cur) => {
      res[cur] = 1;
      return res;
    }, {});
  }

  onSelect(node, selected, evt) {
    if (node.selectable === false) {
      return;
    }
    if (this.props.enableShiftSelection && evt.shiftKey) {
      const selectedIds = Object.keys(this.selectedSet);
      if (selected) {
        this.props.onSelect(selectedIds.concat(node.id), evt);
      } else {
        this.props.onSelect(selectedIds.filter(id => node.id != id), evt);
      }
    } else {
      if (this.props.singleSelection) {
        if (this.props.enableShiftSelection && node.children && node.children.length) { // handle node header selection
          const selectedIds = Object.keys(this.selectedSet);
          let selectedNodes = [];
          if (selectedIds.length < node.children.filter(item => !item.disabled).length) {
            selectedNodes = node.children.map(item => item.id);
          }
          this.props.onSelect(selectedNodes, evt);
        } else {
          this.props.onSelect(selected ? [node.id] : [], evt);
        }
      } else {
        const selectedIds = Object.keys(this.selectedSet);
        if (selected) {
          this.props.onSelect(selectedIds.concat(node.id), evt);
        } else {
          this.props.onSelect(selectedIds.filter(id => node.id != id), evt);
        }
      }
    }
  }

  onExpand(node, expanded) {
    if (expanded) {
      this.props.onExpand(Object.keys(this.expandedSet).concat(node.id));
    } else {
      this.props.onExpand(Object.keys(this.expandedSet).filter(id => id !== node.id));
    }
  }

  onCheck(node, checked) {
    if (node.selectable === false) {
      return;
    }
    const checkedIds = Object.keys(this.checkedSet);
    const childIds = this.getChildIds(node);
    if (checked) {
      this.props.onCheck(checkedIds.concat(childIds));
    } else {
      // this can be optimized
      this.props.onCheck(checkedIds.filter(id => childIds.indexOf(id) < 0));
    }
  }

  getChildIds(node) {
    if (node.children) {
      return node.children.reduce((all, child) => all.concat(this.getChildIds(child)), []);
    }
    return node.id;
  }

  calculateCheckedValue(node) {
    if (node.children && node.children.length) {
      const childCheckedValues = node.children.filter(({ disabled = false }) => !disabled).map(this.calculateCheckedValue); // exclude disabled nodes
      if (childCheckedValues.every(value => value === childCheckedValues[0])) {
        return childCheckedValues[0];
      }
      return null;
    }
    return this.checkedSet[node.id];
  }

  renderNodes(nodes, parent = {}) {
    return (
      <ul className="items">
        {nodes.map((node, index) => {
          const expanded = this.expandedSet[node.id];
          const checked = this.calculateCheckedValue(node);
          const selected = this.props.checkable ? checked : this.selectedSet[node.id];
          const children = (expanded && node.children)
            ? this.renderNodes(node.children, node)
            : null;
          return (
            <TreeNode
              key={node.id || index}
              node={{ ...node, expanded, checked, selected }}
              selectable={node.selectable}
              checkable={this.props.checkable}
              onCheck={this.onCheck}
              onExpand={this.onExpand}
              onSelect={this.onSelect}
              enableShiftSelection={this.props.enableShiftSelection}
              actionsDropdown={this.props.nodeActionsDropdown}
            >
              {children}
            </TreeNode>
          );
        })}
      </ul>
    );
  }

  render() {
    const baseClass = [css.checkboxTree, this.props.className || ""].join(" ");
    return (
      <div className={baseClass}>
        <div className="tree-container">
          {this.renderNodes(this.props.data)}
        </div>
      </div>
    );
  }
}

CheckboxTree.propTypes = {
  data: PropTypes.array.isRequired,
  expanded: PropTypes.array.isRequired,
  checked: PropTypes.array,
  selected: PropTypes.array,
  checkable: PropTypes.bool,
  singleSelection: PropTypes.bool,
  enableShiftSelection: PropTypes.bool,
  onSelect: PropTypes.func,
};

CheckboxTree.defaultProps = {
  data: [],
  expanded: [],
  checked: [],
  selected: [],
  checkable: false,
  enableShiftSelection: false,
  singleSelection: true,
};

export default uncontrollable(CheckboxTree, {
  expanded: 'onExpand',
  checked: 'onCheck',
  selected: 'onSelect',
})
