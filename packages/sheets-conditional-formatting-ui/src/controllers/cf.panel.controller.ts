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

import type { IDisposable } from '@univerjs/core';
import { Disposable, generateRandomId, Inject, Injector, IUniverInstanceService, LifecycleStages, LocaleService, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { ComponentManager, ISidebarService } from '@univerjs/ui';
import type { IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import { ConditionFormattingPanel } from '../components/panel';

const CF_PANEL_KEY = 'sheet.conditional.formatting.panel';
@OnLifecycle(LifecycleStages.Ready, ConditionalFormattingPanelController)
export class ConditionalFormattingPanelController extends Disposable {
    private _sidebarDisposable: IDisposable | null = null;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(ISidebarService) private _sidebarService: ISidebarService,
        @Inject(LocaleService) private _localeService: LocaleService
    ) {
        super();

        this._initPanel();

        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((sheet) => {
                if (!sheet) this._sidebarDisposable?.dispose();
            })
        );
    }

    openPanel(rule?: IConditionFormattingRule) {
        const props = {
            header: { title: this._localeService.t('sheet.cf.title') },
            children: {
                label: CF_PANEL_KEY,
                rule,
                key: generateRandomId(4),
            },
            onClose: () => this._sidebarDisposable = null,
        };

        this._sidebarDisposable = this._sidebarService.open(props);
    }

    private _initPanel() {
        this._componentManager.register(CF_PANEL_KEY, ConditionFormattingPanel);
    }
}
