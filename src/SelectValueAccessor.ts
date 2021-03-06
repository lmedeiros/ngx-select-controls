import {Injectable, EventEmitter} from "@angular/core";
import {ControlValueAccessor} from "@angular/forms";

@Injectable()
export class SelectValueAccessor implements ControlValueAccessor {

    // -------------------------------------------------------------------------
    // Public Properties
    // -------------------------------------------------------------------------

    multiple: boolean = false;
    modelWrites = new EventEmitter<any>();
    trackBy: string|((item1: any, item2: any) => boolean);
    valueBy: string|((item: any) => string);

    // -------------------------------------------------------------------------
    // Private Properties
    // -------------------------------------------------------------------------

    private _model: any;
    private onChange: (m: any) => void;
    private onTouched: (m: any) => void;

    // -------------------------------------------------------------------------
    // Implemented from ControlValueAccessor
    // -------------------------------------------------------------------------

    writeValue(value: any): void {
        this._model = value;
        this.modelWrites.emit(value);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    
    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    get isEnabled() {
        return !!this.onChange;
    }

    get model() {
        return this._model;
    }
    
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    set(value: any) {
        this._model = value;
        this.onChange(this._model);
    }
    
    add(value: any) {
        if (!this.has(value)) {
            if (this._model instanceof Array) {
                this._model.push(value);
            } else {
                this._model = [value];
            }
            this.onChange(this._model);
        }
    }

    remove(value: any) {
        // value = this.extractModelValue(value);
        if (!(this._model instanceof Array)) return;
        if (this.trackBy) {
            const item = this._model.find((i: any) => {
                if (this.trackBy instanceof Function) {
                    return (this.trackBy as ((item1: any, item2: any) => boolean))(i, value);
                } else {
                    return i[this.trackBy as string] === value[this.trackBy as string];
                }
            });
            this.removeAt(this._model.indexOf(item));
        } else {
            const item = this._model.find((i: any) => {
                return i === value;
            });
            this.removeAt(this._model.indexOf(item));
        }
    }

    removeAt(index: number): boolean {
        if (!this._model || index < 0 || (index > this._model.length - 1))
            return false;

        this._model.splice(index, 1);
        this.onChange(this._model);
    }

    clear() {
        if (this._model instanceof Array) {
            this._model.splice(0, this._model.length);
        } else {
            this._model = undefined;
        }
    }

    addAt(value: any, index: number): boolean {
        if (!this._model || index < 0)
            return false;

        this._model.splice(index, 0, value);
        this.onChange(this._model);
    }

    addOrRemove(value: any) {
        if (this.has(value)) {
            this.remove(value);
        } else {
            this.add(value);
        }
    }

    has(value: any): boolean {
        return this.get(value) !== undefined;
    }

    get(value: any): boolean {
        // value = this.extractModelValue(value);
        if (this._model instanceof Array) {
            if (this.trackBy) {
                return this._model.find((i: any) => {
                    if (this.trackBy instanceof Function) {
                        return (this.trackBy as ((item1: any, item2: any) => boolean))(i, value);
                    } else {
                        return i[this.trackBy as string] === value[this.trackBy as string];
                    }
                });
            } else {
                return this._model.find((i: any) => {
                    return i === value;
                });
            }

        } else if (this._model !== null && this._model !== undefined) {
            if (this.trackBy) {
                if (this.trackBy instanceof Function) {
                    return (this.trackBy as ((item1: any, item2: any) => boolean))(this._model, value) ? this._model : undefined;
                } else {
                    return this._model[this.trackBy as string] === value[this.trackBy as string] ? this._model[this.trackBy as string] : undefined;
                }
            } else {
                return this._model === value ? this._model : undefined;
            }
        }
        
        return undefined;
    }

    addMany(values: any[]): void {
        if (!values || !values.length) return;
        values.forEach(value => this.add(value));
    }

    removeMany(values: any[]): void {
        if (!values || !values.length) return;
        values.forEach(value => this.remove(value));
    }

    hasMany(values: any[]): boolean {
        if (!values || !values.length) return false;

        let has = true;
        values.forEach(item => {
            if (has)
                has = this.has(item.value);
        });
        return has;
    }

    extractModelValue(model: any) {
        if (this.valueBy) {
            return this.extractValue(model, this.valueBy);
        } else {
            return model;
        }
    }

    private extractValue(model: any, value: string|((item: any) => string)) {
        if (value instanceof Function) {
            return (value as (item: any) => any)(model);
        } else {
            return model[value as string];
        }
    }

}