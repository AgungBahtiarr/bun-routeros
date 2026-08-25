export const debounce = (
    callback: (...args: any[]) => void,
    timeout = 0,
) => {
    let timeoutObj: NodeJS.Timeout | null = null;

    return {
        run: (...args: any[]) => {
            if (timeoutObj) clearTimeout(timeoutObj);
            timeoutObj = setTimeout(() => callback(...args), timeout);
        },

        cancel: () => {
            if (timeoutObj) {
                clearTimeout(timeoutObj);
                timeoutObj = null;
            }
        },
    };
};
