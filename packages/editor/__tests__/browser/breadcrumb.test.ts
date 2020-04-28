import { MockInjector } from '../../../../tools/dev-tool/src/mock-injector';
import { createBrowserInjector } from '../../../../tools/dev-tool/src/injector-helper';
import { IFileServiceClient, URI, Emitter, SymbolKind, IEventBus } from '@ali/ide-core-browser';
import { DocumentSymbol, DocumentSymbolChangedEvent } from '@ali/ide-editor/lib/browser/breadcrumb/document-symbol';
import { IEditorDocumentModelService, WorkbenchEditorService } from '@ali/ide-editor/lib/browser';
import { IWorkspaceService } from '@ali/ide-workspace/lib/common';
import { LabelService } from '@ali/ide-core-browser/lib/services';
import { BreadCrumbServiceImpl } from '@ali/ide-editor/lib/browser/breadcrumb';

describe('breadcrumb test', () => {

  let injector: MockInjector;

  beforeEach(() => {
    injector = createBrowserInjector([]);
  });

  afterEach(() => {
    injector.disposeAll();
  });

  it('breadcrumb test', async  (done) => {
    injector.mockService(IFileServiceClient, {
      getFileStat: (uriString: string) => {
        if (uriString.endsWith('testDir1')) {
          return {
            children: [
              {
                uri: 'file:///testDir1/testDir2',
                isDirectory: true,
              },
              {
                uri: 'file:///testDir1/file1.ts',
                isDirectory: false,
              },
            ],
          };
        } else {
          if (uriString.endsWith('testDir2')) {
            return {
              children: [
                {
                  uri: 'file:///testDir1/testDir2/file2.ts',
                  isDirectory: false,
                },
                {
                  uri: 'file:///testDir1/testDir2/file3.ts',
                  isDirectory: false,
                },
              ],
            };
          }
        }
       },
    });

    injector.mockService(IEditorDocumentModelService, {
      createModelReference: (uri) => {
        return {
          instance: {
            uri,
            getMonacoModel: () => {
              return {
                uri,
              };
            },
          },
          dispose: jest.fn(),
        };
      },
    });

    injector.mockService(WorkbenchEditorService, {});

    const labelService = injector.get(LabelService);
    labelService.getIcon = () => 'icon';

    injector.mockService(IWorkspaceService, {
      workspace: {
        uri: new URI('file:///'),
      },
    });

    const onDidChangeEmitter = new Emitter<void>();

    const testDS: DocumentSymbol[] = [
      {
        name: 'test1',
        detail: 'test1Detail',
        kind: SymbolKind.Class,
        containerName: 'test Class',
        range: {
          startColumn: 1,
          endColumn: 10,
          startLineNumber: 1,
          endLineNumber: 10,
        },
        selectionRange: {
          startColumn: 1,
          endColumn: 10,
          startLineNumber: 1,
          endLineNumber: 10,
        },
        children: [
          {
            name: 'test1Method',
            detail: 'test1MethodDetail',
            kind: SymbolKind.Method,
            containerName: 'test1Method',
            range: {
              startColumn: 4,
              endColumn: 5,
              startLineNumber: 2,
              endLineNumber: 4,
            },
            selectionRange: {
              startColumn: 4,
              endColumn: 5,
              startLineNumber: 2,
              endLineNumber: 4,
            },
          },
        ],
      },
      {
        name: 'test2',
        detail: 'test2Detail',
        kind: SymbolKind.Class,
        containerName: 'test2 Class',
        range: {
          startColumn: 1,
          endColumn: 11,
          startLineNumber: 1,
          endLineNumber: 21,
        },
        selectionRange: {
          startColumn: 1,
          endColumn: 11,
          startLineNumber: 1,
          endLineNumber: 21,
        },
        children: [
          {
            name: 'test2Method',
            detail: 'test2MethodDetail',
            kind: SymbolKind.Method,
            containerName: 'test2Method',
            range: {
              startColumn: 4,
              endColumn: 5,
              startLineNumber: 12,
              endLineNumber: 14,
            },
            selectionRange: {
              startColumn: 4,
              endColumn: 5,
              startLineNumber: 12,
              endLineNumber: 14,
            },
          },
        ],
      },
    ];

    (global as any).monaco = {
      modes: {
        DocumentSymbolProviderRegistry: {
          onDidChange: onDidChangeEmitter.event,
          all: () => {
            return [{
              provideDocumentSymbols: (model) => {
                return testDS;
              },
            }];
          },
        },
      },
    };

    const service: BreadCrumbServiceImpl = injector.get(BreadCrumbServiceImpl);

    const res = service.getBreadCrumbs(new URI('file:///testDir1/testDir2/file2.ts'), null)!;

    expect(res.length).toBe(3);
    expect(res[0].name).toBe('testDir1');
    expect(res[1].name).toBe('testDir2');
    expect(res[2].name).toBe('file2.ts');
    // expect(res[3].name).toBe('...');

    const siblingsForTestDir2 = await res[1].getSiblings!();
    expect(siblingsForTestDir2.parts.length).toBe(2);
    expect(siblingsForTestDir2.currentIndex).toBe(0);

    const childrenForTestDir2 = await res[1].getChildren!();
    expect(childrenForTestDir2.length).toBe(2);

    service.getBreadCrumbs(new URI('file:///testDir1/testDir2/file2.ts'), {
      monacoEditor: {
        getPosition: () => {
          return {
            lineNumber: 3,
            column: 10,
          };
        },
        onDidDispose: jest.fn(),
      },
    } as any)!;

    const eventBus: IEventBus = injector.get(IEventBus);

    eventBus.on(DocumentSymbolChangedEvent, async () => {
      const res2 = service.getBreadCrumbs(new URI('file:///testDir1/testDir2/file2.ts'), {
        monacoEditor: {
          getPosition: () => {
            return {
              lineNumber: 3,
              column: 10,
            };
          },
          onDidDispose: jest.fn(),
        },
      } as any)!;
      if (res2.length !== 5) {
        return;
      }
      expect(res2.length).toBe(5);
      expect(res2[3].name).toBe('test1');
      expect(res2[4].name).toBe('test1Method');

      const sib = await res2[3].getSiblings!();
      expect(sib.parts.length).toBe(2);
      expect(sib.currentIndex).toBe(0);

      const c = await sib.parts[1].getChildren!();
      expect(c.length).toBe(1);

      done();
    });
  });

});