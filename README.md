# cloud-debug-tools

> A set of cross platform command line tools which provide support for cloud debugging and diagnostics.

*Issues with the output should be reported on the <https://github.com/Azure/cloud-debug-tools/issues>.*


## Supported Features
* Java remote debugging for [Azure Functions](https://azure.microsoft.com/services/functions/) ([learn more](https://docs.microsoft.com/azure/azure-functions/functions-create-first-java-maven))

## Install

[Node.js](https://nodejs.org/) LTS version or higher is required.
```
$ npm install --global cloud-debug-tools
```


## Usage

```
Usage: dbgproxy <FQDN> [<binding host>:<port>]

Sample:

    dbgproxy my-function.azurewebsites.net
    dbgproxy my-function.azurewebsites.net *:8000
    dbgproxy my-function.azurewebsites.net 0.0.0.0:8898
    dbgproxy my-function.azurewebsites.net 127.0.0.1:8898
    dbgproxy my-function.azurewebsites.net localhost:8898

dbgproxy@0.9.0 E:\Enlist\cloud-debug-tools\dbgproxy
```

## Contributing
[MIT License](./LICENSE.txt)

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
