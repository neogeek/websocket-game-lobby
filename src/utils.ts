const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const generateRandomString = (length = 4): string =>
    new Array(length)
        .fill('a')
        .map(
            () =>
                characters.split('')[
                    Math.floor(Math.random() * characters.length)
                ]
        )
        .join('');

export const removeArrayItem = (
    array: any[],
    filter: (item: any) => {}
): boolean => {
    const itemIndex = array.findIndex(filter);

    if (itemIndex !== -1) {
        array.splice(itemIndex, 1);
        return true;
    }
    return false;
};
