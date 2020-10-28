import { OutlineRoot, OutlineCompositeTreeNode, OutlineTreeNode } from '@ali/ide-outline/lib/browser/outline-node.define';
import { OutlineTreeService } from '@ali/ide-outline/lib/browser/services/outline-tree.service';
import { INormalizedDocumentSymbol } from '@ali/ide-editor/lib/browser/breadcrumb/document-symbol';
import { SymbolKind } from '@ali/ide-core-common';

describe('OutlineCompositeTreeNode', () => {
  let rootNode: OutlineRoot;
  let node: OutlineCompositeTreeNode;

  const mockOutlineTreeService = {
    resolveChildren: jest.fn((parent?: any) => {
      if (!parent.raw) {
      return [new OutlineCompositeTreeNode(mockOutlineTreeService, rootNode, mockRaw, '')];
      }
    }) as any,
  } as OutlineTreeService;

  const mockRaw = {
    children: [],
    name: 'test',
    id: 'id',
    detail: '',
    kind: SymbolKind.Boolean,
    range: {
      startColumn: 0,
      endColumn: 10,
      startLineNumber: 2,
      endLineNumber: 2,
    },
    selectionRange: {
      startColumn: 0,
      endColumn: 10,
      startLineNumber: 2,
      endLineNumber: 2,
    },
  } as INormalizedDocumentSymbol;

  beforeAll(() => {
    rootNode = new OutlineRoot(mockOutlineTreeService);
    node = new OutlineCompositeTreeNode(mockOutlineTreeService, rootNode, mockRaw, '');
  });

  it('should have correct property', () => {
    expect(node.parent).toEqual(rootNode);
    expect(node.expanded).toBeTruthy();
    expect(node.displayName).toBe(mockRaw.name);
    expect(node.whenReady).toBeDefined();

  });

  it('expanded node should be init correctly', () => {
    expect(mockOutlineTreeService.resolveChildren).toBeCalledTimes(1);
  });
});

describe('OutlineTreeNode', () => {
  let rootNode: OutlineRoot;
  let node: OutlineTreeNode;

  const mockOutlineTreeService = {
    resolveChildren: jest.fn(() => [new OutlineCompositeTreeNode(mockOutlineTreeService, rootNode, mockRaw, '')]) as any,
  } as OutlineTreeService;

  const mockRaw = {
    children: [],
    name: 'test',
    id: 'id',
    detail: '',
    kind: SymbolKind.Boolean,
    range: {
      startColumn: 0,
      endColumn: 10,
      startLineNumber: 2,
      endLineNumber: 2,
    },
    selectionRange: {
      startColumn: 0,
      endColumn: 10,
      startLineNumber: 2,
      endLineNumber: 2,
    },
  } as INormalizedDocumentSymbol;

  beforeAll(() => {
    rootNode = new OutlineRoot(mockOutlineTreeService);
    node = new OutlineTreeNode(mockOutlineTreeService, rootNode, mockRaw, '');
  });

  it('should have correct property', () => {
    expect(node.parent).toEqual(rootNode);
    expect(node.displayName).toBe(mockRaw.name);
  });
});