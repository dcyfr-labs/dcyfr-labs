"use client";

import { useCallback, useMemo, useEffect, useRef } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Node,
  type Edge,
  type OnConnect,
  type NodeTypes,
  type EdgeTypes,
  MarkerType,
  Position,
  Handle,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import { ANIMATION, BORDERS, SHADOWS } from "@/lib/design-tokens";

// ============================================================================
// Custom Node Types
// ============================================================================

/**
 * Base node data structure - uses index signature for React Flow compatibility
 */
export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "accent" | "muted";
}

/**
 * Modern styled node with rounded corners and subtle shadows
 */
function ModernNode({ data, selected }: NodeProps<Node<BaseNodeData>>) {
  const variants = {
    default: "bg-card border-border",
    primary: "bg-primary/10 border-primary/50",
    secondary: "bg-secondary border-secondary-foreground/20",
    accent: "bg-accent border-accent-foreground/20",
    muted: "bg-muted border-muted-foreground/20",
  };

  const variant = data.variant || "default";

  return (
    <>
      <Handle type="target" position={Position.Top} className="bg-primary! w-3! h-3! border-2! border-background!" />
      <div
        className={cn(
          `px-4 py-3 ${BORDERS.card} border-2 ${SHADOWS.sm} transition-base`,
          ANIMATION.duration.fast,
          variants[variant],
          selected && `ring-2 ring-primary ring-offset-2 ring-offset-background ${SHADOWS.lg}`,
          `hover:${SHADOWS.md}`
        )}
      >
        <div className="flex items-center gap-2">
          {data.icon && <span className="text-muted-foreground">{data.icon}</span>}
          <div>
            <div className="font-medium text-sm text-foreground">{data.label}</div>
            {data.description && (
              <div className="text-xs text-muted-foreground mt-0.5">{data.description}</div>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="bg-primary! w-3! h-3! border-2! border-background!" />
    </>
  );
}

/**
 * Input node (entry point)
 */
function InputNode({ data, selected }: NodeProps<Node<BaseNodeData>>) {
  return (
    <>
      <div
        className={cn(
          `px-4 py-3 ${BORDERS.card} border-2 ${SHADOWS.sm}`,
          ANIMATION.transition.base,
          "bg-card/80 border-border",
          selected && `ring-2 ring-primary ring-offset-2 ring-offset-background ${SHADOWS.lg}`
        )}
      >
        <div className="flex items-center gap-2">
          {data.icon && <span className="text-muted-foreground">{data.icon}</span>}
          <div className="font-medium text-sm text-foreground">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="bg-primary! w-3! h-3! border-2! border-background!" />
    </>
  );
}

/**
 * Output node (end point)
 */
function OutputNode({ data, selected }: NodeProps<Node<BaseNodeData>>) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="bg-primary! w-3! h-3! border-2! border-background!" />
      <div
        className={cn(
          `px-4 py-3 ${BORDERS.card} border-2 ${SHADOWS.sm}`,
          ANIMATION.transition.base,
          "bg-card/80 border-border",
          selected && `ring-2 ring-primary ring-offset-2 ring-offset-background ${SHADOWS.lg}`
        )}
      >
        <div className="flex items-center gap-2">
          {data.icon && <span className="text-muted-foreground">{data.icon}</span>}
          <div className="font-medium text-sm text-foreground">{data.label}</div>
        </div>
      </div>
    </>
  );
}

/**
 * Process/action node
 */
function ProcessNode({ data, selected }: NodeProps<Node<BaseNodeData>>) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="bg-primary! w-3! h-3! border-2! border-background!" />
      <div
        className={cn(
          `px-4 py-3 ${BORDERS.card} border-2 ${SHADOWS.sm}`,
          ANIMATION.transition.base,
          "bg-card/80 border-border",
          selected && `ring-2 ring-primary ring-offset-2 ring-offset-background ${SHADOWS.lg}`
        )}
      >
        <div className="flex items-center gap-2">
          {data.icon && <span className="text-muted-foreground">{data.icon}</span>}
          <div>
            <div className="font-medium text-sm text-foreground">{data.label}</div>
            {data.description && (
              <div className="text-xs text-muted-foreground mt-0.5">{data.description}</div>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="bg-primary! w-3! h-3! border-2! border-background!" />
    </>
  );
}

/**
 * Decision node (diamond shape for branching logic)
 */
function DecisionNode({ data, selected }: NodeProps<Node<BaseNodeData>>) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="bg-primary! w-3! h-3! border-2! border-background!" />
      <div
        className={cn(
          `px-4 py-3 border-2 ${SHADOWS.sm}`,
          ANIMATION.transition.base,
          "bg-card/80 border-border",
          "w-24 h-24 rotate-45", // Diamond shape
          selected && `ring-2 ring-primary ring-offset-2 ring-offset-background ${SHADOWS.lg}`
        )}
      >
        <div className="-rotate-45 flex items-center justify-center h-full">
          <div className="font-medium text-sm text-foreground text-center">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="bg-primary! w-3! h-3! border-2! border-background!" />
      <Handle type="source" position={Position.Left} className="bg-primary! w-3! h-3! border-2! border-background!" />
      <Handle type="source" position={Position.Right} className="bg-primary! w-3! h-3! border-2! border-background!" />
    </>
  );
}

// ============================================================================
// Node Types Registry
// ============================================================================

const nodeTypes: NodeTypes = {
  modern: ModernNode,
  input: InputNode,
  output: OutputNode,
  process: ProcessNode,
  decision: DecisionNode,
};

// ============================================================================
// Auto Fit View Component (must be inside ReactFlow context)
// ============================================================================

/**
 * Internal component that handles automatic fit view on layout changes and viewport resize with auto zoom
 */
function AutoFitView({ nodes }: { nodes: Node<BaseNodeData>[] }) {
  const { fitView: reactFlowFitView } = useReactFlow();

  // Helper function to fit and zoom the view - memoized to avoid dependency issues
  const fitAndZoom = useCallback((duration: number) => {
    // Use fitView which automatically calculates optimal zoom level
    reactFlowFitView({
      padding: 0.2,
      duration,
      maxZoom: 1.5, // Allow zooming in up to 1.5x for better visibility
      minZoom: 0.1, // Allow zooming out to 0.1x for overview
    });
  }, [reactFlowFitView]);

  useEffect(() => {
    // Fit view when nodes change (layout shifts)
    const timer = setTimeout(() => {
      fitAndZoom(400);
    }, 100);

    return () => clearTimeout(timer);
  }, [nodes, fitAndZoom]);

  // Handle viewport resize for responsive scaling and auto zoom
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events to avoid excessive updates
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        fitAndZoom(300);
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [fitAndZoom]);

  return null;
}

// ============================================================================
// Main Component
// ============================================================================

export interface InteractiveDiagramProps {
  /** Initial nodes for the diagram */
  nodes: Node<BaseNodeData>[];
  /** Initial edges connecting nodes */
  edges: Edge[];
  /** Enable node dragging */
  draggable?: boolean;
  /** Enable creating new connections */
  connectable?: boolean;
  /** Show controls (zoom, fit) */
  showControls?: boolean;
  /** Show minimap */
  showMinimap?: boolean;
  /** Show background pattern */
  showBackground?: boolean;
  /** Background pattern type */
  backgroundVariant?: BackgroundVariant;
  /** Fit view on mount */
  fitView?: boolean;
  /** Minimum zoom level */
  minZoom?: number;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Height of the diagram container */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Custom node types */
  customNodeTypes?: NodeTypes;
  /** Custom edge types */
  customEdgeTypes?: EdgeTypes;
  /** Title for the diagram */
  title?: string;
  /** Description for the diagram */
  description?: string;
  /** Lock the diagram (disable dragging, panning, zooming) */
  locked?: boolean;
  /** Caption for the diagram (displays below) */
  caption?: string;
}

/**
 * Interactive Diagram Component
 * 
 * Modern, interactive node-based diagrams powered by React Flow.
 * Perfect for architecture diagrams, flowcharts, and process visualizations.
 * 
 * @component
 * @example
 * ```tsx
 * const nodes = [
 *   { id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'Start' } },
 *   { id: '2', type: 'process', position: { x: 0, y: 100 }, data: { label: 'Process' } },
 *   { id: '3', type: 'output', position: { x: 0, y: 200 }, data: { label: 'End' } },
 * ];
 * 
 * const edges = [
 *   { id: 'e1-2', source: '1', target: '2' },
 *   { id: 'e2-3', source: '2', target: '3' },
 * ];
 * 
 * <InteractiveDiagram 
 *   nodes={nodes} 
 *   edges={edges} 
 *   title="Simple Flow"
 * />
 * ```
 * 
 * @features
 * - Pre-styled node types (input, output, process, modern)
 * - Theme-aware styling (light/dark mode)
 * - Interactive controls (zoom, pan, fit)
 * - Optional minimap for navigation
 * - Smooth animations and transitions
 * - Accessible with keyboard navigation
 */
export function InteractiveDiagram({
  nodes: initialNodes,
  edges: initialEdges,
  draggable = true,
  connectable = false,
  showControls = true,
  showMinimap = false,
  showBackground = true,
  backgroundVariant = BackgroundVariant.Dots,
  fitView = true,
  minZoom = 0.5,
  maxZoom = 2,
  height = 400,
  className,
  customNodeTypes,
  customEdgeTypes,
  title,
  description,
  locked = true,
  caption,
}: InteractiveDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Apply lock settings
  const isDraggable = locked ? false : draggable;
  const shouldShowControls = locked ? false : showControls;
  // When locked, prevent user zoom but allow auto-fit to work (0.1 to 1.5 range)
  const lockedMinZoom = locked ? 0.1 : minZoom;
  const lockedMaxZoom = locked ? 1.5 : maxZoom;

  // Prevent scroll blocking when diagram is locked
  // This allows page scrolling even when mouse is over the diagram
  useEffect(() => {
    if (!locked || !containerRef.current) return;

    const container = containerRef.current;
    
    const handleWheel = (e: WheelEvent) => {
      // Only prevent ReactFlow's default wheel handling when locked
      // Allow the browser to handle the scroll normally for the page
      e.preventDefault();
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [locked]);

  const onConnect: OnConnect = useCallback(
    (params) => {
      if (connectable) {
        setEdges((eds) =>
          addEdge(
            {
              ...params,
              animated: true,
              style: { stroke: 'color-mix(in srgb, var(--foreground) 80%, transparent)' },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'color-mix(in srgb, var(--foreground) 80%, transparent)',
              },
            },
            eds
          )
        );
      }
    },
    [setEdges, connectable]
  );

  // Merge custom node types with defaults
  const mergedNodeTypes = useMemo(
    () => ({ ...nodeTypes, ...customNodeTypes }),
    [customNodeTypes]
  );

  // Style edges with theme-aware colors using semantic CSS variables
  const styledEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        style: {
          stroke: 'color-mix(in srgb, var(--foreground) 80%, transparent)',
          strokeWidth: 2,
          ...edge.style,
        },
        markerEnd: edge.markerEnd || {
          type: MarkerType.ArrowClosed,
          color: 'color-mix(in srgb, var(--foreground) 80%, transparent)',
        },
      })),
    [edges]
  );

  return (
    <figure className="w-full mb-8">
      <div
        ref={containerRef}
        className={cn(
          "rounded-lg border border-border bg-card overflow-hidden flex flex-col w-full",
          locked && "diagram-locked",
          className
        )}
        style={{ height }}
        data-locked={locked}
      >
      {/*{(title || description) && (
        <div className="px-4 py-1 border-b border-border bg-muted/30 shrink-0">
          {title && <h3 className="font-sans! font-medium text-sm text-foreground">{title}</h3>}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}*/}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={mergedNodeTypes}
          edgeTypes={customEdgeTypes}
          nodesDraggable={isDraggable}
          nodesConnectable={connectable}
          fitView={fitView}
          minZoom={lockedMinZoom}
          maxZoom={lockedMaxZoom}
          panOnScroll={!locked}
          zoomOnScroll={!locked}
          zoomOnPinch={!locked}
          panOnDrag={!locked}
          proOptions={{ hideAttribution: true }}
          className="bg-background"
        >
        {showBackground && (
          <Background
            variant={backgroundVariant}
            gap={20}
            size={1}
            style={{
              color: 'color-mix(in srgb, var(--foreground) 15%, transparent)'
            }}
          />
        )}
        {shouldShowControls && (
          <Controls
            className="bg-card! border-border! shadow-md!"
            showInteractive={connectable}
            position="bottom-right"
            orientation="horizontal"
          />
        )}
        {showMinimap && (
          <MiniMap
            className="bg-card! border-border!"
            nodeColor={(node) => {
              // Use semantic colors that adapt to theme automatically
              switch (node.type) {
                case "input":
                  return 'var(--primary)';
                case "output":
                  return 'color-mix(in srgb, var(--primary) 80%, transparent)';
                case "process":
                  return 'var(--accent-foreground)';
                default:
                  return 'color-mix(in srgb, var(--foreground) 60%, transparent)';
              }
            }}
          />
        )}
        <AutoFitView nodes={nodes} />
      </ReactFlow>
      </div>
    </div>
    {caption && (
      <figcaption className="mt-3 text-sm text-muted-foreground italic">
        {caption}
      </figcaption>
    )}
    </figure>
  );
}

// ============================================================================
// Preset Diagrams
// ============================================================================

/**
 * Helper to create a simple linear flow
 */
export function createLinearFlow(
  steps: { label: string; description?: string }[]
): { nodes: Node<BaseNodeData>[]; edges: Edge[] } {
  const nodes: Node<BaseNodeData>[] = steps.map((step, index) => ({
    id: `node-${index}`,
    type: index === 0 ? "input" : index === steps.length - 1 ? "output" : "process",
    position: { x: 250, y: index * 100 },
    data: { label: step.label, description: step.description },
  }));

  const edges: Edge[] = steps.slice(0, -1).map((_, index) => ({
    id: `edge-${index}`,
    source: `node-${index}`,
    target: `node-${index + 1}`,
    animated: true,
  }));

  return { nodes, edges };
}

/**
 * Helper to create a branching flow
 */
export function createBranchingFlow(config: {
  start: string;
  branches: { label: string; children?: string[] }[];
  end?: string;
}): { nodes: Node<BaseNodeData>[]; edges: Edge[] } {
  const nodes: Node<BaseNodeData>[] = [];
  const edges: Edge[] = [];

  // Start node
  nodes.push({
    id: "start",
    type: "input",
    position: { x: 250, y: 0 },
    data: { label: config.start },
  });

  // Branch nodes
  const branchWidth = 200;
  const startX = 250 - ((config.branches.length - 1) * branchWidth) / 2;

  config.branches.forEach((branch, index) => {
    const nodeId = `branch-${index}`;
    nodes.push({
      id: nodeId,
      type: "process",
      position: { x: startX + index * branchWidth, y: 100 },
      data: { label: branch.label },
    });

    edges.push({
      id: `edge-start-${nodeId}`,
      source: "start",
      target: nodeId,
    });

    // Child nodes
    branch.children?.forEach((child, childIndex) => {
      const childId = `${nodeId}-child-${childIndex}`;
      nodes.push({
        id: childId,
        type: "modern",
        position: { x: startX + index * branchWidth, y: 200 + childIndex * 80 },
        data: { label: child },
      });

      edges.push({
        id: `edge-${nodeId}-${childId}`,
        source: childIndex === 0 ? nodeId : `${nodeId}-child-${childIndex - 1}`,
        target: childId,
      });
    });
  });

  // End node
  if (config.end) {
    const endY = Math.max(...nodes.map((n) => n.position.y)) + 100;
    nodes.push({
      id: "end",
      type: "output",
      position: { x: 250, y: endY },
      data: { label: config.end },
    });

    // Connect last nodes to end
    const lastNodes = nodes.filter(
      (n) => n.id !== "end" && !edges.some((e) => e.source === n.id)
    );
    lastNodes.forEach((node) => {
      edges.push({
        id: `edge-${node.id}-end`,
        source: node.id,
        target: "end",
      });
    });
  }

  return { nodes, edges };
}
