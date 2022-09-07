
import { Box, IconButton, Tooltip } from "@hope-ui/solid";
import { Accessor } from "solid-js";
import { createMemo, ParentComponent, Component, JSX, createSignal, children } from "solid-js";
import { ResolvedJSXElement } from "solid-js/types/reactive/signal";


const SidebarButton: Component<{
  label: string;
  onClick: () => void;
  icon: JSX.Element;
  top: string;
  right: string;
}> = (props) => {
  return (
    <Tooltip label={props.label}>
      <IconButton
        variant="ghost"
        size="sm"
        position="relative"
        top={props.top}
        right={props.right}
        onClick={props.onClick}
        aria-label={props.label}
        backgroundColor="white"
        icon={props.icon}
      />
    </Tooltip>
  );
};

let x = 0;
let initialLeftWidth = 0;
const SplitView: ParentComponent<{
}> = (props) => {

    // Somehow using `HtmlElement` here causes a type error
    let leftSide: any;
    let rightSide: any;
    let resizer: any;


    const resolvedChildren = children(() => props.children) as Accessor<ResolvedJSXElement[]>;

    let [isResizing, setIsResizing] = createSignal(false);
    let [leftWidth, setLeftWidth] = createSignal(60);
    let leftStyleGet = createMemo(() => {
      return {
        width: leftWidth() + "%",
        "user-select": isResizing() ? "none" : "user-select",
        "pointer-event": isResizing() ? "none" : "pointer-events"
      }
    })
    let rightStyleGet = createMemo(() => {
      return {
        "user-select": isResizing() ? "none" : "user-select",
        "pointer-event": isResizing() ? "none" : "pointer-events"
      }
    })
    let resizerStyleGet = createMemo(() => {
      return isResizing() ? {cursor: 'col-resize'} : undefined
    })


    function mouseMoveHandler(e: MouseEvent) {
      const dx = e.clientX - x;
      setLeftWidth(((initialLeftWidth + dx) * 100) / (resizer.parentNode as HTMLElement).getBoundingClientRect().width)
      document.body.style.cursor = 'col-resize';
    };

    function mouseUpHandler () {
      setIsResizing(false);
      document.body.style.removeProperty('cursor');
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    function mouseDownHandler(e: MouseEvent) {
      x = e.clientX;
      initialLeftWidth = leftSide.getBoundingClientRect().width;
      setIsResizing(true);
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };

    return (
      <Box h="$full" class="splitview-container">
        <div class="splitview-container-left" style={leftStyleGet()} ref={leftSide}>{resolvedChildren()[0]}</div>
        <div class="splitview-resizer" style={resizerStyleGet()} ref={resizer} onMouseDown={mouseDownHandler}></div>
        <div class="splitview-container-right" style={rightStyleGet()}  ref={rightSide}>{resolvedChildren()[1]}</div>
    </Box>
    );
};

export default SplitView;

