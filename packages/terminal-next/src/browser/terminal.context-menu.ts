import { Injectable, Autowired } from '@ali/common-di';
import { Disposable } from '@ali/ide-core-common';
import { AbstractMenuService, IMenu, ICtxMenuRenderer, generateMergedCtxMenu } from '@ali/ide-core-browser/lib/menu/next';
import { memoize, IContextKeyService } from '@ali/ide-core-browser';
import { MenuId } from '../common/menu';

@Injectable()
export class TerminalContextMenuService extends Disposable {
  @Autowired(AbstractMenuService)
  private readonly menuService: AbstractMenuService;

  @Autowired(ICtxMenuRenderer)
  private readonly ctxMenuRenderer: ICtxMenuRenderer;

  @Autowired(IContextKeyService)
  private contextKeyService: IContextKeyService;

  @memoize get contextMenu(): IMenu {
    const contributedContextMenu = this.menuService.createMenu(MenuId.TermPanel, this.contextKeyService);
    this.addDispose(contributedContextMenu);
    return contributedContextMenu;
  }

  onContextMenu(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();

    const { x, y } = event.nativeEvent;
    const menus = this.contextMenu;
    const menuNodes = generateMergedCtxMenu({ menus });

    this.ctxMenuRenderer.show({
      anchor: { x, y },
      menuNodes,
      args: [],
    });
  }

  @memoize get tabContextMenu(): IMenu {
    const contributedContextMenu = this.menuService.createMenu(MenuId.TermTab, this.contextKeyService);
    this.addDispose(contributedContextMenu);
    return contributedContextMenu;
  }

  onTabContextMenu(event: React.MouseEvent<HTMLElement>, index: number) {
    event.preventDefault();

    const { x, y } = event.nativeEvent;
    const menus = this.tabContextMenu;
    const menuNodes = generateMergedCtxMenu({ menus });

    this.ctxMenuRenderer.show({
      anchor: { x, y },
      menuNodes,
      args: [ event.target, index ],
    });
  }
}