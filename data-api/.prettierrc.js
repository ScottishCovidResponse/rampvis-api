module.exports = {
    trailingComma: 'all',
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    bracketSpacing: true,
    printWidth: 120,
    overrides: [
        {
            files: '*.html',
            options: {
                tabWidth: 2,
            },
        },
    ],
};
