module.exports = {
    resolver: {
        extraNodeModules: {
            "stream": require.resolve("stream-browserify"),
            "util": require.resolve("util"),
        },
    },
};
