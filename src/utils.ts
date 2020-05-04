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

export const removeArrayItem = (array: any[], filter: any): boolean => {
    const itemIndex =
        typeof filter === 'function'
            ? array.findIndex(filter)
            : array.indexOf(filter);

    if (itemIndex !== -1) {
        array.splice(itemIndex, 1);
        return true;
    }
    return false;
};

export const createUniqueGameCode = (
    filter: (gameCode: string) => boolean,
    length = 4,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    iterations = 10
): string => {
    let gameCode = generateRandomString(length, characters);

    let iterationsRemaining = iterations;

    while (typeof filter === 'function' && filter(gameCode)) {
        gameCode = generateRandomString(length, characters);

        iterationsRemaining -= 1;

        if (iterationsRemaining <= 0) {
            throw new Error('Error creating unique game code.');
        }
    }

    return gameCode;
};
