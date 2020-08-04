import { Event, Disposable, Deferred } from '@ali/ide-core-common';
import { IWidgetGroup, IWidget } from './resize';
import { ITerminalClient } from './client';
import { TerminalOptions, ITerminalInfo } from './pty';

export interface ITerminalExternalClient {
  readonly id: string;
  readonly processId: Promise<number | undefined>;
  readonly name: string;
  show(preserveFocus?: boolean): void;
  hide(): void;
  dispose(): void;
}

export interface IBoundSize {
  width: number;
  height: number;
}

export const ITerminalController = Symbol('ITerminalController');
export interface ITerminalController extends Disposable {
  ready: Deferred<void>;
  focused: boolean;
  clients: Map<string, ITerminalClient>;
  themeBackground: string;
  firstInitialize(): void;
  recovery(history: ITerminalBrowserHistory): Promise<void>;
  reconnect(): Promise<void>;
  focus(): void;
  blur(): void;
  findClientFromWidgetId(widgetId: string): ITerminalClient | undefined;
  createClientWithWidget(options: TerminalOptions): ITerminalClient;
  clearCurrentGroup(): void;
  clearAllGroups(): void;
  showTerminalPanel(): void;
  hideTerminalPanel(): void;
  toJSON(): ITerminalBrowserHistory;

  onDidOpenTerminal: Event<ITerminalInfo>;
  onDidCloseTerminal: Event<string>;
  onDidChangeActiveTerminal: Event<string>;
}

export const ITerminalSearchService = Symbol('ITerminalSearchService');
export interface ITerminalSearchService {
  show: boolean;
  input: string;
  open(): void;
  clear(): void;
  close(): void;
  search(): void;
  onOpen: Event<void>;
}

export const ITerminalGroupViewService = Symbol('ITerminalGroupViewService');
export interface ITerminalGroupViewService {
  currentGroupIndex: number;
  currentGroupId: string;
  currentWidgetId: string;
  currentGroup: IWidgetGroup;
  currentWidget: IWidget;
  groups: IWidgetGroup[];

  createGroup(): number;
  getGroup(index: number): IWidgetGroup;
  selectGroup(index: number): void;
  removeGroup(index: number): void;

  createWidget(group: IWidgetGroup, id?: string, reuse?: boolean, isSimpleWidget?: boolean): IWidget;
  getWidget(id: string): IWidget;
  selectWidget(widgetId: string): void;
  removeWidget(id: string): void;

  onWidgetCreated: Event<IWidget>;
  onWidgetSelected: Event<IWidget>;
  onWidgetDisposed: Event<IWidget>;
  onWidgetEmpty: Event<void>;

  empty(): boolean;
  clear(): void;
}

export interface ITerminalBrowserHistory {
  current: string | undefined;
  groups: (string[] | { clientId: string }[])[];
}
