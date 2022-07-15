const FileManagerPlugin = require("filemanager-webpack-plugin");
module.exports = {
    // 输出文件目录，默认dist
    // outputDir: `dist`,
    configureWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            // 生产环境下将输出文件压缩为zip
            config.plugins.push(
                new FileManagerPlugin({
                    events: {
                        onStart: {
                            delete: ['./dist/', './zip/'],
                        },
                        onEnd: {
                            archive: [
                                {
                                    source: `./dist`,
                                    destination: `./zip/my-zip.zip`
                                }
                            ]
                        }
                    }
                }),
            );
        }
    }
}
