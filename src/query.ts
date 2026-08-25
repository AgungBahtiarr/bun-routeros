/**
 * Helper class to build MikroTik RouterOS API commands and queries fluently.
 *
 * Example:
 * ```ts
 * const query = new RosQuery('/ip/address/print')
 *     .where('interface', 'ether1')
 *     .proplist('address', 'network', 'interface')
 *     .build();
 *
 * const data = await conn.write(query);
 * ```
 */
export class RosQuery {
    private command: string;
    private params: string[] = [];

    constructor(command: string) {
        this.command = command;
    }

    /**
     * Factory function to create a new RosQuery instance
     * @param command - The API command (e.g. '/ip/address/print')
     */
    public static cmd(command: string): RosQuery {
        return new RosQuery(command);
    }

    /**
     * Add an assignment property (=key=value)
     */
    public prop(key: string, value: any): this {
        this.params.push(`=${key}=${value}`);
        return this;
    }

    /**
     * Add multiple assignment properties from an object
     */
    public props(obj: Record<string, any>): this {
        for (const [k, v] of Object.entries(obj)) {
            if (v !== undefined && v !== null) {
                this.params.push(`=${k}=${v}`);
            }
        }
        return this;
    }

    /**
     * Add a filter condition (where key == value)
     */
    public where(key: string, value: any): this {
        this.params.push(`?${key}=${value}`);
        return this;
    }

    /**
     * Add a negated filter condition (where key != value)
     */
    public whereNot(key: string, value: any): this {
        this.params.push(`?${key}=${value}`);
        this.params.push('?#!');
        return this;
    }

    /**
     * Add a less-than filter condition (where key < value)
     */
    public whereLess(key: string, value: any): this {
        this.params.push(`?<${key}=${value}`);
        return this;
    }

    /**
     * Add a greater-than filter condition (where key > value)
     */
    public whereGreater(key: string, value: any): this {
        this.params.push(`?>${key}=${value}`);
        return this;
    }

    /**
     * Add an existence check (where property exists)
     */
    public whereExists(key: string): this {
        this.params.push(`?+${key}`);
        return this;
    }

    /**
     * Add a missing property check (where property is unset/missing)
     */
    public whereMissing(key: string): this {
        this.params.push(`?-${key}`);
        return this;
    }

    /**
     * Logical AND operator for previous 2 query conditions
     */
    public and(): this {
        this.params.push('?#&');
        return this;
    }

    /**
     * Logical OR operator for previous 2 query conditions
     */
    public or(): this {
        this.params.push('?#|');
        return this;
    }

    /**
     * Logical NOT operator for previous query condition
     */
    public not(): this {
        this.params.push('?#!');
        return this;
    }

    /**
     * Specify which fields to return using .proplist
     */
    public proplist(...fields: string[]): this {
        const list = fields
            .flatMap((f) => f.split(','))
            .map((f) => f.trim())
            .filter(Boolean)
            .join(',');
        this.params.push(`=.proplist=${list}`);
        return this;
    }

    /**
     * Add raw custom parameters
     */
    public raw(...params: string[]): this {
        this.params.push(...params);
        return this;
    }

    /**
     * Build the command array ready for `conn.write(...)`
     */
    public build(): string[] {
        return [this.command, ...this.params];
    }

    /**
     * Alias for `build()`
     */
    public toParams(): string[] {
        return this.build();
    }
}

/**
 * Convenience helper to start creating a RouterOS command query
 * @param command - The API command (e.g. '/interface/print')
 */
export function rosQuery(command: string): RosQuery {
    return new RosQuery(command);
}
