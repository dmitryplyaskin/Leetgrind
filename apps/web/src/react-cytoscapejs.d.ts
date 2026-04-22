declare module "react-cytoscapejs" {
  import type { Core, ElementDefinition, LayoutOptions } from "cytoscape";
  import type { ComponentType, CSSProperties } from "react";

  interface CytoscapeComponentProps {
    cy?: (cy: Core) => void;
    elements: ElementDefinition[];
    layout?: LayoutOptions;
    stylesheet?: unknown[];
    style?: CSSProperties;
  }

  const CytoscapeComponent: ComponentType<CytoscapeComponentProps>;

  export default CytoscapeComponent;
}
