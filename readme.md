# koishi-plugin-maimai-potato

[![npm](https://img.shields.io/npm/v/koishi-plugin-maimai-potato?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-maimai-potato)

PotatoBot 使用的 Maimai 插件

## 使用
在安装此插件后，需要部署 [Maimai-Alias-Querier](https://github.com/lingrottin/maimai-alias-querier) 才能正常使用别名查询功能。
除此之外，你需要初始化 Python 依赖和 Maimai 资源文件（用来生成 Best 40）。
```bash
pip install -r node_modules/koishi-plugin-maimai-maibot/lib/kiba-cli/requirements.txt
```
Maimai 资源文件可以从 [University of Fool](https://uof.edu.kg/maimai-static-files.7z) 下载到，解压到 `node_modules/koishi-plugin-maimai-maibot/lib/kiba-cli/src/static` 即可。
