import { ComponentChildren } from '@univerjs/base-ui';
import { SheetPlugin } from '@univerjs/base-sheets';
import { Locale, PLUGIN_NAMES } from '@univerjs/core';
import { SHEET_UI_PLUGIN_NAME, SheetUIPlugin } from '@univerjs/ui-plugin-sheets';
import { NumfmtPlugin } from '../NumfmtPlugin';
import { FormatContent } from '../View/UI/FormatContent';
import { NumfmtModal } from '../View/UI/NumfmtModal';
import { NUMBERFORMAT, NUMFMT_PLUGIN_NAME, CURRENCYDETAIL, DATEFMTLISG } from '../Basics/Const';

interface GroupProps {
    locale: string;
    type?: string;
    label?: string;
    onClick?: () => void;
}

export interface ModalDataProps {
    name?: string;
    title?: string;
    show: boolean;
    locale: string;
    children: {
        name: string;
        props: any;
    };
    group: GroupProps[];
    modal?: ComponentChildren; // 渲染的组件
    onCancel?: () => void;
}

export class NumfmtModalController {
    protected _sheetUIPlugin: SheetUIPlugin;

    protected _sheetPlugin: SheetPlugin;

    protected _numfmtModal: NumfmtModal;

    protected _numfmtPlugin: NumfmtPlugin;

    protected _modalData: ModalDataProps[];

    constructor(numfmtPlugin: NumfmtPlugin) {
        const locale: Locale = numfmtPlugin.getGlobalContext().getLocale();
        this._numfmtPlugin = numfmtPlugin;
        this._modalData = [
            {
                locale: 'toolbar.currencyFormat',
                name: 'currency',
                group: [
                    {
                        locale: 'button.confirm',
                        type: 'primary',
                        onClick: () => {},
                    },
                    {
                        locale: 'button.cancel',
                        onClick: () => {},
                    },
                ],
                show: false,
                children: {
                    name: NUMFMT_PLUGIN_NAME + FormatContent.name,
                    props: {
                        data: this.resetContentData(CURRENCYDETAIL),
                        onClick: (value: string) => console.dir(value),
                        input: locale.get('format.decimalPlaces'),
                        onChange: (value: string) => console.dir(value),
                    },
                },
                onCancel: (): void => {
                    this.showModal('currency', false);
                },
            },
            {
                locale: 'toolbar.currencyFormat',
                name: 'date',
                group: [
                    {
                        locale: 'button.confirm',
                        type: 'primary',
                    },
                    {
                        locale: 'button.cancel',
                    },
                ],
                show: false,
                children: {
                    name: NUMFMT_PLUGIN_NAME + FormatContent.name,
                    props: {
                        data: DATEFMTLISG,
                        onClick: (value: string) => console.dir(value),
                    },
                },
                onCancel: (): void => {
                    this.showModal('currency', false);
                },
            },
            {
                locale: 'toolbar.numberFormat',
                name: 'number',
                group: [
                    {
                        locale: 'button.confirm',
                        type: 'primary',
                    },
                    {
                        locale: 'button.cancel',
                    },
                ],
                show: false,
                children: {
                    name: NUMFMT_PLUGIN_NAME + FormatContent.name,
                    props: {
                        data: NUMBERFORMAT,
                        onClick: (value: string) => console.dir(value),
                    },
                },
                onCancel: (): void => {
                    this.showModal('number', false);
                },
            },
        ];
        this._sheetPlugin = numfmtPlugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;
        this._sheetUIPlugin = numfmtPlugin.getGlobalContext().getPluginManager().getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME);
        this._sheetUIPlugin.getComponentManager().register(NUMFMT_PLUGIN_NAME + FormatContent.name, FormatContent);
        this._sheetUIPlugin.getComponentManager().register(NUMFMT_PLUGIN_NAME + NumfmtModal.name, NumfmtModal);
        this._numfmtPlugin.getObserver('onNumfmtModalDidMountObservable')!.add((component): void => {
            this._numfmtModal = component;
            this.resetModalData();
        });
    }

    resetContentData(data: any[]): any[] {
        const locale = this._numfmtPlugin.getGlobalContext().getLocale();
        for (let i = 0; i < data.length; i++) {
            if (data[i].locale) {
                data[i].label = locale.get(data[i].locale);
            }
        }
        return data;
    }

    // 渲染所需数据
    resetModalData(): void {
        const locale: Locale = this._numfmtPlugin.getGlobalContext().getLocale();
        this._modalData.forEach((item) => {
            item.title = locale.get(item.locale);
            if (item.group && item.group.length) {
                item.group.forEach((ele) => {
                    ele.label = locale.get(ele.locale);
                });
            }
        });
        this._numfmtModal.setModal(this._modalData);
    }

    showModal(name: string, show: boolean): void {
        const index: number = this._modalData.findIndex((item) => item.name === name);
        if (index > -1) {
            this._modalData[index].show = show;
            this.resetModalData();
        }
    }
}
