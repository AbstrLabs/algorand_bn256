
const { Runtime, AccountStore } = require('@algo-builder/runtime');
const { types } = require('@algo-builder/web');
const { assert } = require('chai') .use(require('chai-bytes'));
const fs = require('fs')

describe("bn128 py contract", function () {
  const fee = 1000;
  const minBalance = BigInt(1e6);
  const john = new AccountStore(minBalance + BigInt(fee));

  const txParams = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: john.account,
    appID: 0,
    payFlags: { totalFee: fee },
    appArgs: ["str:upload", new Uint8Array(fs.readFileSync('assets/tls_primary_in'))]
  };

  let runtime;
  let approvalProgramFileName;
  let clearProgramFileName;
  this.beforeAll(function () {
    runtime = new Runtime([john]); // setup test
    approvalProgramFileName = 'bn256.py';
    clearProgramFileName = 'clear.teal';

    // deploy a new app
    txParams.appID = runtime.deployApp(
      approvalProgramFileName,
      clearProgramFileName,
      {
        sender: john.account,
        globalBytes: 1,
        globalInts: 0,
        localBytes: 0,
        localInts: 0,
      },
      {}
    ).appID;

    // opt-in to the app
    runtime.optInToApp(john.address, txParams.appID, {}, {});
  });

  const key = "zkinput";

  it("should initialize state to empty bytes after opt-in", function () {
    const globalState = runtime.getGlobalState(txParams.appID, key);
    assert.isDefined(globalState);
    assert.equal(globalState, '');
  });

  it("should set state on first call", function () {
    runtime.executeTx(txParams);

    const globalState = runtime.getGlobalState(txParams.appID, key);
    console.log(globalState)
    // assert.equalBytes(globalState, readFileSYnc('assets/tls_primary_in'), 'error message');
    // assert.equal(globalState, new Uint8Array([97,98,99,100,101,102,103]));
  });
});