import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular, EventObject } from 'cytoscape';
import {
  Search,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  X,
  Shield,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info,
  Calendar,
  User,
  MapPin,
  Scroll,
  Package,
  Skull,
  ShieldCheck,
  Tag,
  Eye,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import {
  Campana,
  Sesion,
  NPC,
  Lugar,
  Mision,
  Objeto,
  Monstruo,
  PJ,
  ModoApp,
} from '../types';

export type EntityType =
  | 'sesion'
  | 'npc'
  | 'lugar'
  | 'mision'
  | 'objeto'
  | 'monstruo'
  | 'pj';

export interface MapaMentalViewProps {
  campana: Campana;
  sesiones: Sesion[];
  npcs: NPC[];
  lugares?: Lugar[];
  misiones?: Mision[];
  objetos?: Objeto[];
  monstruos?: Monstruo[];
  pjs?: PJ[];
  modoApp?: ModoApp;
  onNavigateToEntity: (
    type: 'sesion' | 'npc' | 'lugar' | 'mision' | 'objeto' | 'monstruo' | 'pj',
    id: string
  ) => void;
}

interface NodeData {
  id: string;
  label: string;
  type: EntityType;
  entity: any;
  sublabel?: string;
  tags?: string[];
  color: string;
  borderColor: string;
  textColor: string;
  shape: 'round-rectangle' | 'ellipse';
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
}

const TYPE_CONFIG: Record<
  EntityType,
  {
    label: string;
    plural: string;
    color: string;
    borderColor: string;
    textColor: string;
    dotBg: string;
    icon: React.ElementType;
    shape: 'round-rectangle' | 'ellipse';
  }
> = {
  sesion: {
    label: 'Sesión',
    plural: 'Sesiones',
    color: '#334155', // Slate oscuro con borde claro
    borderColor: '#94a3b8',
    textColor: '#f8fafc',
    dotBg: 'bg-slate-400',
    icon: Calendar,
    shape: 'round-rectangle',
  },
  npc: {
    label: 'NPC',
    plural: 'NPCs',
    color: '#0369a1', // Azul suave
    borderColor: '#38bdf8',
    textColor: '#f0f9ff',
    dotBg: 'bg-sky-400',
    icon: User,
    shape: 'ellipse',
  },
  lugar: {
    label: 'Lugar',
    plural: 'Lugares',
    color: '#047857', // Verde suave
    borderColor: '#34d399',
    textColor: '#ecfdf5',
    dotBg: 'bg-emerald-400',
    icon: MapPin,
    shape: 'round-rectangle',
  },
  mision: {
    label: 'Misión',
    plural: 'Misiones',
    color: '#b45309', // Dorado / Ámbar
    borderColor: '#fbbf24',
    textColor: '#fefce8',
    dotBg: 'bg-amber-400',
    icon: Scroll,
    shape: 'round-rectangle',
  },
  objeto: {
    label: 'Objeto',
    plural: 'Objetos',
    color: '#6b21a8', // Violeta suave
    borderColor: '#c084fc',
    textColor: '#faf5ff',
    dotBg: 'bg-purple-400',
    icon: Package,
    shape: 'round-rectangle',
  },
  monstruo: {
    label: 'Monstruo',
    plural: 'Monstruos',
    color: '#991b1b', // Rojo suave
    borderColor: '#f87171',
    textColor: '#fef2f2',
    dotBg: 'bg-rose-400',
    icon: Skull,
    shape: 'ellipse',
  },
  pj: {
    label: 'Personaje',
    plural: 'Personajes (PJs)',
    color: '#0e7490', // Cyan suave
    borderColor: '#22d3ee',
    textColor: '#ecfeff',
    dotBg: 'bg-cyan-400',
    icon: ShieldCheck,
    shape: 'ellipse',
  },
};

export const MapaMentalView: React.FC<MapaMentalViewProps> = ({
  campana,
  sesiones = [],
  npcs = [],
  lugares = [],
  misiones = [],
  objetos = [],
  monstruos = [],
  pjs = [],
  modoApp = 'jugador',
  onNavigateToEntity,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  // Estados de interfaz
  const [selectedNodeData, setSelectedNodeData] = useState<NodeData | null>(null);
  const [connectedNeighbors, setConnectedNeighbors] = useState<
    Array<{ id: string; label: string; type: EntityType; edgeLabel: string }>
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Filtros de tipos de entidades
  const [visibleTypes, setVisibleTypes] = useState<Record<EntityType, boolean>>({
    sesion: true,
    npc: true,
    lugar: true,
    mision: true,
    objeto: true,
    monstruo: true,
    pj: true,
  });

  // Filtros específicos
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('');
  const [selectedSesionFilter, setSelectedSesionFilter] = useState<string>('');
  const [selectedLugarFilter, setSelectedLugarFilter] = useState<string>('');

  // Generación de etiquetas únicas
  const allTags = useMemo(() => {
    const set = new Set<string>();
    sesiones.forEach((s) => s.etiquetas?.forEach((t) => set.add(t)));
    npcs.forEach((n) => n.etiquetas?.forEach((t) => set.add(t)));
    lugares.forEach((l) => l.etiquetas?.forEach((t) => set.add(t)));
    misiones.forEach((m) => m.etiquetas?.forEach((t) => set.add(t)));
    objetos.forEach((o) => o.etiquetas?.forEach((t) => set.add(t)));
    monstruos.forEach((m) => m.etiquetas?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [sesiones, npcs, lugares, misiones, objetos, monstruos]);

  // Construcción de Nodos y Aristas
  const { allNodes, allEdges } = useMemo(() => {
    const nodes: NodeData[] = [];
    const edges: EdgeData[] = [];
    const edgeKeySet = new Set<string>();

    const addEdge = (source: string, target: string, label: string, type: string) => {
      if (!source || !target || source === target) return;
      const key = `${source}->${target}`;
      const revKey = `${target}->${source}`;
      if (edgeKeySet.has(key) || edgeKeySet.has(revKey)) return;
      edgeKeySet.add(key);

      edges.push({
        id: `e_${source}_${target}_${edges.length}`,
        source,
        target,
        label,
        type,
      });
    };

    // 1. Sesiones
    sesiones.forEach((s) => {
      nodes.push({
        id: s.id,
        label: `Sesión #${s.numero}: ${s.titulo}`,
        type: 'sesion',
        entity: s,
        sublabel: s.fecha_real || undefined,
        tags: s.etiquetas || [],
        color: TYPE_CONFIG.sesion.color,
        borderColor: TYPE_CONFIG.sesion.borderColor,
        textColor: TYPE_CONFIG.sesion.textColor,
        shape: TYPE_CONFIG.sesion.shape,
      });

      // Aristas desde la sesión hacia NPCs
      s.npc_ids?.forEach((nid) => addEdge(s.id, nid, 'Participa en', 'sesion_npc'));
      // Aristas hacia Lugares
      s.lugar_ids?.forEach((lid) => addEdge(s.id, lid, 'Visitado en', 'sesion_lugar'));
      // Aristas hacia Misiones
      s.mision_ids?.forEach((mid) => addEdge(s.id, mid, 'Avanzada en', 'sesion_mision'));
      // Aristas hacia Objetos
      s.objeto_ids?.forEach((oid) => addEdge(s.id, oid, 'Involucrado en', 'sesion_objeto'));
      // Aristas hacia Monstruos
      s.monstruo_ids?.forEach((moid) => addEdge(s.id, moid, 'Enfrentado en', 'sesion_monstruo'));
    });

    // 2. NPCs
    npcs.forEach((n) => {
      nodes.push({
        id: n.id,
        label: n.nombre,
        type: 'npc',
        entity: n,
        sublabel: n.rol || n.actitud,
        tags: n.etiquetas || [],
        color: TYPE_CONFIG.npc.color,
        borderColor: TYPE_CONFIG.npc.borderColor,
        textColor: TYPE_CONFIG.npc.textColor,
        shape: TYPE_CONFIG.npc.shape,
      });

      // Vinculaciones inversas a sesiones si no estaban
      n.sesion_ids?.forEach((sid) => addEdge(sid, n.id, 'Participa en', 'sesion_npc'));

      // NPC a Lugar (ubicación habitual que coincida con nombre o id de Lugar)
      if (n.ubicacion_habitual) {
        const matchingLugar = lugares.find(
          (l) =>
            l.id === n.ubicacion_habitual ||
            l.nombre.toLowerCase().trim() === n.ubicacion_habitual.toLowerCase().trim()
        );
        if (matchingLugar) {
          addEdge(n.id, matchingLugar.id, 'Ubicación habitual', 'npc_lugar');
        }
      }
    });

    // 3. Lugares
    lugares.forEach((l) => {
      nodes.push({
        id: l.id,
        label: l.nombre,
        type: 'lugar',
        entity: l,
        sublabel: l.tipo,
        tags: l.etiquetas || [],
        color: TYPE_CONFIG.lugar.color,
        borderColor: TYPE_CONFIG.lugar.borderColor,
        textColor: TYPE_CONFIG.lugar.textColor,
        shape: TYPE_CONFIG.lugar.shape,
      });

      // Jerarquía Lugar Padre ↔ Hijo
      if (l.padre_id) {
        addEdge(l.padre_id, l.id, 'Contiene a', 'lugar_sublugar');
      }

      // Sesiones inversas
      l.sesion_ids?.forEach((sid) => addEdge(sid, l.id, 'Visitado en', 'sesion_lugar'));
    });

    // 4. Misiones
    misiones.forEach((m) => {
      nodes.push({
        id: m.id,
        label: m.titulo,
        type: 'mision',
        entity: m,
        sublabel: m.estado,
        tags: m.etiquetas || [],
        color: TYPE_CONFIG.mision.color,
        borderColor: TYPE_CONFIG.mision.borderColor,
        textColor: TYPE_CONFIG.mision.textColor,
        shape: TYPE_CONFIG.mision.shape,
      });

      // Misión ↔ NPC Origen
      if (m.origen_npc_id) {
        addEdge(m.origen_npc_id, m.id, 'Encarga', 'npc_mision');
      }

      // Misión ↔ Lugar Origen
      if (m.origen_lugar_id) {
        addEdge(m.id, m.origen_lugar_id, 'Se desarrolla en', 'mision_lugar');
      }

      // Sesiones inversas
      m.sesion_ids?.forEach((sid) => addEdge(sid, m.id, 'Avanzada en', 'sesion_mision'));
    });

    // 5. Objetos
    objetos.forEach((o) => {
      nodes.push({
        id: o.id,
        label: o.nombre,
        type: 'objeto',
        entity: o,
        sublabel: o.tipo,
        tags: o.etiquetas || [],
        color: TYPE_CONFIG.objeto.color,
        borderColor: TYPE_CONFIG.objeto.borderColor,
        textColor: TYPE_CONFIG.objeto.textColor,
        shape: TYPE_CONFIG.objeto.shape,
      });

      // Objeto ↔ PJ (quien_lo_lleva coincide con id o nombre de PJ)
      if (o.quien_lo_lleva) {
        const carrier = o.quien_lo_lleva;
        const pjCarrier = pjs.find(
          (p) =>
            p.id === carrier ||
            p.nombre.toLowerCase().trim() === carrier.toLowerCase().trim()
        );
        if (pjCarrier) {
          addEdge(pjCarrier.id, o.id, 'Lleva', 'pj_objeto');
        }
      }

      // Sesiones inversas
      o.sesion_ids?.forEach((sid) => addEdge(sid, o.id, 'Involucrado en', 'sesion_objeto'));
    });

    // 6. Monstruos
    monstruos.forEach((mo) => {
      nodes.push({
        id: mo.id,
        label: mo.nombre,
        type: 'monstruo',
        entity: mo,
        sublabel: mo.tipo,
        tags: mo.etiquetas || [],
        color: TYPE_CONFIG.monstruo.color,
        borderColor: TYPE_CONFIG.monstruo.borderColor,
        textColor: TYPE_CONFIG.monstruo.textColor,
        shape: TYPE_CONFIG.monstruo.shape,
      });

      // Sesiones inversas
      mo.sesion_ids?.forEach((sid) => addEdge(sid, mo.id, 'Enfrentado en', 'sesion_monstruo'));
    });

    // 7. Personajes (PJs)
    pjs.forEach((pj) => {
      nodes.push({
        id: pj.id,
        label: pj.nombre,
        type: 'pj',
        entity: pj,
        sublabel: `${pj.raza || ''} ${pj.clase || ''}`.trim() || undefined,
        tags: [],
        color: TYPE_CONFIG.pj.color,
        borderColor: TYPE_CONFIG.pj.borderColor,
        textColor: TYPE_CONFIG.pj.textColor,
        shape: TYPE_CONFIG.pj.shape,
      });

      // Conexión con sesiones en las que estuvo presente
      sesiones.forEach((s) => {
        if (s.pj_ids_presentes?.includes(pj.id)) {
          addEdge(s.id, pj.id, 'Presente en', 'sesion_pj');
        }
      });
    });

    return { allNodes: nodes, allEdges: edges };
  }, [sesiones, npcs, lugares, misiones, objetos, monstruos, pjs]);

  // Filtrado de nodos y aristas
  const { filteredNodes, filteredEdges } = useMemo(() => {
    const nodeMap = new Map<string, NodeData>();
    allNodes.forEach((n) => nodeMap.set(n.id, n));

    // Determinar nodos que pasan los filtros
    const allowedNodeIds = new Set<string>();

    // Conjuntos para filtros por Sesión o Lugar
    let sessionNeighbors: Set<string> | null = null;
    if (selectedSesionFilter) {
      sessionNeighbors = new Set<string>([selectedSesionFilter]);
      allEdges.forEach((e) => {
        if (e.source === selectedSesionFilter) sessionNeighbors!.add(e.target);
        if (e.target === selectedSesionFilter) sessionNeighbors!.add(e.source);
      });
    }

    let lugarNeighbors: Set<string> | null = null;
    if (selectedLugarFilter) {
      lugarNeighbors = new Set<string>([selectedLugarFilter]);
      allEdges.forEach((e) => {
        if (e.source === selectedLugarFilter) lugarNeighbors!.add(e.target);
        if (e.target === selectedLugarFilter) lugarNeighbors!.add(e.source);
      });
    }

    allNodes.forEach((n) => {
      // 1. Filtro por tipo
      if (!visibleTypes[n.type]) return;

      // 2. Filtro por etiqueta
      if (selectedTagFilter && !n.tags?.includes(selectedTagFilter)) {
        return;
      }

      // 3. Filtro por sesión
      if (sessionNeighbors && !sessionNeighbors.has(n.id)) {
        return;
      }

      // 4. Filtro por lugar
      if (lugarNeighbors && !lugarNeighbors.has(n.id)) {
        return;
      }

      allowedNodeIds.add(n.id);
    });

    const activeNodes = allNodes.filter((n) => allowedNodeIds.has(n.id));
    const activeEdges = allEdges.filter(
      (e) => allowedNodeIds.has(e.source) && allowedNodeIds.has(e.target)
    );

    return { filteredNodes: activeNodes, filteredEdges: activeEdges };
  }, [
    allNodes,
    allEdges,
    visibleTypes,
    selectedTagFilter,
    selectedSesionFilter,
    selectedLugarFilter,
  ]);

  // Resultados de búsqueda en vivo
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return filteredNodes
      .filter((n) => {
        const nameMatch = n.label.toLowerCase().includes(q);
        const subMatch = n.sublabel?.toLowerCase().includes(q);
        const tagMatch = n.tags?.some((t) => t.toLowerCase().includes(q));
        return nameMatch || subMatch || tagMatch;
      })
      .slice(0, 8);
  }, [filteredNodes, searchQuery]);

  // Inicializar y gestionar Cytoscape
  const runLayout = useCallback((cyInstance?: Core) => {
    const cy = cyInstance || cyRef.current;
    if (!cy) return;

    const layout = cy.layout({
      name: 'cose',
      animate: true,
      animationDuration: 750,
      randomize: false,
      componentSpacing: 85,
      nodeRepulsion: () => 450000,
      nodeOverlap: 25,
      idealEdgeLength: () => 130,
      edgeElasticity: () => 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0,
      fit: true,
      padding: 50,
    } as any);

    layout.run();
  }, []);

  // Resaltar un nodo y sus conexiones
  const highlightNode = useCallback((nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;

    const targetNode = cy.getElementById(nodeId);
    if (!targetNode || targetNode.empty()) return;

    // Conexiones directas
    const connectedEdges = targetNode.connectedEdges();
    const connectedNodes = connectedEdges.connectedNodes();
    const neighborhood = targetNode.union(connectedNodes).union(connectedEdges);

    // Aplicar estilos
    cy.batch(() => {
      cy.elements().removeClass('focused-node connected-neighbor connected-edge dimmed-element');
      cy.elements().difference(neighborhood).addClass('dimmed-element');
      connectedEdges.addClass('connected-edge');
      connectedNodes.not(targetNode).addClass('connected-neighbor');
      targetNode.addClass('focused-node');
    });

    // Cargar datos de vecinos para el panel
    const rawData = targetNode.data();
    const nodeObj = allNodes.find((n) => n.id === nodeId);
    if (nodeObj) {
      setSelectedNodeData(nodeObj);

      const neighborsList: Array<{
        id: string;
        label: string;
        type: EntityType;
        edgeLabel: string;
      }> = [];

      connectedEdges.forEach((edge: EdgeSingular) => {
        const otherNode = edge.source().id() === nodeId ? edge.target() : edge.source();
        const otherData = otherNode.data();
        const otherObj = allNodes.find((n) => n.id === otherNode.id());
        if (otherObj) {
          neighborsList.push({
            id: otherObj.id,
            label: otherObj.label,
            type: otherObj.type,
            edgeLabel: edge.data('label') || 'Conectado con',
          });
        }
      });

      setConnectedNeighbors(neighborsList);
    }
  }, [allNodes]);

  // Limpiar resaltado
  const clearHighlight = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      cy.elements().removeClass('focused-node connected-neighbor connected-edge dimmed-element');
    });
    setSelectedNodeData(null);
    setConnectedNeighbors([]);
  }, []);

  // Centrar en un nodo específico
  const focusOnNode = useCallback((nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;

    const targetNode = cy.getElementById(nodeId);
    if (!targetNode || targetNode.empty()) return;

    cy.animate({
      center: { eles: targetNode },
      zoom: 1.4,
      duration: 500,
    });

    highlightNode(nodeId);
  }, [highlightNode]);

  // Montar y sincronizar elementos en Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    // Crear elementos de Cytoscape
    const cyElements = [
      ...filteredNodes.map((n) => ({
        group: 'nodes' as const,
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          color: n.color,
          borderColor: n.borderColor,
          textColor: n.textColor,
          shape: n.shape,
        },
      })),
      ...filteredEdges.map((e) => ({
        group: 'edges' as const,
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
        },
      })),
    ];

    if (!cyRef.current) {
      const cy = cytoscape({
        container: containerRef.current,
        elements: cyElements,
        boxSelectionEnabled: false,
        autounselectify: false,
        wheelSensitivity: 0.25,
        minZoom: 0.2,
        maxZoom: 3.5,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': 'data(color)',
              'border-width': 2,
              'border-color': 'data(borderColor)',
              'border-opacity': 0.9,
              shape: 'data(shape)' as any,
              label: 'data(label)',
              color: '#ffffff',
              'font-size': '11px',
              'font-family': 'system-ui, -apple-system, sans-serif',
              'font-weight': 600,
              'text-valign': 'center',
              'text-halign': 'center',
              'text-wrap': 'ellipsis',
              'text-max-width': '120px',
              'text-outline-color': '#090d16',
              'text-outline-width': 2.5,
              'text-outline-opacity': 0.95,
              width: 50,
              height: 50,
              padding: '8px',
              'transition-property': 'background-color, border-color, border-width, opacity, width, height',
              'transition-duration': 250,
            },
          },
          {
            selector: 'node[shape = "round-rectangle"]',
            style: {
              width: 95,
              height: 40,
              'corner-radius': '8px',
            },
          },
          {
            selector: 'edge',
            style: {
              width: 1.5,
              'line-color': '#475569',
              'line-opacity': 0.6,
              'target-arrow-color': '#64748b',
              'target-arrow-shape': 'triangle',
              'arrow-scale': 0.9,
              'curve-style': 'bezier',
              'transition-property': 'line-color, width, opacity',
              'transition-duration': 250,
            },
          },
          {
            selector: '.focused-node',
            style: {
              'border-width': 4,
              'border-color': '#fbbf24',
              'border-opacity': 1,
              width: 62,
              height: 62,
              'z-index': 999,
              'font-size': '13px',
              'text-outline-width': 3.5,
            },
          },
          {
            selector: 'node[shape = "round-rectangle"].focused-node',
            style: {
              width: 110,
              height: 48,
            },
          },
          {
            selector: '.connected-neighbor',
            style: {
              'border-width': 3,
              'border-color': '#fef08a',
              'border-opacity': 0.9,
              'z-index': 900,
            },
          },
          {
            selector: '.connected-edge',
            style: {
              width: 3,
              'line-color': '#fbbf24',
              'target-arrow-color': '#fbbf24',
              'line-opacity': 1,
              'z-index': 800,
            },
          },
          {
            selector: '.dimmed-element',
            style: {
              opacity: 0.12,
            },
          },
        ],
      });

      // Eventos de interacción
      let lastTapTime = 0;
      let lastTappedNodeId = '';

      cy.on('tap', 'node', (evt: EventObject) => {
        const node = evt.target as NodeSingular;
        const nodeId = node.id();
        const currentTime = new Date().getTime();
        const tapInterval = currentTime - lastTapTime;

        // Doble tap / click rápido
        if (tapInterval < 300 && lastTappedNodeId === nodeId) {
          const nodeData = allNodes.find((n) => n.id === nodeId);
          if (nodeData) {
            onNavigateToEntity(nodeData.type, nodeData.id);
          }
        } else {
          highlightNode(nodeId);
        }

        lastTapTime = currentTime;
        lastTappedNodeId = nodeId;
      });

      cy.on('tap', (evt: EventObject) => {
        if (evt.target === cy) {
          clearHighlight();
        }
      });

      cyRef.current = cy;
      runLayout(cy);
    } else {
      // Actualizar elementos existentes
      const cy = cyRef.current;
      cy.batch(() => {
        cy.elements().remove();
        cy.add(cyElements);
      });
      runLayout(cy);
    }
  }, [filteredNodes, filteredEdges, highlightNode, clearHighlight, runLayout, allNodes, onNavigateToEntity]);

  // Manejador de resize de ventana
  useEffect(() => {
    const handleResize = () => {
      if (cyRef.current) {
        cyRef.current.resize();
        cyRef.current.fit(undefined, 50);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Botón para resetear todos los filtros
  const handleResetFilters = () => {
    setVisibleTypes({
      sesion: true,
      npc: true,
      lugar: true,
      mision: true,
      objeto: true,
      monstruo: true,
      pj: true,
    });
    setSelectedTagFilter('');
    setSelectedSesionFilter('');
    setSelectedLugarFilter('');
    setSearchQuery('');
  };

  const hasActiveFilters =
    Object.values(visibleTypes).some((v) => !v) ||
    Boolean(selectedTagFilter) ||
    Boolean(selectedSesionFilter) ||
    Boolean(selectedLugarFilter);

  const totalCampaignNodes = allNodes.length;

  return (
    <div className="relative w-full rounded-xl border border-slate-800 bg-[#090d16] overflow-hidden flex flex-col min-h-[520px] h-[82dvh] sm:h-[78vh] shadow-2xl">
      {/* BARRA SUPERIOR DE HERRAMIENTAS Y BÚSQUEDA */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:p-3 bg-slate-900/90 border-b border-slate-800 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
          {/* Campo de búsqueda */}
          <div className="relative flex-1 sm:w-64 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el mapa..."
              className="w-full pl-9 pr-8 py-2 sm:py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 transition-all min-h-[40px] sm:min-h-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Dropdown de resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 divide-y divide-slate-800">
                {searchResults.map((item) => {
                  const cfg = TYPE_CONFIG[item.type];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        focusOnNode(item.id);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-slate-800 flex items-center justify-between gap-2 text-xs transition-colors min-h-[44px]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2 h-2 rounded-full ${cfg.dotBg} shrink-0`} />
                        <span className="font-semibold text-slate-200 truncate">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0">
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botón Filtros */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold border transition-colors min-h-[40px] sm:min-h-0 shrink-0 ${
              hasActiveFilters || showFilters
                ? 'bg-amber-950/60 border-amber-800/80 text-amber-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Filtros</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" />
            )}
          </button>
        </div>

        {/* Controles de vista y reordenamiento */}
        <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => runLayout()}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-amber-300 border border-slate-700 text-xs font-semibold transition-colors min-h-[40px] sm:min-h-0"
            title="Reorganizar nodos automáticamente con simulación física"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reorganizar</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          <button
            type="button"
            onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.25)}
            className="p-2 sm:p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Acercar zoom"
            aria-label="Acercar zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => cyRef.current?.zoom(cyRef.current.zoom() / 1.25)}
            className="p-2 sm:p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Alejar zoom"
            aria-label="Alejar zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => cyRef.current?.fit(undefined, 40)}
            className="p-2 sm:p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Ajustar mapa a la pantalla"
            aria-label="Ajustar mapa a la pantalla"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PANEL EXPANDIBLE DE FILTROS */}
      {showFilters && (
        <div className="bg-slate-900/95 border-b border-slate-800 p-3.5 z-20 backdrop-blur-md animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs">
            <span className="font-serif font-bold text-amber-200 uppercase tracking-wider">
              Filtros del Grafo
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-amber-400 hover:text-amber-300 hover:underline font-semibold"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* 1. Filtro por tipo con checkboxes */}
            <div className="md:col-span-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Mostrar tipos de entidad:
              </span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TYPE_CONFIG) as EntityType[]).map((type) => {
                  const cfg = TYPE_CONFIG[type];
                  const active = visibleTypes[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }))
                      }
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-all ${
                        active
                          ? 'bg-slate-800 border-slate-600 text-slate-200'
                          : 'bg-slate-950/40 border-slate-800 text-slate-600 opacity-60'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${cfg.dotBg} ${
                          active ? 'opacity-100' : 'opacity-30'
                        }`}
                      />
                      <span>{cfg.plural}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Filtro por Etiqueta */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Por Etiqueta:
              </span>
              <select
                value={selectedTagFilter}
                onChange={(e) => setSelectedTagFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">Todas las etiquetas</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Filtro por Sesión o Lugar */}
            <div className="space-y-2">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Enfoque por Sesión:
                </span>
                <select
                  value={selectedSesionFilter}
                  onChange={(e) => setSelectedSesionFilter(e.target.value)}
                  className="w-full px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Todas las sesiones</option>
                  {sesiones.map((s) => (
                    <option key={s.id} value={s.id}>
                      Sesión #{s.numero}: {s.titulo}
                    </option>
                  ))}
                </select>
              </div>

              {lugares.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Enfoque por Lugar:
                  </span>
                  <select
                    value={selectedLugarFilter}
                    onChange={(e) => setSelectedLugarFilter(e.target.value)}
                    className="w-full px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Todos los lugares</option>
                    {lugares.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nombre} ({l.tipo})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AVISO DE CAMPAÑA EXTENSA (>100 NODOS) */}
      {totalCampaignNodes > 100 && (
        <div className="bg-amber-950/40 border-b border-amber-900/50 px-4 py-1.5 flex items-center justify-between text-xs text-amber-200/90 z-10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Campaña extensa ({totalCampaignNodes} elementos). Puedes usar los filtros por sesión o tipo para una vista más despejada.
            </span>
          </div>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL DEL GRAFO CYTOSCAPE */}
      <div className="relative flex-1 w-full h-full bg-[#080c14] overflow-hidden">
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* LEYENDA EN ESQUINA INFERIOR IZQUIERDA */}
        <div className="absolute bottom-4 left-4 z-20 max-w-xs">
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur-md shadow-xl text-xs">
            <button
              type="button"
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center justify-between w-full font-serif font-bold text-slate-300 hover:text-amber-200 transition-colors pb-1"
            >
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Leyenda de Entidades</span>
              </div>
              {showLegend ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {showLegend && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 border-t border-slate-800/80">
                {(Object.keys(TYPE_CONFIG) as EntityType[]).map((type) => {
                  const cfg = TYPE_CONFIG[type];
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 ${
                          cfg.shape === 'ellipse' ? 'rounded-full' : 'rounded-xs'
                        } ${cfg.dotBg} shrink-0`}
                      />
                      <span className="text-[11px] text-slate-300">{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* PANEL LATERAL DE DETALLES DEL NODO SELECCIONADO */}
        {selectedNodeData && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bottom-2 sm:bottom-4 left-2 sm:left-auto w-auto sm:w-80 md:w-96 bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 sm:p-4 backdrop-blur-xl shadow-2xl z-30 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
            {/* Cabecera del Panel */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 truncate">
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    TYPE_CONFIG[selectedNodeData.type].dotBg
                  }`}
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    {TYPE_CONFIG[selectedNodeData.type].label}
                  </span>
                  <h3 className="font-serif text-base font-bold text-slate-100 truncate">
                    {selectedNodeData.label}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={clearHighlight}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
                title="Cerrar panel"
                aria-label="Cerrar panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido deslizable del panel */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 text-xs text-slate-300">
              {/* Resumen / Datos específicos según el tipo */}
              {selectedNodeData.type === 'sesion' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Fecha real:</span>
                    <span className="text-slate-200 font-medium">
                      {selectedNodeData.entity.fecha_real || 'Sin fecha'}
                    </span>
                  </div>
                  {selectedNodeData.entity.duracion_horas && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Duración:</span>
                      <span className="text-slate-200 font-medium">
                        {selectedNodeData.entity.duracion_horas} horas
                      </span>
                    </div>
                  )}
                  {selectedNodeData.entity.notas && (
                    <p className="mt-2 text-slate-300 line-clamp-4 leading-relaxed font-sans bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                      {selectedNodeData.entity.notas}
                    </p>
                  )}
                </div>
              )}

              {selectedNodeData.type === 'npc' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Rol:</span>
                    <span className="text-slate-200 font-medium">{selectedNodeData.entity.rol || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Actitud:</span>
                    <span className="text-slate-200 font-medium capitalize">{selectedNodeData.entity.actitud || 'Neutral'}</span>
                  </div>
                  {selectedNodeData.entity.ubicacion_habitual && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Ubicación:</span>
                      <span className="text-slate-200 font-medium">{selectedNodeData.entity.ubicacion_habitual}</span>
                    </div>
                  )}
                  {selectedNodeData.entity.descripcion && (
                    <p className="mt-2 text-slate-300 line-clamp-4 leading-relaxed font-sans bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                      {selectedNodeData.entity.descripcion}
                    </p>
                  )}
                </div>
              )}

              {selectedNodeData.type === 'lugar' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Tipo:</span>
                    <span className="text-slate-200 font-medium capitalize">{selectedNodeData.entity.tipo}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Estado:</span>
                    <span className="text-slate-200 font-medium capitalize">{selectedNodeData.entity.estado}</span>
                  </div>
                  {selectedNodeData.entity.descripcion && (
                    <p className="mt-2 text-slate-300 line-clamp-4 leading-relaxed font-sans bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                      {selectedNodeData.entity.descripcion}
                    </p>
                  )}
                </div>
              )}

              {selectedNodeData.type === 'mision' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Estado:</span>
                    <span className="text-slate-200 font-medium capitalize">{selectedNodeData.entity.estado}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Pasos:</span>
                    <span className="text-slate-200 font-medium">
                      {selectedNodeData.entity.pasos?.filter((p: any) => p.completado).length || 0} / {selectedNodeData.entity.pasos?.length || 0} completados
                    </span>
                  </div>
                  {selectedNodeData.entity.descripcion && (
                    <p className="mt-2 text-slate-300 line-clamp-4 leading-relaxed font-sans bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                      {selectedNodeData.entity.descripcion}
                    </p>
                  )}
                </div>
              )}

              {selectedNodeData.type === 'objeto' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Tipo:</span>
                    <span className="text-slate-200 font-medium capitalize">{selectedNodeData.entity.tipo}</span>
                  </div>
                  {selectedNodeData.entity.quien_lo_lleva && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Portador:</span>
                      <span className="text-slate-200 font-medium">{selectedNodeData.entity.quien_lo_lleva}</span>
                    </div>
                  )}
                  {selectedNodeData.entity.descripcion && (
                    <p className="mt-2 text-slate-300 line-clamp-4 leading-relaxed font-sans bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                      {selectedNodeData.entity.descripcion}
                    </p>
                  )}
                </div>
              )}

              {selectedNodeData.type === 'monstruo' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Tipo:</span>
                    <span className="text-slate-200 font-medium capitalize">{selectedNodeData.entity.tipo}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Encuentros:</span>
                    <span className="text-slate-200 font-medium">{selectedNodeData.entity.veces_encontrado || 1}</span>
                  </div>
                  {selectedNodeData.entity.descripcion && (
                    <p className="mt-2 text-slate-300 line-clamp-4 leading-relaxed font-sans bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                      {selectedNodeData.entity.descripcion}
                    </p>
                  )}
                </div>
              )}

              {selectedNodeData.type === 'pj' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Raza y Clase:</span>
                    <span className="text-slate-200 font-medium">
                      {selectedNodeData.entity.raza} {selectedNodeData.entity.clase}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Nivel y PG:</span>
                    <span className="text-slate-200 font-medium">
                      Nivel {selectedNodeData.entity.nivel || 1} • {selectedNodeData.entity.pg_max || 10} PG
                    </span>
                  </div>
                </div>
              )}

              {/* Etiquetas */}
              {selectedNodeData.tags && selectedNodeData.tags.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Etiquetas:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedNodeData.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* NOTAS SECRETAS DEL DM (Solo si modoApp === 'dm') */}
              {modoApp === 'dm' && selectedNodeData.entity.notas_dm && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/60 text-amber-100">
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-amber-300">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Notas del DM:</span>
                  </div>
                  <p className="font-sans leading-relaxed text-[11px] whitespace-pre-wrap">
                    {selectedNodeData.entity.notas_dm}
                  </p>
                </div>
              )}

              {/* Lista de conexiones directas */}
              {connectedNeighbors.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Conexiones ({connectedNeighbors.length}):
                  </span>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {connectedNeighbors.map((item) => {
                      const cfg = TYPE_CONFIG[item.type];
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => focusOnNode(item.id)}
                          className="w-full text-left p-1.5 rounded-md hover:bg-slate-800/80 flex items-center justify-between gap-2 transition-colors group"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-2 h-2 rounded-full ${cfg.dotBg} shrink-0`} />
                            <span className="text-slate-200 group-hover:text-amber-200 truncate">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {item.edgeLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Pie del Panel: Botón para Ver Ficha Completa */}
            <div className="pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onNavigateToEntity(selectedNodeData.type, selectedNodeData.id)}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs shadow-md transition-all active:scale-98 min-h-[44px]"
              >
                <span>Ver ficha completa</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
