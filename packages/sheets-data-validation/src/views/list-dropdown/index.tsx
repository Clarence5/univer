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

import { DataValidationRenderMode, DataValidationType, ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType, useDependency } from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import { RectPopup, Scrollbar } from '@univerjs/design';
import { RichTextEditingMutation } from '@univerjs/docs';
import { getPlainTextFormDocument } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { CheckMarkSingle } from '@univerjs/icons';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { KeyCode, useObservable } from '@univerjs/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { debounceTime } from 'rxjs';
import type { DocumentDataModel } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ISetRangeValuesCommandParams } from '@univerjs/sheets';
import { OpenValidationPanelOperation } from '../../commands/operations/data-validation.operation';
import { DROP_DOWN_DEFAULT_COLOR } from '../../common/const';
import { deserializeListOptions, getDataValidationCellValue, serializeListOptions } from '../../validators/util';
import styles from './index.module.less';
import type { IDropdownComponentProps } from '../../services/dropdown-manager.service';
import type { ListMultipleValidator } from '../../validators/list-multiple-validator';

interface ISelectListProps {
    value: string[];
    onChange: (val: string[]) => void;
    multiple?: boolean;
    options: { label: string;value: string; color?: string }[];
    title?: string;
    onEdit?: () => void;
    style?: React.CSSProperties;
    filter?: string;
}

const SelectList = (props: ISelectListProps) => {
    const { value, onChange, multiple, options, title, onEdit, style, filter } = props;
    const localeService = useDependency(LocaleService);
    const lowerFilter = filter?.toLowerCase();
    const filteredOptions = options.filter((item) => lowerFilter ? item.label.toLowerCase().includes(lowerFilter) : true);

    return (
        <div className={styles.dvListDropdown} style={style}>
            <div className={styles.dvListDropdownTitle}>
                {title}
            </div>
            <div className={styles.dvListDropdownList}>
                <Scrollbar key={filter}>
                    <div className={styles.dvListDropdownListContainer}>
                        {filteredOptions.map((item, i) => {
                            const selected = value.indexOf(item.value) > -1;
                            const handleClick = () => {
                                let set: Set<string>;
                                if (selected) {
                                    set = new Set(value.filter((sub) => sub !== item.value));
                                } else {
                                    set = new Set(multiple ? [...value, item.value] : [item.value]);
                                }
                                const newValue: string[] = [];
                                options.forEach((opt) => {
                                    if (set.has(opt.value)) {
                                        newValue.push(opt.value);
                                    }
                                });

                                onChange(newValue);
                            };

                            const index = item.label.toLocaleLowerCase().indexOf(lowerFilter!);
                            return (
                                <div key={i} className={styles.dvListDropdownItemContainer} onClick={handleClick}>
                                    <div className={styles.dvListDropdownItem} style={{ background: item.color || DROP_DOWN_DEFAULT_COLOR }}>
                                        {lowerFilter && item.label.toLowerCase().includes(lowerFilter)
                                            ? (
                                                <>
                                                    <span>{item.label.substring(0, index)}</span>
                                                    <span style={{ fontWeight: 'bold' }}>{item.label.substring(index, index + lowerFilter.length)}</span>
                                                    <span>{item.label.substring(index + lowerFilter.length)}</span>
                                                </>
                                            )
                                            : item.label}
                                    </div>
                                    <div className={styles.dvListDropdownSelectedIcon}>
                                        {selected ? <CheckMarkSingle /> : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Scrollbar>
            </div>
            <div className={styles.dvListDropdownSplit} />
            <div className={styles.dvListDropdownEdit}>
                <a onClick={onEdit}>{localeService.t('dataValidation.list.edit')}</a>
            </div>
        </div>
    );
};

export function ListDropDown(props: IDropdownComponentProps) {
    const { location, hideFn } = props;
    const { worksheet, row, col, unitId, subUnitId } = location;
    const dataValidationModel = useDependency(DataValidationModel);
    const [editingText, setEditingText] = useState('');
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const [localValue, setLocalValue] = useState('');
    const editorBridgeService = useDependency(IEditorBridgeService);
    const instanceService = useDependency(IUniverInstanceService);
    const ruleChange$ = useMemo(() => dataValidationModel.ruleChange$.pipe(debounceTime(16)), []);
    useObservable(ruleChange$);
    const anchorRect = RectPopup.useContext();
    const cellWidth = anchorRect.right - anchorRect.left;

    useEffect(() => {
        const dispose = commandService.onCommandExecuted((command) => {
            if (command.id === RichTextEditingMutation.id) {
                const params = command.params as IRichTextEditingMutationParams;
                const { unitId } = params;
                const unit = instanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
                if (!unit) {
                    return;
                }
                const text = getPlainTextFormDocument(unit.getSnapshot());
                setEditingText(text);
            }
        });

        return () => {
            dispose.dispose();
        };
    }, [commandService, instanceService]);

    if (!worksheet) {
        return null;
    }

    const cellData = worksheet.getCell(row, col);
    const rule = cellData?.dataValidation?.rule;
    const validator = cellData?.dataValidation?.validator as ListMultipleValidator | undefined;
    const showColor = rule?.renderMode === DataValidationRenderMode.CUSTOM || rule?.renderMode === undefined;

    if (!cellData || !rule || !validator || validator.id.indexOf(DataValidationType.LIST) !== 0) {
        return;
    }

    const multiple = rule.type === DataValidationType.LIST_MULTIPLE;
    const list = validator.getListWithColor(rule, unitId, subUnitId);
    const cellStr = localValue || getDataValidationCellValue(worksheet.getCellRaw(row, col));
    const value = deserializeListOptions(cellStr);

    const handleEdit = () => {
        commandService.executeCommand(OpenValidationPanelOperation.id, {
            ruleId: rule.uid,
        });
        hideFn();
    };

    const options = list.map((item) => ({
        label: item.label,
        value: item.label,
        color: showColor ? item.color : 'transparent',
    }));

    return (
        <SelectList
            style={{ minWidth: cellWidth, maxWidth: Math.max(cellWidth, 200) }}
            title={multiple ? localeService.t('dataValidation.listMultiple.dropdown') : localeService.t('dataValidation.list.dropdown')}
            value={value}
            multiple={multiple}
            onChange={(newValue) => {
                const str = serializeListOptions(newValue);
                const params: ISetRangeValuesCommandParams = {
                    unitId,
                    subUnitId,
                    range: {
                        startColumn: col,
                        endColumn: col,
                        startRow: row,
                        endRow: row,
                    },
                    value: {
                        v: str,
                        p: null,
                        f: null,
                        si: null,
                    },
                };

                if (editorBridgeService.isVisible()) {
                    editorBridgeService.changeVisible({
                        visible: false,
                        keycode: KeyCode.ESC,
                        eventType: DeviceInputEventType.Keyboard,
                        unitId,
                    });
                }

                commandService.executeCommand(SetRangeValuesCommand.id, params);
                setLocalValue(str);
                if (!multiple) {
                    hideFn();
                }
            }}
            options={options}
            onEdit={handleEdit}
            filter={editingText}
        />
    );
}
