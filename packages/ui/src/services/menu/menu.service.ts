/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createIdentifier, Disposable, ILogService, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { IShortcutService } from '../shortcut/shortcut.service';
import { mergeMenuConfigs } from '../../common/menu-merge-configs';
import type { IDisplayMenuItem, IMenuItem, MenuConfig } from './menu';
import { MenuPosition } from './menu';
import { IMenuManagerService } from './menu-manager.service';
import { ContextMenuGroup, RibbonOthersGroup } from './types';

/** @deprecated */
export const IMenuService = createIdentifier<IMenuService>('univer.menu-service');

/**
 * Breaking changes to IMenuService are expected in the next version. Use with caution. by @jikkai
 * @deprecated
 */
export interface IMenuService {
    menuChanged$: Observable<void>;

    /** @deprecated */
    addMenuItem(item: IMenuItem, config: MenuConfig): IDisposable;

    /** @deprecated */
    setMenuItem(item: IMenuItem): void;

    /** Get menu items for display at a given position or a submenu. */
    /** @deprecated */
    getMenuItems(position: MenuPosition | string): Array<IDisplayMenuItem<IMenuItem>>;
    /** @deprecated */
    getMenuItem(id: string): IMenuItem | null;
}

/** @deprecated */
export class MenuService extends Disposable implements IMenuService {
    /** @deprecated */
    private readonly _menuItemMap = new Map<string, IMenuItem>();

    /** @deprecated */
    private readonly _menuByPositions = new Map<MenuPosition | string, Array<[string, IMenuItem]>>();

    /** @deprecated */
    private readonly _menuConfigs = new Map<string, MenuConfig>();

    private _menuChanged$ = new BehaviorSubject<void>(undefined);

    menuChanged$: Observable<void> = this._menuChanged$.asObservable();

    constructor(
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @ILogService protected readonly _logService: ILogService
    ) {
        super();
    }

    override dispose(): void {
        this._menuItemMap.clear();
        this._menuChanged$.complete();
    }

    /** @deprecated */
    addMenuItem(item: IMenuItem, config: MenuConfig): IDisposable {
        this._logService.warn('[MenuService]: MenuService is deprecated, please use MenuManagerService instead.');
        if (this._menuItemMap.has(item.id)) {
            throw new Error(`Menu item with the same id ${item.id} has already been added!`);
        }

        const menuItemConfig = config?.[item.id];

        this._menuItemMap.set(item.id, mergeMenuConfigs(item, menuItemConfig));

        if (Array.isArray(item.positions)) {
            item.positions.forEach((menu) => this._appendMenuToPosition(item, menu));
        } else if (item.positions) {
            this._appendMenuToPosition(item, item.positions);
        }

        // TODO: Compatible with old menu service
        [
            MenuPosition.TOOLBAR_START,
            MenuPosition.TOOLBAR_INSERT,
            MenuPosition.TOOLBAR_FORMULAS,
            MenuPosition.TOOLBAR_DATA,
            MenuPosition.TOOLBAR_VIEW,
            MenuPosition.TOOLBAR_OTHERS,
            MenuPosition.CONTEXT_MENU,
        ].forEach((position) => {
            if (position !== MenuPosition.CONTEXT_MENU) {
                const menus = this.getMenuItems(position);
                menus.forEach((menu) => {
                    this._menuManagerService.mergeMenu({
                        [position]: {
                            [menu.group ?? RibbonOthersGroup.OTHERS]: {
                                [menu.id]: {
                                    menuItemFactory: () => menu,
                                },
                            },
                        },
                    });
                });
            } else {
                const menus = this.getMenuItems(position);
                menus.forEach((menu) => {
                    this._menuManagerService.mergeMenu({
                        [position]: {
                            [menu.group ?? ContextMenuGroup.OTHERS]: {
                                [menu.id]: {
                                    menuItemFactory: () => menu,
                                },
                            },
                        },
                    });
                });
            }
        });

        this._menuChanged$.next();

        return toDisposable(() => {
            this._menuItemMap.delete(item.id);

            if (Array.isArray(item.positions)) {
                item.positions.forEach((menu) => {
                    const menus = this._menuByPositions.get(menu);
                    if (!menus) {
                        return;
                    }

                    const index = menus.findIndex((m) => m[0] === item.id);
                    if (index > -1) {
                        menus.splice(index, 1);
                    }
                });
            } else if (item.positions) {
                const menus = this._menuByPositions.get(item.positions);
                if (!menus) {
                    return;
                }

                const index = menus.findIndex((m) => m[0] === item.id);
                if (index > -1) {
                    menus.splice(index, 1);
                }
            }

            this._menuChanged$.next();
        });
    }

    /** @deprecated */
    getMenuItems(positions: MenuPosition | string): Array<IDisplayMenuItem<IMenuItem>> {
        this._logService.warn('[MenuService]: MenuService is deprecated, please use MenuManagerService instead.');
        // TODO: @wzhudev: compose shortcut to returned menu items.
        if (this._menuByPositions.has(positions)) {
            const menuItems = this._menuByPositions.get(positions);

            if (menuItems) {
                return [...menuItems.values()].map((menu) => this._getDisplayMenuItems(menu[1]));
            }
        }

        return [] as Array<IDisplayMenuItem<IMenuItem>>;
    }

    /** @deprecated */
    setMenuItem(item: IMenuItem): void {
        this._logService.warn('[MenuService]: MenuService is deprecated, please use MenuManagerService instead.');
        this._menuItemMap.set(item.id, item);
        if (Array.isArray(item.positions)) {
            item.positions.forEach((menu) => this._updateMenuItems(item, menu));
        } else if (item.positions) {
            this._updateMenuItems(item, item.positions);
        }

        this._menuChanged$.next();
    }

    /** @deprecated */
    getMenuItem(id: string): IMenuItem | null {
        this._logService.warn('[MenuService]: MenuService is deprecated, please use MenuManagerService instead.');
        if (this._menuItemMap.has(id)) {
            return this._menuItemMap.get(id)!;
        }

        return null;
    }

    /** @deprecated */
    setMenuConfigs(id: string, config: MenuConfig): void {
        this._logService.warn('[MenuService]: MenuService is deprecated, please use MenuManagerService instead.');
        this._menuConfigs.set(id, config);
    }

    /** @deprecated */
    getMenuConfig(id: string): MenuConfig | null {
        this._logService.warn('[MenuService]: MenuService is deprecated, please use MenuManagerService instead.');
        if (this._menuConfigs.has(id)) {
            return this._menuConfigs.get(id)!;
        }

        return null;
    }

    /** @deprecated */
    private _getDisplayMenuItems(menuItem: IMenuItem): IDisplayMenuItem<IMenuItem> {
        this._logService.warn('[MenuService]: MenuService is deprecated, please use MenuManagerService instead.');
        const shortcut = this._shortcutService.getShortcutDisplayOfCommand(menuItem.id);
        if (!shortcut) {
            return menuItem;
        }

        return {
            ...menuItem,
            shortcut,
        };
    }

    /** @deprecated */
    private _appendMenuToPosition(menu: IMenuItem, position: MenuPosition | string) {
        this._logService.warn('[MenuService]: MenuService is deprecated, please use MenuManagerService instead.');
        if (!this._menuByPositions.has(position)) {
            this._menuByPositions.set(position, []);
        }

        const menuList = this._menuByPositions.get(position)!;
        if (menuList.findIndex((m) => m[0] === menu.id) > -1) {
            throw new Error(`Menu item with the same id ${menu.id} has already been added!`);
        }

        menuList.push([menu.id, menu]);
    }

    /** @deprecated */
    private _updateMenuItems(menu: IMenuItem, position: MenuPosition | string) {
        this._logService.warn('[MenuService]: MenuService is deprecated, please use MenuManagerService instead.');
        if (!this._menuByPositions.has(position)) {
            this._menuByPositions.set(position, []);
        }

        const menuList = this._menuByPositions.get(position)!;
        const index = menuList.findIndex((m) => m[0] === menu.id);
        if (index > -1) {
            menuList[index] = [menu.id, menu];
        } else {
            menuList.push([menu.id, menu]);
        }
    }
}
