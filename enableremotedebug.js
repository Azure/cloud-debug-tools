const { execSync } = require('child_process');

function shell(cmdline) {
  var retval = execSync(cmdline, {stdio: [process.stdin, 'pipe', process.stderr]});
  return JSON.parse(retval);
}

function enableRemoteDebug(strFunctionAppId, nDebugPort = 8898) {
  console.log(`Function App:                 ${JSON.stringify(strFunctionAppId)}`);

  var objCurrentSubscription = shell('az account show');
  console.log(`Subscription Name:            ${JSON.stringify(objCurrentSubscription.name)}`);
  console.log(`Subscription ID:              ${JSON.stringify(objCurrentSubscription.id)}`);

  var arrFunctionApps = shell('az functionapp list --query "[].{name: name, resourceGroup: resourceGroup}"');
  var objFunctionApps = {};
  for (var i = 0; i < arrFunctionApps.length; i++) {
    objFunctionApps[arrFunctionApps[i].name.toLowerCase()] = arrFunctionApps[i];
  }

  if (!objFunctionApps.hasOwnProperty(strFunctionAppId.toLowerCase())) {
    console.error(`ERROR: cannot find ${JSON.stringify(strFunctionAppId)} under current subscription ${JSON.stringify(objCurrentSubscription.name)}`)
    return -1;
  }
  var strResourceGroup = objFunctionApps[strFunctionAppId.toLowerCase()].resourceGroup;
  console.log(`Resource Group:               ${JSON.stringify(strResourceGroup)}`);

  process.stdout.write(`Switch to 64bit:              `);
  shell(`az resource update --id /subscriptions/${objCurrentSubscription.id}/resourceGroups/${strResourceGroup}/providers/Microsoft.Web/sites/${strFunctionAppId}/config/web --set properties.use32BitWorkerProcess=false`);
  console.log(`done`);

  process.stdout.write(`Enable WebSocket:             `);
  shell(`az resource update --id /subscriptions/${objCurrentSubscription.id}/resourceGroups/${strResourceGroup}/providers/Microsoft.Web/sites/${strFunctionAppId}/config/web --set properties.webSocketsEnabled=true`);
  console.log(`done`);

  process.stdout.write(`Set JAVA_OPTS:                `);
  shell(`az webapp config appsettings set --resource-group ${strResourceGroup} --name ${strFunctionAppId} --settings JAVA_OPTS="-Djava.net.preferIPv4Stack=true -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=127.0.0.1:${nDebugPort}"`);
  console.log(`done`);

  process.stdout.write(`Set HTTP_PLATFORM_DEBUG_PORT: `);
  shell(`az webapp config appsettings set --resource-group ${strResourceGroup} --name ${strFunctionAppId} --settings HTTP_PLATFORM_DEBUG_PORT=${nDebugPort}`);
  console.log(`done`);

  console.log();
  console.log(`Remote debugging is now enabled on ${JSON.stringify(strFunctionAppId)}`);
  return 0;
}

// TODO: we might want to integrate this feature into "az functionapp debug on|off"
var argv = process.argv.slice(1);
if (argv.length !== 2) {
  console.log([
    'Usage: enableremotedebug <function name>',
    '',
    'Sample:',
    '',
    '    enableremotedebug my-function',
    '    enableremotedebug my-function.azurewebsites.net',
    '',
  ].join('\r\n'));
  process.exit(-1);
}

var functionId = argv[1];
var idx = functionId.indexOf('.');
if (idx !== -1) {
  functionId = functionId.slice(0, idx);
}

// TODO: need to consider global Azure vs. regional data centers and Edge
process.exit(enableRemoteDebug(functionId));
