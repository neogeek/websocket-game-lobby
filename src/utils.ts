export const generateRandomString = (
    length = 4,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
): string =>
    new Array(length)
        .fill('')
        .map(
            () =>
                characters.split('')[
                    Math.floor(Math.random() * characters.length)
                ]
        )
        .join('');

export const removeArrayItem = (array: any[], item: any): boolean => {
    const itemIndex = array.indexOf(item);

    if (itemIndex !== -1) {
        array.splice(itemIndex, 1);
        return true;
    }
    return false;
};

export const removeArrayItemWithFilter = (
    array: any[],
    filter: (item: any) => boolean
): boolean => {
    const itemIndex = array.findIndex(filter);

    if (itemIndex !== -1) {
        array.splice(itemIndex, 1);
        return true;
    }
    return false;
};

export const createUniqueGameCode = async (
    filter: (gameCode: string) => Promise<boolean>,
    length = 4,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    iterations = 10
): Promise<string> => {
    let gameCode = generateRandomString(length, characters);

    let iterationsRemaining = iterations;

    while (typeof filter === 'function' && (await filter(gameCode))) {
        gameCode = generateRandomString(length, characters);

        iterationsRemaining -= 1;

        if (iterationsRemaining <= 0) {
            throw new Error('Error creating unique game code.');
        }
    }

    return gameCode;
};
