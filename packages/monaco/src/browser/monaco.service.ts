import { Injectable, Autowired, INJECTOR_TOKEN, Injector } from '@ali/common-di';
import { Disposable } from '@ali/ide-core-browser';
import { Emitter as EventEmitter, Event } from '@ali/ide-core-common';

import { loadMonaco } from './monaco-loader';
import { MonacoService, ServiceNames } from '../common';
import { TextmateService } from './textmate.service';

@Injectable()
export default class MonacoServiceImpl extends Disposable implements MonacoService  {
  @Autowired(INJECTOR_TOKEN)
  protected injector: Injector;

  @Autowired()
  private textMateService: TextmateService;

  private loadingPromise!: Promise<any>;

  private _onMonacoLoaded = new EventEmitter<boolean>();

  public onMonacoLoaded: Event<boolean> = this._onMonacoLoaded.event;

  private overrideServices = {};

  constructor() {
    super();
  }

  public async createCodeEditor(
    monacoContainer: HTMLElement,
    options?: monaco.editor.IEditorConstructionOptions,
    overrides: {[key: string]: any} = {},
  ): Promise<monaco.editor.IStandaloneCodeEditor> {
    const editor =  monaco.editor.create(monacoContainer, {
      glyphMargin: true,
      lightbulb: {
        enabled: true,
      },
      automaticLayout: true,
      model: null,
      wordBasedSuggestions: false,
      renderLineHighlight: 'none',
      ...options,
    }, { ...this.overrideServices, ...overrides});
    return editor;
  }

  public async createDiffEditor(
    monacoContainer: HTMLElement,
    options?: monaco.editor.IDiffEditorConstructionOptions,
    overrides: {[key: string]: any} = {},
  ): Promise<monaco.editor.IDiffEditor> {
    const editor =  monaco.editor.createDiffEditor(monacoContainer, {
      glyphMargin: true,
      lightbulb: {
        enabled: true,
      },
      automaticLayout: true,
      wordBasedSuggestions: false,
      renderLineHighlight: 'none',
      ignoreTrimWhitespace: false,
      ...options,
    } as any, { ...this.overrideServices, ...overrides});
    return editor;
  }

  public registerOverride(serviceName: ServiceNames, service: any) {
    this.overrideServices[serviceName] = service;
  }

  public getOverride(serviceName: ServiceNames) {
    return this.overrideServices[serviceName];
  }

  /**
   * 加载monaco代码，加载过程只会执行一次
   */
  public async loadMonaco() {
    if (!this.loadingPromise) {
      this.loadingPromise = loadMonaco().then(() => {
        // TODO 改成eventbus
        this._onMonacoLoaded.fire(true);
      });
    }
    return this.loadingPromise;
  }

  public testTokenize(text: string, languageId: string) {
    this.textMateService.testTokenize(text, languageId);
  }
}
